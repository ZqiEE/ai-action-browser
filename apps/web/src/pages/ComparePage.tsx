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
import {
  addBrowserPageContext,
  contextualizeGoal,
  readBrowserPageContext,
} from "@/lib/browserContext";
import { formatCurrency, resolveLocale } from "@/lib/locale";

function conditionRows(result: LiveCompareResponse) {
  const rows = [
    {
      id: "budget",
      label: "Budget",
      value: result.constraints.budget === null ? "Not specified" : `Up to $${result.constraints.budget}`,
    },
    { id: "use", label: "Use", value: result.constraints.useCase },
    { id: "delivery", label: "Delivery", value: result.constraints.delivery },
    { id: "returns", label: "Returns", value: result.constraints.returns },
  ];
  return rows.filter((row) => row.value && row.value !== "not specified");
}

function sourceAge(retrievedAt: string): string {
  const value = new Date(retrievedAt);
  return Number.isNaN(value.getTime()) ? "Retrieval time unavailable" : value.toLocaleString();
}

export function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locale = resolveLocale();
  const query = searchParams.get("q")?.trim() || "laptop for video editing";
  const pageContext = useMemo(() => readBrowserPageContext(searchParams), [searchParams]);
  const requestQuery = useMemo(
    () => contextualizeGoal(query, pageContext, 1_000),
    [pageContext, query],
  );
  const normalSearchUrl = useMemo(() => {
    const params = addBrowserPageContext(new URLSearchParams({ q: query }), pageContext);
    return `/search?${params.toString()}`;
  }, [pageContext, query]);
  const [result, setResult] = useState<LiveCompareResponse | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedId("");

    compareGoal(requestQuery)
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
            : "The independent provider comparison could not be completed.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestQuery]);

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
          <h1>{query}</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>Change request</Button>
      </section>

      {pageContext && (
        <div className="inline-alert" role="note">
          <strong>Using current page context</strong>
          <p>{pageContext.title} · {pageContext.hostname}</p>
          <p>The browser extension supplied only the page title and privacy-bounded URL you chose to include.</p>
        </div>
      )}

      <p className="demo-banner" role="note">
        Provider commission, bids, partner level, and expected revenue are not available to the
        ranking query. Only active offers and user constraints are used.
      </p>

      {loading && (
        <div className="task-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Reading live provider offers and applying your conditions…</span>
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
          <h2>No active provider offers</h2>
          <p>{result.message ?? "The first production category does not have live supply yet."}</p>
          <Button variant="secondary" onClick={() => navigate(normalSearchUrl)}>
            Use normal Search
          </Button>
        </div>
      )}

      {result && selected && (
        <>
          <section className="condition-bar" aria-label="Extracted comparison conditions">
            {conditionRows(result).map((condition) => (
              <div className="condition-control" key={condition.id}>
                <span><small>{condition.label}</small><strong>{condition.value}</strong></span>
              </div>
            ))}
          </section>

          <div className="comparison-layout">
            <main className="comparison-results" aria-label="Independent recommendations">
              <article className="primary-recommendation">
                <div className="recommendation-label">Best current match</div>
                <div className="product-heading">
                  <div>
                    <p className="eyebrow">{selected.providerName} · {selected.providerDomain}</p>
                    <h2>{selected.title}</h2>
                    <p className="product-headline">{selected.description || "Provider-supplied active offer."}</p>
                  </div>
                  <div className="product-price">
                    <strong>{formatCurrency(selected.price, selected.currency, locale)}</strong>
                    <span>Provider final-price field</span>
                  </div>
                </div>

                <div className="decision-reason">
                  <h3>Why this appears first</h3>
                  <p>
                    It is the strongest active match returned after applying the extracted conditions.
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
                  <div><dt>Delivery</dt><dd>{selected.delivery || "Not supplied"}</dd></div>
                  <div><dt>Returns</dt><dd>{selected.returns || "Not supplied"}</dd></div>
                  <div><dt>Warranty</dt><dd>{selected.warranty || "Not supplied"}</dd></div>
                </dl>

                <div className="citations" aria-label="Provider evidence source">
                  <span>Evidence</span>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Open provider source</a>
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
                          <div><dt>Price</dt><dd>{formatCurrency(offer.price, offer.currency, locale)}</dd></div>
                          <div><dt>Delivery</dt><dd>{offer.delivery || "Not supplied"}</dd></div>
                          <div><dt>Main check</dt><dd>{offer.tradeoffs[0] ?? "Review provider evidence"}</dd></div>
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
                <li>{selected.delivery || "Delivery not supplied"}</li>
                <li>{selected.returns || "Returns not supplied"}</li>
              </ul>
              <Button
                variant="primary"
                onClick={() => navigate(
                  `/confirm?offer=${encodeURIComponent(selected.id)}&task=${encodeURIComponent(result.taskId)}&q=${encodeURIComponent(query)}`,
                )}
              >
                Prepare with this provider
              </Button>
              <p className="confirmation-note">
                This creates an attributed prepared outcome. The provider handoff opens only after
                you review the destination and explicitly confirm.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
