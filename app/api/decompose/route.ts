import { NextResponse } from "next/server";
import { DecomposeRequestSchema, sanitizeResponse } from "@/lib/schema";
import { cacheGet, cacheSet, dedup } from "@/lib/cache";
import { rateLimit } from "@/lib/ratelimit";
import { cacheKey, denudedQuery, isNonPhysical, normalizeQuery } from "@/lib/normalize";
import { decomposeWithGemini } from "@/lib/gemini";
import { decomposeWithGroq } from "@/lib/groq";

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
  const { query, path, prefetch } = parsed.data;
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
  const key = cacheKey(query, path);
  const hit = cacheGet<{ data: Record<string, unknown> }>(key);
  if (hit) {
    return NextResponse.json({ ...hit.data, cached: true });
  }

  // Rate budget protects paid calls only: cache hits already returned, and
  // prefetch can never reach a live provider, so neither consumes budget.
  // Without this, hovering cards starves real dives of their 20 req/min.
  if (!prefetch) {
    const rl = rateLimit(ip);
    if (!rl.ok) {
      const retryAfter = String(rl.retryAfter ?? 30);
      return NextResponse.json(
        { error: "rate_limited", retryAfter: Number(retryAfter) },
        { status: 429, headers: { "Retry-After": retryAfter } },
      );
    }
  }

  try {
    const data = await dedup(key, async () => {
      // AI-only: no canned content anywhere — the app presents, the model
      // thinks. Cache serves repeats for free. Prefetch never spends tokens.
      if (!prefetch && process.env.GEMINI_API_KEY) {
        try {
          const live = await decomposeWithGemini(norm, path, depth);
          return { ...live, source: "ai" as const };
        } catch (err) {
          // Log only the failure reason — never the key or full prompt.
          console.warn(`[decompose] live AI miss (depth ${depth}):`, err instanceof Error ? err.message.slice(0, 300) : "unknown");
        }
      }
      // Second provider: Groq free tier. Same sanitized shape, same cache rules.
      if (!prefetch && process.env.GROQ_API_KEY) {
        try {
          const live = await decomposeWithGroq(norm, path, depth);
          return { ...live, source: "ai" as const };
        } catch (err) {
          console.warn(`[decompose] groq miss (depth ${depth}):`, err instanceof Error ? err.message.slice(0, 300) : "unknown");
        }
      }
      // Honest failure — the UI shows retry, never fake parts.
      throw new Error("ai_unavailable");
    });
    cacheSet(key, { data });
    return NextResponse.json({ ...data, cached: false });
  } catch {
    // Prefetch misses are silent by design (the UI ignores them); real
    // requests surface as a retryable error, never invented content.
    if (prefetch) return NextResponse.json({ error: "prefetch_skip" }, { status: 503 });
    return NextResponse.json(
      {
        error: "ai_unavailable",
        message: "The teardown engine is unreachable — API quota may be spent. Wait a bit and retry.",
      },
      { status: 503 },
    );
  }
}
