import { Link } from "react-router";
import { demoProviders } from "@/data/browser";

const providerFeedExample = {
  schemaVersion: "0.1",
  provider: {
    id: "provider-example",
    name: "Example Provider",
    domain: "provider.example",
  },
  offers: [
    {
      id: "offer-123",
      subject: "Laptop model and configuration",
      finalPrice: { amount: 949, currency: "USD" },
      availability: "in_stock",
      delivery: "2026-08-12",
      returns: "30 days",
      warranty: "1 year",
      prepareUrl: "https://provider.example/action/offer-123",
      retrievedAt: "2026-08-06T12:00:00Z",
    },
  ],
};

const outcomeExample = {
  schemaVersion: "0.1",
  outcomeId: "outcome_example",
  attributionToken: "attr_example",
  type: "purchase",
  status: "completed",
  providerId: "provider-example",
  amount: { value: 949, currency: "USD" },
  completedAt: "2026-08-06T12:30:00Z",
  reversalDeadline: "2026-09-05T12:30:00Z",
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
        <p className="eyebrow">Provider outcome connector</p>
        <h1>Reach users through results, not paid ranking.</h1>
        <p>
          AI Action Browser stays free for consumers. Providers can connect structured evidence,
          receive user-authorized Prepare handoffs, and pay for agreed software or verified
          outcomes. Commercial terms never enter independent recommendation ranking.
        </p>
        <div className="provider-hero__actions">
          <Link className="button button--primary" to="/compare?q=laptop&mode=compare">
            View the consumer flow
          </Link>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => downloadJson("provider-feed-example.json", providerFeedExample)}
          >
            Download feed example
          </button>
        </div>
      </header>

      <p className="demo-banner" role="note">
        Prototype connector only. The providers shown below are demonstration records and do not
        represent active commercial agreements or live integrations.
      </p>

      <section className="provider-grid" aria-label="Provider value">
        <article>
          <p className="eyebrow">Consumer promise</p>
          <h2>Core browser access remains free</h2>
          <ul>
            <li>No consumer subscription or paid recommendation tier.</li>
            <li>No sale of private browsing history, credentials, or payment data.</li>
            <li>Important actions require readable review and explicit confirmation.</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Provider product</p>
          <h2>Software and outcome connection</h2>
          <ul>
            <li>Normalized product or service feed.</li>
            <li>Freshness, conflict, availability, and final-price fields.</li>
            <li>Prepare handoff or constrained Action endpoint.</li>
            <li>Attribution, completion, cancellation, refund, and reversal events.</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Commercial options</p>
          <h2>Pay for measurable value</h2>
          <ul>
            <li>One-time integration or onboarding.</li>
            <li>Provider software or connector fee.</li>
            <li>Accepted Prepare handoff or qualified activation.</li>
            <li>Completed transaction commission or merchant-funded user benefit.</li>
          </ul>
        </article>
      </section>

      <section className="provider-contract" aria-labelledby="provider-contract-title">
        <div>
          <p className="eyebrow">Result contract</p>
          <h2 id="provider-contract-title">A fee is tied to an auditable state.</h2>
          <p>
            A production agreement defines success, attribution window, completion evidence,
            cancellation, refund, reversal, dispute handling, and the minimum reporting data.
          </p>
        </div>
        <ol className="outcome-steps">
          <li><strong>Prepared</strong><span>The browser has a reviewed action ready.</span></li>
          <li><strong>Confirmed</strong><span>The user explicitly authorizes the handoff.</span></li>
          <li><strong>Accepted</strong><span>The provider accepts the request or order.</span></li>
          <li><strong>Completed</strong><span>The agreed commercial result is reached.</span></li>
          <li><strong>Reversed</strong><span>A cancellation, refund, or dispute reverses settlement.</span></li>
        </ol>
      </section>

      <section className="provider-examples" aria-label="Connector examples">
        <article>
          <div className="section-heading">
            <div><p className="eyebrow">Input</p><h2>Provider feed</h2></div>
            <button type="button" onClick={() => downloadJson("provider-feed-example.json", providerFeedExample)}>
              Download JSON
            </button>
          </div>
          <pre><code>{JSON.stringify(providerFeedExample, null, 2)}</code></pre>
        </article>
        <article>
          <div className="section-heading">
            <div><p className="eyebrow">Output</p><h2>Outcome event</h2></div>
            <button type="button" onClick={() => downloadJson("outcome-event-example.json", outcomeExample)}>
              Download JSON
            </button>
          </div>
          <pre><code>{JSON.stringify(outcomeExample, null, 2)}</code></pre>
        </article>
      </section>

      <section className="provider-demo-list" aria-labelledby="demo-providers-title">
        <p className="eyebrow">Prototype supply</p>
        <h2 id="demo-providers-title">Demonstration provider records</h2>
        <div className="provider-list">
          {demoProviders.map((provider) => (
            <article key={provider.id}>
              <div>
                <h3>{provider.name}</h3>
                <p>{provider.domain} · {provider.integrationStatus}</p>
              </div>
              <ul>{provider.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
              <p>{provider.commercialModel}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
