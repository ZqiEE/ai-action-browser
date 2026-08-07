import { cleanText, fetchWithTimeout } from "./http";
import type { Constraints, Env } from "./types";

function parseBudget(query: string): number | null {
  const patterns = [
    /(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*\$?\s*([\d,]+)/i,
    /\$\s*([\d,]+)/,
    /([\d,]+)\s*(?:usd|dollars?|美元)/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    const raw = match?.[1]?.replaceAll(",", "");
    if (!raw) continue;
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0 && value < 1_000_000) return value;
  }
  return null;
}

export function fallbackConstraints(query: string): Constraints {
  const lower = query.toLowerCase();
  return {
    budget: parseBudget(query),
    useCase: lower.includes("video edit") || query.includes("视频剪辑") ? "video editing" : "not specified",
    delivery: lower.includes("next week") || query.includes("下周") ? "by next week" : "not specified",
    returns: lower.includes("free return") || query.includes("免费退") ? "free returns" : "not specified",
  };
}

function extractResponseText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const output = (value as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const candidate = part as { type?: unknown; text?: unknown };
      if (candidate.type === "output_text" && typeof candidate.text === "string") {
        return candidate.text;
      }
    }
  }
  return null;
}

export async function extractConstraints(query: string, env: Env): Promise<Constraints> {
  const fallback = fallbackConstraints(query);
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return fallback;

  try {
    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          store: false,
          max_output_tokens: 200,
          input: [
            {
              role: "system",
              content:
                "Extract only comparison constraints explicitly stated by the user. Do not invent requirements. `useCase` is the explicit intended purpose or use, `delivery` is only an explicit timing/arrival requirement, and `returns` is only an explicit return/refund/cancellation requirement. Use `not specified` when a field is absent. Return only the requested JSON schema.",
            },
            { role: "user", content: query },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "comparison_constraints",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  budget: { type: ["number", "null"] },
                  useCase: { type: "string" },
                  delivery: { type: "string" },
                  returns: { type: "string" },
                },
                required: ["budget", "useCase", "delivery", "returns"],
              },
            },
          },
        }),
      },
      6_000,
    );

    if (!response.ok) return fallback;
    const text = extractResponseText(await response.json());
    if (!text) return fallback;
    const parsed = JSON.parse(text) as Partial<Constraints>;
    return {
      budget:
        typeof parsed.budget === "number" && Number.isFinite(parsed.budget)
          ? parsed.budget
          : fallback.budget,
      useCase: cleanText(parsed.useCase, 120) || fallback.useCase,
      delivery: cleanText(parsed.delivery, 120) || fallback.delivery,
      returns: cleanText(parsed.returns, 120) || fallback.returns,
    };
  } catch {
    return fallback;
  }
}
