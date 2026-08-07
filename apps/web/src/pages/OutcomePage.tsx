import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/Button";
import { ApiError, getOutcome, type OutcomeView } from "@/lib/api";
import { formatCurrency, resolveLocale } from "@/lib/locale";

interface OutcomeData {
  outcome: OutcomeView;
  events: Array<Record<string, unknown>>;
}

function statusDescription(status: OutcomeView["status"]): string {
  switch (status) {
    case "prepared":
      return "The provider handoff is prepared but has not been confirmed.";
    case "confirmed":
      return "The user confirmed the provider handoff. No completed commercial result has been reported yet.";
    case "accepted":
      return "The provider accepted the attributed request.";
    case "completed":
      return "The provider reported the contractually defined result as completed.";
    case "cancelled":
      return "The provider reported that the result was cancelled.";
    case "refunded":
      return "The provider reported a refund. Settlement must be reversed according to the result contract.";
    case "disputed":
      return "The result is disputed and must not be treated as settled.";
  }
}

function continuationKey(outcomeId: string): string {
  return `aab-continue:${outcomeId}`;
}

export function OutcomePage() {
  const { outcomeId = "" } = useParams();
  const locale = resolveLocale();
  const [data, setData] = useState<OutcomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!outcomeId) {
      setError("Outcome id is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await getOutcome(outcomeId);
      setData(next);
      if (!["confirmed", "accepted"].includes(next.outcome.status)) {
        window.sessionStorage.removeItem(continuationKey(outcomeId));
      }
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The outcome receipt could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [outcomeId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main id="main-content" className="secure-page">
        <div className="task-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Loading the outcome record…</span>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" className="secure-page">
        <section className="success-receipt">
          <p className="eyebrow">Outcome unavailable</p>
          <h1>The result record could not be loaded</h1>
          <p>{error}</p>
          <Link className="button button--primary" to="/">Return home</Link>
        </section>
      </main>
    );
  }

  const { outcome, events } = data;
  const continueUrl = window.sessionStorage.getItem(continuationKey(outcome.id));
  const canContinue = Boolean(
    continueUrl && outcome.userConfirmed && ["confirmed", "accepted"].includes(outcome.status),
  );

  return (
    <main id="main-content" className="secure-page secure-page--success">
      <section className="success-receipt outcome-receipt" aria-live="polite">
        <p className="eyebrow">Auditable outcome receipt</p>
        <h1>{outcome.status === "completed" ? "Result completed" : "Provider handoff recorded"}</h1>
        <p>{statusDescription(outcome.status)}</p>

        <dl>
          <div><dt>Status</dt><dd>{outcome.status}</dd></div>
          <div><dt>Selected result</dt><dd>{outcome.offerTitle}</dd></div>
          <div><dt>Provider</dt><dd>{outcome.providerName} · {outcome.providerDomain}</dd></div>
          <div><dt>Amount</dt><dd>{formatCurrency(outcome.amount, outcome.currency, locale)}</dd></div>
          <div><dt>Outcome id</dt><dd><code>{outcome.id}</code></dd></div>
          <div><dt>Updated</dt><dd>{new Date(outcome.updatedAt).toLocaleString()}</dd></div>
          <div><dt>Reversal deadline</dt><dd>{outcome.reversalDeadline ? new Date(outcome.reversalDeadline).toLocaleString() : "Not defined"}</dd></div>
        </dl>

        <section className="outcome-events" aria-labelledby="outcome-events-title">
          <h2 id="outcome-events-title">Provider event history</h2>
          {events.length === 0 ? (
            <p>No authenticated provider event has been received.</p>
          ) : (
            <ol>
              {events.map((event, index) => (
                <li key={String(event.id ?? index)}>
                  <strong>{String(event.status ?? "event")}</strong>
                  <span>{String(event.occurredAt ?? event.receivedAt ?? "")}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {error && (
          <div className="inline-alert inline-alert--danger" role="alert">
            <strong>Refresh failed</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="receipt-actions">
          {canContinue && continueUrl && (
            <a className="button button--primary" href={continueUrl} target="_blank" rel="noreferrer">
              Continue to {outcome.providerName}
            </a>
          )}
          <Button variant="secondary" onClick={() => void load()}>Refresh provider status</Button>
          <Link className="button button--quiet" to="/">Return to browser</Link>
        </div>

        <p className="confirmation-note">
          The attributed provider URL is released only after confirmation and remains in this browser
          session instead of the public outcome receipt. A completed commercial result still requires
          an authenticated provider event and remains reversible under the provider contract.
        </p>
      </section>
    </main>
  );
}
