const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 20;
const WINDOW = 60_000;

function prune(now: number): void {
  if (hits.size < 500) return;
  for (const [k, v] of hits) {
    if (now > v.reset) hits.delete(k);
  }
}

export function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  prune(now);
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW });
    return { ok: true };
  }
  if (e.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((e.reset - now) / 1000) };
  }
  e.count += 1;
  return { ok: true };
}
