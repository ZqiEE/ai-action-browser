import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/Button";
import { CheckIcon } from "@/components/Icons";
import {
  ApiError,
  compareGoal,
  type LiveCompareResponse,
  type LiveRecommendation,
} from "@/lib/api";
import { addBrowserPageContext, readBrowserPageContext } from "@/lib/browserContext";
import { formatCurrency, resolveLocale } from "@/lib/locale";

function conditionRows(result: LiveCompareResponse) {
  const rows = [
    {
      id: "budget",
      label: "Budget",
      value: result.constraints.budget === null ? "Not specified" : `Up to $${result.constraints.budget}`,
    },
    { id: "use", label: "Purpose", value: result.constraints.useCase },
    { id: "delivery", label: "Timing", value: result.constraints.delivery },
    { id: "returns", label: "Return / refund", value: result.constraints.returns },
  ];
  return rows.filter((row) => row.value && row.value !== "not specified");
}

function sourceAge(retrievedAt: string): string {
  const value = new Date(retrievedAt);
  return Number.isNaN(value.getTime()) ? "Retrieval time unavailable" : value.toLocaleString();
}

function providerFacts(offer: LiveRecommendation) {
  const facts = [
    { label: "Category", value: offer.category },
    { label: "Availability", value: offer.availability },
    { label: "Timing / delivery", value: offer.delivery },
    { label: "Return / refund", value: offer.returns },
    { label: "Warranty / service", value: offer.warranty },
  ];
  return facts.filter((fact) => fact.value?.trim());
}

export function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locale = resolveLocale();
  const query = searchParams.get("q")?.trim() ?? "";
  const pageContext = useMemo(() => readBrowserPageContext(searchParams), [searchParams]);
  const normalSearchUrl = useMemo(() => {
    const params = addBrowserPageContext(new URLSearchParams({ q: query }), pageContext);
    return `/search?${params.toString()}`;
  }, [pageContext, query]);
  const [result, setResult] = useState<LiveCompareResponse | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState<string | null>(query ? null : "Enter a goal before starting Compare.");

  useEffect(() => {
    let active = true;
    if (!query) {
      setLoading(false);
      setResult(null);
      setSelectedId("");
      setError("Enter a goal before starting Compare.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedId("");

    compareGoal(query, undefined, pageContext)
      .then((value) => {
        if (!active) return;
        setResult(value);
        setSelectedId(value.recommendations[0]?.id ?? "");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof ApiError
            ? reason.message
            : "The independent Provider comparison could not be completed.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageContext, query]);

  const selected = useMemo<LiveRecommendation | undefined>(() => {
    if (!result) return undefined;
    return result.recommendations.find((item) => item.id === selectedId) ?? result.recommendations[0];
  }, [result, selectedId]);
  const alternatives = result?.recommendations.filter((item) => item.id !== selected?.id) ?? [];

  return (
    <div className="compare-page">
      <section className="comparison-command" aria-label="Current comparison">
        <div>
          <p className="eyebrow">Independent comparison</p>
          <h1>{query || "Compare Provider evidence"}</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>Change request</Button>
      </section>

      {pageContext && (
        <div className="inline-alert" role="note">
          <strong>Using current page context for this request</strong>
          <p>{pageContext.title} · {pageContext.hostname}</p>
          <p>
            The page title and privacy-bounded URL are transient discovery context. They are not
            merged into or stored as your task goal.
          </p>
        </div>
      )}

      <p className="demo-banner" role="note">
        Provider commission, bids, partner level, and expected revenue are unavailable to ranking.
        Compare uses the user goal and active Provider evidence only.
      </p>

      {loading && (
        <div className="task-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Matching active Provider evidence to your goal…</span>
        </div>
      )}

      {error && (
        <div className="inline-alert inline-alert--danger" role="alert">
          <strong>Comparison unavailable</strong>
          <p>{error}</p>
          <p>No fixture recommendations were substituted.</p>
        </div>
      )}

      {result && result.recommendations.length === 0 && (
        <div className="empty-state" role="status">
          <h2>No relevant active Provider offers</h2>
          <p>{result.message ?? "No current Provider evidence matched this goal."}</p>
          <Button variant="secondary" onClick={() => navigate(normalSearchUrl)}>
            Use normal Search
          </Button>
        </div>
      )}

      {result && selected && (
        <>
          {conditionRows(result).length > 0 && (
            <section className="condition-bar" aria-label="Extracted comparison conditions">
              {conditionRows(result).map((condition) => (
                <div className="condition-control" key={condition.id}>
                  <span><small>{condition.label}</small><strong>{condition.value}</strong></span>
                </div>
              ))}
            </section>
          )}

          <div className="comparison-layout">
            <main className="comparison-results" aria-label="Independent recommendations">
              <article className="primary-recommendation">
                <div className="recommendation-label">Best current match</div>
                <div className="product-heading">
                  <div>
                    <p className="eyebrow">{selected.providerName} · {selected.providerDomain}</p>
                    <h2>{selected.title}</h2>
                    <p className="product-headline">{selected.description || "Provider-supplied active evidence."}</p>
                  </div>
                  <div className="product-price">
                    <strong>{formatCurrency(selected.price, selected.currency, locale)}</strong>
                    <span>Provider amount</span>
                  </div>
                </div>

                <div className="decision-reason">
                  <h3>Why this appears first</h3>
                  <p>
                    It is the strongest current relevance match after applying explicit conditions.
                    Commercial terms were not part of the ranking input.
                  </p>
                </div>

                <div className="tradeoff-grid">
                  <section>
                    <h3>What works well</h3>
                    <ul className="evidence-list evidence-list--positive">
                      {selected.strengths.map((strength) => <li key={strength}><CheckIcon />{strength}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h3>What to verify</h3>
                    <ul className="evidence-list evidence-list--tradeoff">
                      {selected.tradeoffs.map((tradeoff) => <li key={tradeoff}><span aria-hidden="true">—</span>{tradeoff}</li>)}
                    </ul>
                  </section>
                </div>

                <dl className="product-metadata">
                  {providerFacts(selected).map((fact) => (
                    <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
                  ))}
                </dl>

                <div className="citations" aria-label="Provider evidence source">
                  <span>Evidence</span>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Open Provider source</a>
                  <small>Retrieved {sourceAge(selected.retrievedAt)}</small>
                </div>
              </article>

              {alternatives.length > 0 && (
                <section className="alternatives" aria-labelledby="alternatives-title">
                  <div className="section-heading">
                    <div><p className="eyebrow">Other active offers</p><h2 id="alternatives-title">Compare the main trade-offs</h2></div>
                  </div>
                  <div className="alternative-list">
                    {alternatives.map((offer) => (
                      <article className="alternative-row" key={offer.id}>
                        <div>
                          <p className="alternative-row__label">{offer.providerName}</p>
                          <h3>{offer.title}</h3>
                          <p>{offer.description || offer.availability}</p>
                        </div>
                        <dl>
                          <div><dt>Amount</dt><dd>{formatCurrency(offer.price, offer.currency, locale)}</dd></div>
                          <div><dt>Category</dt><dd>{offer.category}</dd></div>
                          <div><dt>Main check</dt><dd>{offer.tradeoffs[0] ?? "Review Provider evidence"}</dd></div>
                        </dl>
                        <Button variant="secondary" onClick={() => setSelectedId(offer.id)}>Make main choice</Button>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="decision-summary" aria-label="Decision summary">
              <p className="eyebrow">Ready to prepare</p>
              <h2>{selected.title}</h2>
              <p className="decision-summary__price">{formatCurrency(selected.price, selected.currency, locale)}</p>
              <ul>
                <li>{selected.providerName}</li>
                <li>{selected.category}</li>
                <li>{selected.availability || "Availability not supplied"}</li>
              </ul>
              <Button
                variant="primary"
                onClick={() => navigate(
                  `/confirm?offer=${encodeURIComponent(selected.id)}&task=${encodeURIComponent(result.taskId)}&q=${encodeURIComponent(query)}`,
                )}
              >
                Prepare with this Provider
              </Button>
              <p className="confirmation-note">
                This creates an attributed prepared outcome. The Provider handoff opens only after
                you review the destination and explicitly confirm.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
