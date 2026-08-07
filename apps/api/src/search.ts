import { discoveryGoal, normalizeBrowserPageContext } from "./browser-context";
import { ApiError, cleanText, fetchWithTimeout, json, parsePublicHttpUrl, readJson } from "./http";
import type { Env, SearchRequest } from "./types";

export async function searchWeb(request: Request, env: Env): Promise<Response> {
  if (!env.BRAVE_SEARCH_API_KEY) {
    throw new ApiError(503, "search_not_configured", "Live search is not configured.");
  }

  const body = await readJson<SearchRequest>(request, 20 * 1024);
  const query = cleanText(body.query, 500);
  if (!query) throw new ApiError(400, "invalid_query", "A search query is required.");

  const pageContext = normalizeBrowserPageContext(body.pageContext);
  const upstreamQuery = discoveryGoal(query, pageContext, 900);
  const requestedCount =
    typeof body.count === "number" && Number.isFinite(body.count) ? Math.floor(body.count) : 8;
  const count = Math.max(1, Math.min(10, requestedCount));

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", upstreamQuery);
  url.searchParams.set("count", String(count));
  url.searchParams.set("safesearch", "moderate");

  const startedAt = Date.now();
  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      url,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": env.BRAVE_SEARCH_API_KEY,
        },
      },
      8_000,
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(504, "search_timeout", "The search provider timed out.");
    }
    throw new ApiError(502, "search_provider_error", "The search provider could not be reached.");
  }

  if (!upstream.ok) {
    throw new ApiError(
      502,
      "search_provider_error",
      "The search provider could not complete the request.",
    );
  }

  const data = (await upstream.json()) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string; age?: string }> };
  };
  const results = (data.web?.results ?? []).flatMap((result, index) => {
    const resultUrl = parsePublicHttpUrl(result.url);
    const title = cleanText(result.title, 300);
    if (!resultUrl || !title) return [];
    return [
      {
        id: `search_${index}_${crypto.randomUUID()}`,
        title,
        url: resultUrl.toString(),
        displayUrl: resultUrl.hostname,
        snippet: cleanText(result.description, 1_000),
        sourceType: "web",
        age: cleanText(result.age, 80) || null,
      },
    ];
  });

  return json(request, env, {
    query,
    results,
    source: "brave_web_search",
    durationMs: Date.now() - startedAt,
    pageContextUsed: pageContext !== null,
  });
}
