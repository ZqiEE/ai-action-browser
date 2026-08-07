import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Omniprompt } from "@/components/Omniprompt";
import { ApiError, searchWeb, type LiveSearchResponse } from "@/lib/api";
import { addBrowserPageContext, readBrowserPageContext } from "@/lib/browserContext";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "AI browser";
  const pageContext = useMemo(() => readBrowserPageContext(searchParams), [searchParams]);
  const compareUrl = useMemo(() => {
    const params = addBrowserPageContext(
      new URLSearchParams({ mode: "compare", q: query }),
      pageContext,
    );
    return `/compare?${params.toString()}`;
  }, [pageContext, query]);
  const [result, setResult] = useState<LiveSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setResult(null);

    searchWeb(query, pageContext)
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
  }, [pageContext, query]);

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

      {pageContext && (
        <div className="inline-alert" role="note">
          <strong>Using current page context for this request</strong>
          <p>{pageContext.title} · {pageContext.hostname}</p>
          <p>
            The page title and privacy-bounded URL are sent as transient request context. They are
            not merged into the user goal.
          </p>
        </div>
      )}

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
          <p>The browser did not substitute cached or fixture results for the failed live request.</p>
        </div>
      )}

      {result && (
        <div className="browser-result-layout">
          <main className="search-results" aria-label={`Results for ${query}`}>
            <p className="search-results__summary">
              {result.results.length} live results for “{query}” · {result.durationMs} ms
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
            <Link className="button button--primary" to={compareUrl}>
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
