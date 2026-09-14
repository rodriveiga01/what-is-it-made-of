import { sanitizeResponse, type DecomposeResponse } from "./schema";
import { SYSTEM, buildPrompt } from "./gemini";

/** Second live provider behind Gemini: Groq's free developer tier over its
 *  OpenAI-compatible endpoint. Plain fetch — no extra dependency.
 *  Throws on any failure so the route can answer honestly (retry, no fakes). */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function cleanJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    // Raw control characters (literal newlines etc.) are invalid inside
    // JSON strings and models emit them — strip, keep escaped sequences.
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

export async function decomposeWithGroq(
  query: string,
  path: string[],
  depth: number,
): Promise<DecomposeResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("missing_key");
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const basePrompt = buildPrompt(query, path, depth);

  let lastErr: unknown = new Error("groq_failed");
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          // Reasoning model: cap low so it answers instead of thinking.
          // Measured ~20 reasoning tokens vs ~900 on default — the teardown
          // itself is only ~300 tokens. 2500 is headroom, rarely filled.
          reasoning_effort: "low",
          max_tokens: 2500,
          // NOTE: no response_format — several Groq-hosted models reject
          // json_object mode with 400. The prompt demands raw JSON instead,
          // and sanitizeResponse coerces any off-enum values below.
          messages: [
            { role: "system", content: `${SYSTEM}\nReturn a single JSON object with keys: normalizedName, summary, components, materials. No markdown fences, no commentary.` },
            {
              role: "user",
              content:
                attempt === 0
                  ? basePrompt
                  : `${basePrompt}\n\nPrevious response was not valid JSON. Return ONLY valid JSON matching the schema. No markdown fences, no commentary.`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`groq_${res.status}`);
      const j = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return sanitizeResponse(JSON.parse(cleanJson(j.choices?.[0]?.message?.content ?? "")));
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : "";
      // Transport/client errors won't heal in one second — retrying just
      // burns another call. Only malformed-JSON responses earn a repair
      // retry, which reuses the same already-spent reasoning cheaply.
      if (attempt === 1 || /groq_\d+|missing_key|abort/i.test(msg)) throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
