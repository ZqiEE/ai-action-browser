import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/Button";
import {
  ApiError,
  confirmPreparedOutcome,
  prepareOffer,
  type PreparedOutcomeResponse,
} from "@/lib/api";
import { formatCurrency, resolveLocale } from "@/lib/locale";

export function ConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locale = resolveLocale();
  const offerId = searchParams.get("offer")?.trim() ?? "";
  const taskId = searchParams.get("task")?.trim() ?? "";
  const query = searchParams.get("q")?.trim() ?? "";
  const [prepared, setPrepared] = useState<PreparedOutcomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!offerId || !taskId) {
      setLoading(false);
      setError("The selected provider offer or browser task is missing.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);
    prepareOffer(offerId, taskId, query)
      .then((value) => {
        if (active) setPrepared(value);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof ApiError ? reason.message : "The provider handoff could not be prepared.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [offerId, taskId, query]);

  async function confirmHandoff() {
    if (!prepared || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      const confirmation = await confirmPreparedOutcome(prepared.outcomeId);
      window.sessionStorage.setItem(`aab-continue:${prepared.outcomeId}`, confirmation.continueUrl);
      navigate(`/outcomes/${encodeURIComponent(prepared.outcomeId)}`);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The handoff confirmation failed.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <main id="main-content" className="secure-page">
        <p className="quiet-status" role="status" aria-live="polite">Preparing the provider handoff…</p>
      </main>
    );
  }

  if (!prepared) {
    return (
      <main id="main-content" className="secure-page">
        <section className="success-receipt">
          <span className="workspace-label">Preparation failed</span>
          <h1>Nothing was confirmed or sent</h1>
          <p>{error ?? "The selected offer could not be prepared."}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>Return to comparison</Button>
        </section>
      </main>
    );
  }

  const offer = prepared.offer;

  return (
    <main id="main-content" className="secure-page">
      <header className="secure-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <span className="workspace-label">Confirm handoff</span>
          <h1>Review the provider handoff</h1>
        </div>
      </header>

      <div className="secure-layout">
        <section className="secure-content" aria-label="Provider handoff details">
          <section className="confirm-section confirm-section--destination">
            <div className="confirm-section__heading"><h2>Destination</h2></div>
            <dl className="confirm-list">
              <div><dt>Provider</dt><dd>{offer.providerName}</dd></div>
              <div><dt>Domain</dt><dd><strong>{offer.providerDomain}</strong></dd></div>
              <div><dt>Action</dt><dd>Open the provider after confirmation</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Selected result</h2></div>
            <dl className="confirm-list">
              <div><dt>Offer</dt><dd>{offer.title}</dd></div>
              <div><dt>Amount</dt><dd>{formatCurrency(offer.price, offer.currency, locale)}</dd></div>
              <div><dt>Availability</dt><dd>{offer.availability || "Not supplied"}</dd></div>
              {offer.delivery && <div><dt>Timing / delivery</dt><dd>{offer.delivery}</dd></div>}
              {offer.returns && <div><dt>Return / refund</dt><dd>{offer.returns}</dd></div>}
              {offer.warranty && <div><dt>Warranty / service</dt><dd>{offer.warranty}</dd></div>}
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Data sharing</h2></div>
            <div className="data-sharing-grid">
              <div>
                <h3>Sent</h3>
                <ul>
                  <li>Selected offer identifier</li>
                  <li>Random outcome attribution identifier</li>
                  <li>The provider destination being opened</li>
                </ul>
              </div>
              <div>
                <h3>Not sent</h3>
                <ul>
                  <li>Browsing history or other tabs</li>
                  <li>Passwords, cookies, or payment credentials</li>
                  <li>Unrelated browser task content</li>
                </ul>
              </div>
            </div>
          </section>

          <details className="commercial-disclosure">
            <summary>Commercial disclosure</summary>
            <p>
              The provider may pay for connector software or a verified outcome. Those terms are not ranking inputs and did not determine the selected result's position.
            </p>
          </details>
        </section>

        <aside className="confirm-actions" aria-label="Final confirmation">
          <span className="workspace-label">Ready to continue</span>
          <h2>{formatCurrency(offer.price, offer.currency, locale)}</h2>
          <p>
            Confirming records your choice and releases the provider link to this browser session. It does not submit payment or place an order.
          </p>

          {error && (
            <div className="inline-alert inline-alert--danger" role="alert">
              <strong>Confirmation failed</strong>
              <p>{error}</p>
            </div>
          )}

          <Button variant="primary" loading={confirming} onClick={confirmHandoff}>
            {confirming ? "Confirming handoff" : `Confirm handoff to ${offer.providerName}`}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Choose another result</Button>
          <Button variant="quiet" onClick={() => navigate("/")}>Cancel</Button>
        </aside>
      </div>
    </main>
  );
}
