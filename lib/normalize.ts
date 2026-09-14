const LEAD_STRIP =
  /^(please|take apart|disassemble|decompose|explore|show me|tell me about|inside of|inside|parts? of|what is inside|what's inside|whats inside|what is|whats|how is|how are|how does|how do|the inside of|the|a|an|my|your|modern|brand new|new)\s+/i;

const TAIL_STRIP = /\s+(made(\s+(of|from|up of|out of))?|built|manufactured)\??\s*$/i;

export function normalizeQuery(s: string): string {
  let n = s.toLowerCase().trim().replace(/\s+/g, " ");
  // strip trailing punctuation first so tail words match
  n = n.replace(/[?!.\u2026]+$/g, "").trim();
  let prev = "";
  let guard = 0;
  while (n !== prev && guard++ < 6) {
    prev = n;
    n = n.replace(LEAD_STRIP, "").trim();
    n = n.replace(TAIL_STRIP, "").trim();
    n = n.replace(/[?!.\u2026]+$/g, "").trim();
  }
  return n.replace(/\s+/g, " ").trim();
}

/** Single canonical cache key for a layer. JSON encoding avoids collisions
 *  where a query containing ">" could mimic a multi-segment path. */
export function layerKey(parts: string[]): string {
  const normed = parts.map((p) => normalizeQuery(p) || p.toLowerCase().trim().replace(/\s+/g, " ")).filter(Boolean);
  return `v3:${JSON.stringify(normed)}`;
}

export function cacheKey(query: string, path: string[]): string {
  return layerKey([...path, query]);
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

/** The query with markup/control/invisible chars removed. If nothing
 *  meaningful remains (e.g. pure "<img onerror=...>" payloads), returns "". */
export function denudedQuery(s: string): string {
  return normalizeQuery(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ABSTRACT = new Set([
  "love", "happiness", "sadness", "democracy", "freedom", "justice",
  "idea", "dream", "consciousness", "time", "philosophy", "religion",
  "god", "soul", "emotion", "thought", "memory", "language", "math",
  "mathematics", "economy", "capitalism", "communism", "politics",
]);

export function isNonPhysical(query: string): boolean {
  const n = normalizeQuery(query);
  if (ABSTRACT.has(n)) return true;
  if (/^(why|when|who|how to|what is the meaning)/i.test(query.trim())) return true;
  return false;
}
