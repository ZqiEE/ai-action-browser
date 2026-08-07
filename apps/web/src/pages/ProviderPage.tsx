import { Link } from "react-router";

const providerFeedExample = {
  id: "provider-example",
  name: "Example Provider",
  domain: "provider.example",
  active: true,
  offers: [
    {
      id: "offer-123",
      category: "laptop",
      title: "Laptop model and configuration",
      description: "Provider-supplied active offer",
      price: 949,
      currency: "USD",
      availability: "in_stock",
      deliveryText: "Estimated by Friday",
      returnsText: "30-day returns",
      warrantyText: "1-year limited warranty",
      prepareUrl: "https://provider.example/action/offer-123",
      sourceUrl: "https://provider.example/products/offer-123",
      evidence: { sourceType: "provider_feed" },
      retrievedAt: "2026-08-07T12:00:00Z",
      active: true,
    },
  ],
};

const outcomeExample = {
  providerId: "provider-example",
  eventId: "provider-event-123",
  attributionToken: "attr_example",
  status: "completed",
  occurredAt: "2026-08-07T12:30:00Z",
  evidence: {
    providerOrderReference: "ORDER-123",
  },
};

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProviderPage() {
  return (
    <div className="provider-page">
      <header className="provider-hero">
        <p className="eyebrow">AI browser outcome connector</p>
        <h1>Reach users through verified results, not paid ranking.</h1>
        <p>
          AI Action Browser is completely free for consumers. Providers connect active evidence
          and a user-authorized handoff, then report accepted, completed, cancelled, refunded, or
          disputed outcomes through a Provider-scoped signed event endpoint.
        </p>
        <div className="provider-hero__actions">
          <Link className="button button--primary" to="/compare?q=Find%20a%20laptop%20under%20%241%2C000&mode=compare">
            View the consumer flow
          </Link>
          <a
            className="button button--secondary"
            href="https://github.com/ZqiEE/ai-action-browser/blob/agent/free-ai-browser-outcome-mvp/apps/api/README.md"
            target="_blank"
            rel="noreferrer"
          >
            Open integration documentation
          </a>
        </div>
      </header>

      <p className="demo-banner" role="note">
        A commercial Provider becomes visible to consumers only after its feed, destination,
        attribution, outcome contract, privacy boundary, credentials, and operational status are
        verified. Payment does not purchase the independent best-result position.
      </p>

      <section className="provider-grid" aria-label="Provider value">
        <article>
          <p className="eyebrow">Consumer promise</p>
          <h2>Core browser access remains free</h2>
          <ul>
            <li>No consumer subscription or paid recommendation tier.</li>
            <li>No sale of private browsing history, credentials, or payment data.</li>
            <li>Important handoffs require readable review and explicit confirmation.</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Provider product</p>
          <h2>Software and outcome connection</h2>
          <ul>
            <li>Normalized Offer and evidence ingestion.</li>
            <li>Provider-scoped API token for Offer imports.</li>
            <li>Provider-scoped HMAC secret for outcome callbacks.</li>
            <li>Independent credential rotation without exposing platform master secrets.</li>
            <li>User-confirmed Prepare handoff with a random attribution token.</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Commercial options</p>
          <h2>Pay only for defined value</h2>
          <ul>
            <li>One-time technical onboarding.</li>
            <li>Provider connector or software fee.</li>
            <li>Accepted Prepare handoff or qualified activation.</li>
            <li>Completed outcome fee, commission, or user cashback funding.</li>
          </ul>
        </article>
      </section>

      <section className="provider-contract" aria-labelledby="provider-contract-title">
        <div>
          <p className="eyebrow">Result contract</p>
          <h2 id="provider-contract-title">Every fee is tied to an auditable state.</h2>
          <p>
            Before production access, both sides define success, attribution window, completion
            evidence, cancellation, refund, reversal, dispute handling, settlement timing, and the
            minimum reporting data.
          </p>
        </div>
        <ol className="outcome-steps">
          <li><strong>Prepared</strong><span>The browser has a reviewed Provider action ready.</span></li>
          <li><strong>Confirmed</strong><span>The user explicitly authorizes the handoff.</span></li>
          <li><strong>Accepted</strong><span>The Provider accepts the attributed request.</span></li>
          <li><strong>Completed</strong><span>The agreed commercial result is reached.</span></li>
          <li><strong>Reversed</strong><span>A cancellation, refund, or dispute reverses settlement.</span></li>
        </ol>
      </section>

      <section className="provider-examples" aria-label="Connector examples">
        <article>
          <div className="section-heading">
            <div><p className="eyebrow">Provider input</p><h2>Offer feed</h2></div>
            <button type="button" onClick={() => downloadJson("provider-feed-example.json", providerFeedExample)}>
              Download JSON
            </button>
          </div>
          <pre><code>{JSON.stringify(providerFeedExample, null, 2)}</code></pre>
        </article>
        <article>
          <div className="section-heading">
            <div><p className="eyebrow">Provider callback</p><h2>Outcome event</h2></div>
            <button type="button" onClick={() => downloadJson("outcome-event-example.json", outcomeExample)}>
              Download JSON
            </button>
          </div>
          <pre><code>{JSON.stringify(outcomeExample, null, 2)}</code></pre>
        </article>
      </section>

      <section className="provider-contract" aria-labelledby="go-live-title">
        <div>
          <p className="eyebrow">Go-live requirements</p>
          <h2 id="go-live-title">What a first Provider supplies</h2>
        </div>
        <ol className="outcome-steps">
          <li><strong>Feed</strong><span>Active Offers and evidence with retrieval timestamps.</span></li>
          <li><strong>Action</strong><span>An HTTPS destination or constrained Action endpoint.</span></li>
          <li><strong>Contract</strong><span>A precise billable result and reversal policy.</span></li>
          <li><strong>Credentials</strong><span>Its scoped Offer API token and webhook signing secret.</span></li>
          <li><strong>Webhook</strong><span>HMAC-signed outcome events with Provider-scoped idempotent event ids.</span></li>
          <li><strong>Review</strong><span>Security, privacy, legal, and recommendation-independence approval.</span></li>
        </ol>
      </section>
    </div>
  );
}
