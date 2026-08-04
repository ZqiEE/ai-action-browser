import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/Button";
import { CheckIcon } from "@/components/Icons";
import { demoOrder, demoProducts } from "@/data/demo";
import { formatCurrency, formatDate, resolveLocale } from "@/lib/locale";

type ConfirmState = "idle" | "authenticating" | "failed" | "success";

export function ConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locale = resolveLocale();
  const [state, setState] = useState<ConfirmState>("idle");

  const product = useMemo(() => {
    const productId = searchParams.get("product") ?? demoOrder.productId;
    return demoProducts.find((item) => item.id === productId) ?? demoProducts[0];
  }, [searchParams]);

  if (!product) return null;

  const total = product.price;
  const tax = Math.min(50, Math.round(total * 0.08));
  const subtotal = total - tax;

  function confirmPurchase() {
    if (state === "authenticating") return;
    setState("authenticating");
    window.setTimeout(() => setState("success"), 1200);
  }

  if (state === "success") {
    return (
      <main id="main-content" className="secure-page secure-page--success">
        <section className="success-receipt" aria-live="polite">
          <span className="success-receipt__icon" aria-hidden="true"><CheckIcon /></span>
          <p className="eyebrow">Demo receipt</p>
          <h1>Purchase preparation completed</h1>
          <p>No real order or payment was submitted. This prototype simulated a successful system verification.</p>
          <dl>
            <div><dt>Item</dt><dd>{product.name}</dd></div>
            <div><dt>Amount</dt><dd>{formatCurrency(total, product.currency, locale)}</dd></div>
            <div><dt>Reference</dt><dd>DEMO-48291</dd></div>
          </dl>
          <Button variant="primary" onClick={() => navigate("/")}>Return home</Button>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="secure-page">
      <header className="secure-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <p className="eyebrow">Independent confirmation page</p>
          <h1>Review and confirm</h1>
        </div>
      </header>

      <div className="secure-layout">
        <section className="secure-content" aria-label="Purchase details">
          <p className="demo-banner" role="note">
            Prototype only. No merchant account, payment method, or delivery address is being used.
          </p>

          <section className="confirm-section confirm-section--destination">
            <div className="confirm-section__heading"><h2>Destination</h2></div>
            <dl className="confirm-list">
              <div><dt>Merchant</dt><dd>{demoOrder.merchantName}</dd></div>
              <div><dt>Domain</dt><dd><strong>{demoOrder.destinationDomain}</strong></dd></div>
              <div><dt>Connection</dt><dd>Encrypted</dd></div>
              <div><dt>Merchant information</dt><dd>Matched against demo merchant details</dd></div>
              <div><dt>Verification</dt><dd>Demo status — not a production merchant verification</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Order</h2><button type="button">Edit</button></div>
            <dl className="confirm-list">
              <div><dt>{product.name}</dt><dd>{formatCurrency(subtotal, product.currency, locale)}</dd></div>
              <div><dt>Estimated tax</dt><dd>{formatCurrency(tax, product.currency, locale)}</dd></div>
              <div><dt>Shipping</dt><dd>Free</dd></div>
              <div className="confirm-list__total"><dt>Total today</dt><dd>{formatCurrency(total, product.currency, locale)}</dd></div>
              <div><dt>Cashback after eligible purchase</dt><dd>{formatCurrency(demoOrder.cashback, product.currency, locale)}</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Delivery</h2><button type="button">Edit</button></div>
            <dl className="confirm-list">
              <div><dt>Address</dt><dd>{demoOrder.deliveryAddress}</dd></div>
              <div><dt>Estimated arrival</dt><dd>{formatDate(demoOrder.deliveryDate, locale)}</dd></div>
              <div><dt>Return deadline</dt><dd>{formatDate(demoOrder.returnDeadline, locale)}</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Payment</h2><button type="button">Edit</button></div>
            <dl className="confirm-list">
              <div><dt>Method</dt><dd>{demoOrder.paymentLabel}</dd></div>
              <div><dt>Verification</dt><dd>Your device will request system verification after you continue.</dd></div>
            </dl>
          </section>

          <section className="confirm-section">
            <div className="confirm-section__heading"><h2>Data sharing</h2><button type="button">Edit</button></div>
            <div className="data-sharing-grid">
              <div><h3>Shared for this order</h3><ul>{demoOrder.sharedData.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Not shared</h3><ul>{demoOrder.retainedData.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </section>

          <section className="commercial-disclosure">
            <h2>Commercial disclosure</h2>
            <p>
              The platform may receive a commission after an eligible purchase. Commission and merchant bids
              did not affect the independent recommendation order.
            </p>
          </section>
        </section>

        <aside className="confirm-actions" aria-label="Final confirmation">
          <p className="eyebrow">Final step</p>
          <h2>{formatCurrency(total, product.currency, locale)}</h2>
          <p>You are about to request system verification. No real payment will occur in this prototype.</p>

          {state === "failed" && (
            <div className="inline-alert inline-alert--danger" role="alert">
              <strong>System verification failed</strong>
              <p>Nothing was submitted. Review the details or try again.</p>
            </div>
          )}

          <Button
            variant="primary"
            loading={state === "authenticating"}
            onClick={confirmPurchase}
          >
            {state === "authenticating" ? "Waiting for system verification" : "Confirm with system verification"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/compare")}>Edit order</Button>
          <Button variant="quiet" onClick={() => navigate("/compare")}>Cancel</Button>

          <details className="demo-controls">
            <summary>Prototype state controls</summary>
            <button type="button" onClick={() => setState("failed")}>Simulate authentication failure</button>
          </details>
        </aside>
      </div>
    </main>
  );
}
