import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Omniprompt } from "@/components/Omniprompt";
import { ApiError, searchWeb, type LiveSearchResponse } from "@/lib/api";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "AI browser";
  const [result, setResult] = useState<LiveSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setResult(null);

    searchWeb(query)
      .then((value) => {
        if (active) setResult(value);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof ApiError
            ? reason.message
            : "Live search could not be completed. No fixture results were substituted.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div className="browser-result-page">
      <header className="browser-result-header">
        <p className="eyebrow">Normal web search</p>
        <h1>Search results</h1>
        <p>
          Search does not silently visit multiple sites, fill forms, or prepare a transaction.
          Choose Compare explicitly when you want the browser to gather and rank provider evidence.
        </p>
      </header>

      <Omniprompt initialValue={query} compact />

      {loading && (
        <div className="task-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Searching the live Web…</span>
        </div>
      )}

      {error && (
        <div className="inline-alert inline-alert--danger" role="alert">
          <strong>Search unavailable</strong>
          <p>{error}</p>
          <p>The browser did not replace the failed request with demonstration results.</p>
        </div>
      )}

      {result && (
        <div className="browser-result-layout">
          <main className="search-results" aria-label={`Results for ${query}`}>
            <p className="search-results__summary">
              {result.results.length} live results for “{result.query}” · {result.durationMs} ms
            </p>
            {result.results.map((item) => (
              <article className="search-result" key={item.id}>
                <p className="search-result__url">{item.displayUrl}</p>
                <h2>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h2>
                <p>{item.snippet}</p>
                <div className="search-result__meta">
                  <span>{item.sourceType}</span>
                  <span>{item.age || "Live search result"}</span>
                </div>
              </article>
            ))}
          </main>

          <aside className="browser-action-panel" aria-label="Continue this browser task">
            <p className="eyebrow">Do more with this goal</p>
            <h2>Compare provider evidence</h2>
            <p>
              Compare creates a separate task, reads only active provider offers, and ranks them
              without commission, bids, partner level, or expected revenue.
            </p>
            <Link
              className="button button--primary"
              to={`/compare?mode=compare&q=${encodeURIComponent(query)}`}
            >
              Compare with evidence
            </Link>
            <Link className="button button--secondary" to="/">
              Start a different task
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
