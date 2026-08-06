import { Link, useSearchParams } from "react-router";
import { Omniprompt } from "@/components/Omniprompt";
import { demoSearchResults } from "@/data/browser";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "AI browser";

  return (
    <div className="browser-result-page">
      <header className="browser-result-header">
        <p className="eyebrow">Normal web search</p>
        <h1>Search results</h1>
        <p>
          Search does not silently visit multiple sites, fill forms, or prepare a transaction.
          Choose Compare or Prepare explicitly when you want the browser to do more.
        </p>
      </header>

      <Omniprompt initialValue={query} compact />

      <p className="demo-banner" role="note">
        Demonstration results only. The live search and extraction service is not connected yet.
      </p>

      <div className="browser-result-layout">
        <main className="search-results" aria-label={`Results for ${query}`}>
          <p className="search-results__summary">Showing demo web results for “{query}”</p>
          {demoSearchResults.map((result) => (
            <article className="search-result" key={result.id}>
              <p className="search-result__url">{result.displayUrl}</p>
              <h2>
                <a href={result.url} target="_blank" rel="noreferrer">
                  {result.title}
                </a>
              </h2>
              <p>{result.snippet}</p>
              <div className="search-result__meta">
                <span>{result.sourceType}</span>
                <span>Demo evidence · {new Date(result.retrievedAt).toLocaleString()}</span>
              </div>
            </article>
          ))}
        </main>

        <aside className="browser-action-panel" aria-label="Continue this browser task">
          <p className="eyebrow">Do more with this goal</p>
          <h2>Keep Search as Search</h2>
          <p>
            The browser only moves into comparison or task preparation after you choose it.
          </p>
          <Link
            className="button button--primary"
            to={`/compare?mode=compare&q=${encodeURIComponent(query)}`}
          >
            Compare with evidence
          </Link>
          <Link
            className="button button--secondary"
            to={`/confirm?from=search&q=${encodeURIComponent(query)}`}
          >
            Prepare a demo action
          </Link>
        </aside>
      </div>
    </div>
  );
}
