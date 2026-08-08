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
      <section className="task-toolbar" aria-label="Current browser task">
        <Omniprompt initialValue={query} compact />
      </section>

      {pageContext && (
        <div className="context-strip" role="note">
          <strong>Current page</strong>
          <span>{pageContext.title}</span>
          <span>{pageContext.hostname}</span>
        </div>
      )}

      {loading && (
        <p className="quiet-status" role="status" aria-live="polite">Searching the live web…</p>
      )}

      {error && (
        <div className="inline-alert inline-alert--danger" role="alert">
          <strong>Search unavailable</strong>
          <p>{error}</p>
          <p>No cached or fixture result was substituted.</p>
        </div>
      )}

      {result && (
        <section className="search-workspace">
          <header className="result-toolbar">
            <p className="search-results__summary">
              {result.results.length} results · {result.durationMs} ms
            </p>
            <div className="result-toolbar__actions">
              <Link className="button button--secondary" to={compareUrl}>Compare this goal</Link>
              <Link className="button button--quiet" to="/">New task</Link>
            </div>
          </header>

          <main className="search-results" aria-label={`Results for ${query}`}>
            {result.results.map((item) => (
              <article className="search-result" key={item.id}>
                <p className="search-result__url">{item.displayUrl}</p>
                <h2>
                  <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                </h2>
                <p>{item.snippet}</p>
                <div className="search-result__meta">
                  <span>{item.age || "Live result"}</span>
                </div>
              </article>
            ))}
          </main>
        </section>
      )}
    </div>
  );
}
