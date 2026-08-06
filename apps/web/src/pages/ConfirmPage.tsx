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
      await confirmPreparedOutcome(prepared.outcomeId);
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
        <div className="task-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Preparing the provider handoff and attribution record…</span>
        </div>
      </main>
    );
  }

  if (!prepared) {
    return (
      <main id="main-content" className="secure-page">
        <section className="success-receipt">
          <p className="eyebrow">Preparation failed</p>
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
          <p className="eyebrow">Independent confirmation page</p>
          <h1>Review the provider handoff</h1>
        </div>
      </header>

      <div className="secure-layout">
        <section className="secure-content" aria-label="Provider handoff details">
          <p className="demo-banner" role="note">
            This V1 confirms a handoff to the provider. It does not submit payment or place an order.
            Any provider checkout remains visible and under your control.
          </p>

          <section className="confirm-section confirm-section--destination">
            <div className="confirm-section__heading"><h2>Destination</h2></div>
            <dl className="confirm-list">
              <div><dt>Provider</dt><dd>{offer.providerName}</dd></div>
              <div><dt>Domain</dt><dd><strong>{offer.providerDomain}</strong></dd></div>
              <div><dt>Connection</dt><dd>HTTPS provider URL required by the connector</dd></div>
              <div><dt>Attribution</dt><dd>A single outcome token is added to the handoff URL</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Selected result</h2></div>
            <dl className="confirm-list">
              <div><dt>Offer</dt><dd>{offer.title}</dd></div>
              <div><dt>Provider amount</dt><dd>{formatCurrency(offer.price, offer.currency, locale)}</dd></div>
              <div><dt>Availability</dt><dd>{offer.availability}</dd></div>
              <div><dt>Delivery</dt><dd>{offer.delivery || "Not supplied"}</dd></div>
              <div><dt>Returns</dt><dd>{offer.returns || "Not supplied"}</dd></div>
              <div><dt>Warranty</dt><dd>{offer.warranty || "Not supplied"}</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Data sharing</h2></div>
            <div className="data-sharing-grid">
              <div>
                <h3>Sent with this handoff</h3>
                <ul>
                  <li>Selected provider Offer id</li>
                  <li>Random outcome and attribution identifiers</li>
                  <li>The provider URL you are opening</li>
                </ul>
              </div>
              <div>
                <h3>Not sent</h3>
                <ul>
                  <li>Your private browsing history</li>
                  <li>Passwords, cookies, or payment credentials</li>
                  <li>Other tabs or unrelated task content</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Result lifecycle</h2></div>
            <dl className="confirm-list">
              <div><dt>Current status</dt><dd>Prepared</dd></div>
              <div><dt>After confirmation</dt><dd>Confirmed handoff</dd></div>
              <div><dt>Commercial result</dt><dd>Only after an authenticated provider event</dd></div>
              <div><dt>Reversal deadline</dt><dd>{new Date(prepared.reversalDeadline).toLocaleDateString()}</dd></div>
            </dl>
          </section>

          <section className="commercial-disclosure">
            <h2>Commercial disclosure</h2>
            <p>
              The provider may pay an integration, software, handoff, or completed-outcome fee.
              Those commercial terms were not available to the independent comparison query and
              did not determine which offer appeared first.
            </p>
          </section>
        </section>

        <aside className="confirm-actions" aria-label="Final confirmation">
          <p className="eyebrow">User-controlled handoff</p>
          <h2>{formatCurrency(offer.price, offer.currency, locale)}</h2>
          <p>
            Confirming records your choice and prepares the provider link. It does not authorize a
            payment or allow the provider to read private browser data.
          </p>

          {error && (
            <div className="inline-alert inline-alert--danger" role="alert">
              <strong>Confirmation failed</strong>
              <p>{error}</p>
            </div>
          )}

          <Button variant="primary" loading={confirming} onClick={confirmHandoff}>
            {confirming ? "Confirming provider handoff" : `Confirm handoff to ${offer.providerName}`}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Choose another result</Button>
          <Button variant="quiet" onClick={() => navigate("/")}>Cancel task</Button>
        </aside>
      </div>
    </main>
  );
}
