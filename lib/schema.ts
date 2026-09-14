import { z } from "zod";

export const ComponentType = z.enum(["assembly", "component", "material", "element"]);
export type ComponentType = z.infer<typeof ComponentType>;

export const IconHint = z.enum([
  "gear", "motor", "blade", "circuit", "wire", "metal", "plastic",
  "housing", "fastener", "magnet", "coil", "sensor", "power",
  "filter", "tube", "box", "raw", "gem", "liquid", "glass", "wood", "fabric",
]);
export type IconHint = z.infer<typeof IconHint>;

const ICON_ALLOW: ReadonlySet<string> = new Set(IconHint.options);

/** Strip markup, control chars, and invisible direction/format characters
 *  (bidi overrides, zero-width, BOM) that could hide malicious text. */
const cleanText = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .trim();

/** Validate an untrusted cached layer (e.g. from localStorage). Null if invalid. */
export function safeLayer(raw: unknown): DecomposeResponse | null {
  const parsed = DecomposeResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  try {
    return sanitizeResponse(parsed.data);
  } catch {
    return null;
  }
}

const VALID_TYPES = new Set(ComponentType.options);
const VALID_RARITIES = new Set(["common", "uncommon", "rare"]);

export const ComponentSchema = z.object({
  name: z.string().min(2).max(48).transform(cleanText),
  description: z.string().min(8).max(160).transform(cleanText),
  // Tolerant enums: models (esp. newer ones) often return "Mechanical" or
  // "Uncommon" despite schema hints. Coerce instead of rejecting the layer.
  type: z.string().max(24).default("component").transform((s) => {
    const t = s.toLowerCase().trim();
    return (VALID_TYPES.has(t as ComponentType) ? t : "component") as ComponentType;
  }),
  iconHint: z.string().max(24).default("box").transform((s) => {
    return ICON_ALLOW.has(s) ? s : ICON_ALLOW.has(s.toLowerCase().trim()) ? s.toLowerCase().trim() : "box";
  }),
  rarity: z.string().max(16).default("common").transform((s) => {
    const r = s.toLowerCase().trim();
    return VALID_RARITIES.has(r) ? r : ("common" as const);
  }),
  isTerminal: z.union([z.boolean(), z.string().transform((s) => s.toLowerCase().trim() === "true")]).default(false),
});
export type DecompComponent = z.infer<typeof ComponentSchema>;

export const DecomposeResponseSchema = z.object({
  normalizedName: z.string().min(2).max(64).transform(cleanText),
  summary: z.string().min(8).max(220).transform(cleanText),
  components: z.array(ComponentSchema).min(3).max(10),
  materials: z.array(z.string().min(1).max(40).transform(cleanText)).max(6).default([]),
  funFact: z.string().max(220).transform(cleanText).default(""),
  originHint: z.string().max(220).transform(cleanText).optional(),
});
export type DecomposeResponse = z.infer<typeof DecomposeResponseSchema>;

export const DecomposeRequestSchema = z.object({
  query: z.string().trim().min(1).max(80),
  path: z.array(z.string().trim().min(1).max(80)).max(6).default([]),
  // Cache-warm only: serve cache/curated/instant content, never spend tokens.
  prefetch: z.boolean().optional().default(false),
});
export type DecomposeRequest = z.infer<typeof DecomposeRequestSchema>;

/** Semantic validation: dedup, clamp, slice. Returns issues list. */
export function sanitizeResponse(raw: unknown): DecomposeResponse {
  // Pre-normalize: live models (esp. non-Gemini ones) omit fields or use
  // their own enum words. Fill shapes here so one missing description
  // doesn't nuke an otherwise good layer; the filters below still drop
  // anything genuinely unusable, and <3 survivors throws as before.
  const pre = (raw && typeof raw === "object" ? { ...(raw as Record<string, unknown>) } : {}) as Record<string, unknown>;
  if (Array.isArray(pre.components)) {    pre.components = pre.components
      .filter((c) => c && typeof c === "object" && typeof (c as Record<string, unknown>).name === "string")
      .map((c) => {
        const o = c as Record<string, unknown>;
        return {
          name: o.name,
          description: typeof o.description === "string" ? o.description : "",
          type: typeof o.type === "string" ? o.type : "component",
          iconHint: typeof o.iconHint === "string" ? o.iconHint : "box",
          rarity: typeof o.rarity === "string" ? o.rarity : "common",
          isTerminal: typeof o.isTerminal === "boolean" ? o.isTerminal : false,
        };
      });
  }
  // Materials arrive as objects/maps from some models — keep strings only.
  if (Array.isArray(pre.materials)) {
    pre.materials = pre.materials.filter((m): m is string => typeof m === "string");
  } else if (typeof pre.materials === "string") {
    pre.materials = [pre.materials];
  } else {
    delete pre.materials;
  }
  const parsed = DecomposeResponseSchema.parse(pre);
  const seen = new Set<string>();
  const deduped: DecompComponent[] = [];
  for (const c of parsed.components) {
    // cleanText runs as a zod transform, so emptiness can only be judged here.
    if (!c.name || !c.description) continue;
    if (hasProcessWord(c.name)) continue;
    const key = c.name.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }
  // If process-word filtering gutted the layer, fall back to dedup-only
  // rather than failing the min(3) contract downstream.
  const usable =
    deduped.length >= 3
      ? deduped
      : (() => {
          const s2 = new Set<string>();
          const out: DecompComponent[] = [];
          for (const c of parsed.components) {
            const key = c.name.toLowerCase().replace(/\s+/g, " ").trim();
            if (!key || s2.has(key)) continue;
            s2.add(key);
            out.push(c);
          }
          return out;
        })();
  // Keep assemblies first, then rest; cap at 8
  usable.sort((a, b) => {
    const rank = (t: string) =>
      t === "assembly" ? 0 : t === "component" ? 1 : t === "material" ? 2 : 3;
    return rank(a.type) - rank(b.type);
  });
  const components = usable.slice(0, 8);
  if (components.length < 3) throw new Error("too_few_components");
  return {
    ...parsed,
    normalizedName: parsed.normalizedName || "Unknown Object",
    materials: parsed.materials.filter(Boolean),
    components,
  };
}

const PROCESS_DENY = [
  "process", "molding", "moulding", "casting", "welding",
  "manufacturing", "assembly line", "fabrication",
];

export function hasProcessWord(name: string): boolean {
  const n = name.toLowerCase();
  return PROCESS_DENY.some((w) => n.includes(w));
}
