import { sanitizeResponse, type DecomposeResponse } from "./schema";
import { SYSTEM, buildPrompt } from "./gemini";

/** Second live provider behind Gemini: Groq's free developer tier over its
 *  OpenAI-compatible endpoint. Plain fetch — no extra dependency.
 *  Throws on any failure so the route can fall through to local fallback. */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function decomposeWithGroq(
  query: string,
  path: string[],
  depth: number,
): Promise<DecomposeResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("missing_key");
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

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
        // Teardowns are small: cap output so verbosity can't burn tokens.
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${SYSTEM}\nReturn a single JSON object with keys: normalizedName, summary, components, materials, funFact, originHint.` },
          { role: "user", content: buildPrompt(query, path, depth) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`groq_${res.status}`);
    const j = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = j.choices?.[0]?.message?.content ?? "";
    return sanitizeResponse(JSON.parse(text));
  } finally {
    clearTimeout(timer);
  }
}
