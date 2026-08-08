import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/Button";
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
            : "The independent provider comparison could not be completed.",
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

  return (
    <div className="compare-page">
      <header className="compare-toolbar">
        <div>
          <span className="workspace-label">Compare</span>
          <h1>{query || "Compare provider evidence"}</h1>
        </div>
        <div className="compare-toolbar__actions">
          <Button variant="secondary" onClick={() => navigate(normalSearchUrl)}>Search web</Button>
          <Button variant="quiet" onClick={() => navigate("/")}>New task</Button>
        </div>
      </header>

      {pageContext && (
        <div className="context-strip" role="note">
          <strong>Current page</strong>
          <span>{pageContext.title}</span>
          <span>{pageContext.hostname}</span>
        </div>
      )}

      <p className="ranking-note" role="note">
        Ranking uses relevance and provider evidence only. Commission, bids, partner level, and expected revenue are not ranking inputs.
      </p>

      {loading && (
        <p className="quiet-status" role="status" aria-live="polite">Matching active provider evidence…</p>
      )}

      {error && (
        <div className="inline-alert inline-alert--danger" role="alert">
          <strong>Comparison unavailable</strong>
          <p>{error}</p>
          <p>No fixture recommendation was substituted.</p>
        </div>
      )}

      {result && result.recommendations.length === 0 && (
        <div className="empty-state" role="status">
          <h2>No relevant active provider offers</h2>
          <p>{result.message ?? "No current provider evidence matched this goal."}</p>
          <Button variant="secondary" onClick={() => navigate(normalSearchUrl)}>Use normal Search</Button>
        </div>
      )}

      {result && selected && (
        <>
          {conditionRows(result).length > 0 && (
            <section className="condition-bar" aria-label="Comparison conditions">
              {conditionRows(result).map((condition) => (
                <div className="condition-control" key={condition.id}>
                  <span><small>{condition.label}</small><strong>{condition.value}</strong></span>
                </div>
              ))}
            </section>
          )}

          <div className="compare-workspace">
            <section className="offer-list" aria-label="Independent recommendations">
              <div className="offer-list__header">
                <strong>{result.recommendations.length} active matches</strong>
                <span>Best relevance first</span>
              </div>
              {result.recommendations.map((offer, index) => (
                <button
                  key={offer.id}
                  type="button"
                  className="offer-row"
                  aria-pressed={selected.id === offer.id}
                  onClick={() => setSelectedId(offer.id)}
                >
                  <span className="offer-row__rank">{index + 1}</span>
                  <span className="offer-row__body">
                    <strong>{offer.title}</strong>
                    <small>{offer.providerName} · {offer.category}</small>
                    <span>{offer.description || offer.availability}</span>
                  </span>
                  <span className="offer-row__price">{formatCurrency(offer.price, offer.currency, locale)}</span>
                </button>
              ))}
            </section>

            <aside className="offer-detail" aria-label="Selected recommendation details">
              <div className="offer-detail__heading">
                <div>
                  <span className="workspace-label">Selected result</span>
                  <h2>{selected.title}</h2>
                  <p>{selected.providerName} · {selected.providerDomain}</p>
                </div>
                <strong className="offer-detail__price">{formatCurrency(selected.price, selected.currency, locale)}</strong>
              </div>

              <p className="offer-detail__description">{selected.description || "Provider-supplied active evidence."}</p>

              <section className="detail-section">
                <h3>Why it matches</h3>
                <ul>
                  {selected.strengths.map((strength) => <li key={strength}>{strength}</li>)}
                </ul>
              </section>

              <section className="detail-section">
                <h3>Check before continuing</h3>
                <ul>
                  {selected.tradeoffs.map((tradeoff) => <li key={tradeoff}>{tradeoff}</li>)}
                </ul>
              </section>

              <dl className="detail-facts">
                {providerFacts(selected).map((fact) => (
                  <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
                ))}
              </dl>

              <div className="evidence-source">
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Open provider source</a>
                <small>Retrieved {sourceAge(selected.retrievedAt)}</small>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate(
                  `/confirm?offer=${encodeURIComponent(selected.id)}&task=${encodeURIComponent(result.taskId)}&q=${encodeURIComponent(query)}`,
                )}
              >
                Prepare with this provider
              </Button>
              <p className="confirmation-note">The provider handoff remains locked until you review and confirm it.</p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
