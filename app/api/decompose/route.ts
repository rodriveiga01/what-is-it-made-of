import { NextResponse } from "next/server";
import { DecomposeRequestSchema, sanitizeResponse } from "@/lib/schema";
import { cacheGet, cacheSet, dedup } from "@/lib/cache";
import { rateLimit } from "@/lib/ratelimit";
import { cacheKey, denudedQuery, isNonPhysical, normalizeQuery } from "@/lib/normalize";
import { decomposeWithGemini } from "@/lib/gemini";
import { generateFallback, lookupFallback } from "@/lib/fallback";

// Serverless-friendly: fail fast instead of holding a function instance.
export const maxDuration = 30;

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "invalid_request" }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = DecomposeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { query, path } = parsed.data;
  const depth = path.length;
  if (depth > 6) {
    return NextResponse.json({ error: "too_deep" }, { status: 400 });
  }
  const norm = normalizeQuery(query);
  if (!norm || !denudedQuery(query)) {
    return NextResponse.json(
      {
        error: "non_physical",
        message:
          "I take apart physical things — try an object like a toaster, a sneaker, or a saxophone.",
      },
      { status: 422 },
    );
  }
  if (isNonPhysical(query)) {
    return NextResponse.json(
      {
        error: "non_physical",
        message:
          "I take apart physical things — try an object like a toaster, a sneaker, or a saxophone.",
      },
      { status: 422 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    const retryAfter = String(rl.retryAfter ?? 30);
    return NextResponse.json(
      { error: "rate_limited", retryAfter: Number(retryAfter) },
      { status: 429, headers: { "Retry-After": retryAfter } },
    );
  }

  const key = cacheKey(query, path);
  const hit = cacheGet<{ data: Record<string, unknown> }>(key);
  if (hit) {
    return NextResponse.json({ ...hit.data, cached: true });
  }

  try {
    const data = await dedup(key, async () => {
      // Curated KB first: instant, hand-tuned, no cost. Live AI for the
      // long tail of arbitrary objects, generic fallback as last resort.
      const curated = lookupFallback(norm);
      if (curated) return { ...sanitizeResponse(curated), source: "curated" as const };
      if (process.env.GEMINI_API_KEY) {
        try {
          const live = await decomposeWithGemini(norm, path, depth);
          return { ...live, source: "ai" as const };
        } catch (err) {
          // Log only the failure reason — never the key or full prompt.
          console.warn(`[decompose] live AI miss (depth ${depth}):`, err instanceof Error ? err.message.slice(0, 120) : "unknown");
        }
      }
      return { ...sanitizeResponse(generateFallback(norm, path, depth)), source: "fallback" as const };
    });
    // Never cache generic fallbacks long-term: they would shadow a real AI
    // answer once upstream quota recovers. Curated + AI results are stable.
    if ((data as { source?: string }).source !== "fallback") {
      cacheSet(key, { data });
    }
    return NextResponse.json({ ...data, cached: false });
  } catch {
    // Safe fallback — never crash the UI
    const fb = sanitizeResponse(generateFallback(norm, path, depth));
    return NextResponse.json({ ...fb, cached: false, source: "fallback" });
  }
}
