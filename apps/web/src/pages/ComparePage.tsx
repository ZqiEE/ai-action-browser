import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/Button";
import { CheckIcon, CloseIcon } from "@/components/Icons";
import { SourcePanel } from "@/components/SourcePanel";
import { SponsoredOffer } from "@/components/SponsoredOffer";
import { TaskProgress } from "@/components/TaskProgress";
import { demoNotice, demoProducts, demoSources } from "@/data/demo";
import { formatCurrency, resolveLocale } from "@/lib/locale";

const initialConditions = [
  { id: "budget", label: "Budget", value: "Under $1,000" },
  { id: "use", label: "Use", value: "Video editing" },
  { id: "delivery", label: "Delivery", value: "By next week" },
  { id: "returns", label: "Returns", value: "Free returns" },
];

export function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locale = resolveLocale();
  const [conditions, setConditions] = useState(initialConditions);
  const [selectedId, setSelectedId] = useState(demoProducts[0]?.id ?? "");
  const [sourceId, setSourceId] = useState<string | null>(null);

  const selected = useMemo(
    () => demoProducts.find((product) => product.id === selectedId) ?? demoProducts[0],
    [selectedId],
  );
  const alternatives = demoProducts.filter((product) => product.id !== selected?.id);
  const activeSource = demoSources.find((source) => source.id === sourceId);
  const query = searchParams.get("q") ?? "laptop for video editing";

  if (!selected) return null;

  return (
    <div className="compare-page">
      <section className="comparison-command" aria-label="Current comparison">
        <div>
          <p className="eyebrow">Comparing</p>
          <h1>{query}</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>Change request</Button>
      </section>

      <p className="demo-banner" role="note">{demoNotice}</p>
      <TaskProgress />

      <section className="condition-bar" aria-label="Comparison conditions">
        {conditions.map((condition) => (
          <div className="condition-control" key={condition.id}>
            <span><small>{condition.label}</small><strong>{condition.value}</strong></span>
            <button
              type="button"
              aria-label={`Remove ${condition.label} condition`}
              onClick={() => setConditions((current) => current.filter((item) => item.id !== condition.id))}
            >
              <CloseIcon />
            </button>
          </div>
        ))}
        <button type="button" className="condition-add">Edit criteria</button>
      </section>

      <div className="comparison-layout">
        <main className="comparison-results" aria-label="Independent recommendations">
          <article className="primary-recommendation">
            <div className="recommendation-label">Best match for your request</div>
            <div className="product-heading">
              <div>
                <p className="eyebrow">{selected.merchant}</p>
                <h2>{selected.name}</h2>
                <p className="product-headline">{selected.headline}</p>
              </div>
              <div className="product-price">
                <strong>{formatCurrency(selected.price, selected.currency, locale)}</strong>
                <span>Estimated final price</span>
              </div>
            </div>

            <div className="decision-reason">
              <h3>Why this is the best match</h3>
              <p>{selected.headline}</p>
            </div>

            <div className="tradeoff-grid">
              <section>
                <h3>What works well</h3>
                <ul className="evidence-list evidence-list--positive">
                  {selected.strengths.map((strength) => <li key={strength}><CheckIcon />{strength}</li>)}
                </ul>
              </section>
              <section>
                <h3>What you give up</h3>
                <ul className="evidence-list evidence-list--tradeoff">
                  {selected.tradeoffs.map((tradeoff) => <li key={tradeoff}><span aria-hidden="true">—</span>{tradeoff}</li>)}
                </ul>
              </section>
            </div>

            <dl className="product-metadata">
              <div><dt>Delivery</dt><dd>{selected.delivery}</dd></div>
              <div><dt>Returns</dt><dd>{selected.returns}</dd></div>
              <div><dt>Warranty</dt><dd>{selected.warranty}</dd></div>
            </dl>

            <div className="citations" aria-label="Sources supporting this recommendation">
              <span>Sources</span>
              {selected.sourceIds.map((id, index) => (
                <button key={id} type="button" onClick={() => setSourceId(id)}>
                  [{index + 1}]
                </button>
              ))}
            </div>
          </article>

          <section className="alternatives" aria-labelledby="alternatives-title">
            <div className="section-heading">
              <div><p className="eyebrow">Other strong options</p><h2 id="alternatives-title">Compare the main trade-offs</h2></div>
            </div>
            <div className="alternative-list">
              {alternatives.map((product) => (
                <article className="alternative-row" key={product.id}>
                  <div>
                    <p className="alternative-row__label">{product.id.includes("asus") ? "Lowest price" : "Most predictable"}</p>
                    <h3>{product.name}</h3>
                    <p>{product.headline}</p>
                  </div>
                  <dl>
                    <div><dt>Price</dt><dd>{formatCurrency(product.price, product.currency, locale)}</dd></div>
                    <div><dt>Delivery</dt><dd>{product.delivery}</dd></div>
                    <div><dt>Main trade-off</dt><dd>{product.tradeoffs[0]}</dd></div>
                  </dl>
                  <Button variant="secondary" onClick={() => setSelectedId(product.id)}>Make main choice</Button>
                </article>
              ))}
            </div>
          </section>

          <SponsoredOffer />
        </main>

        <aside className="decision-summary" aria-label="Decision summary">
          <p className="eyebrow">Ready to prepare</p>
          <h2>{selected.name}</h2>
          <p className="decision-summary__price">{formatCurrency(selected.price, selected.currency, locale)}</p>
          <ul>
            <li>{selected.delivery}</li>
            <li>{selected.returns}</li>
            <li>{selected.warranty}</li>
          </ul>
          <Button variant="primary" onClick={() => navigate(`/confirm?product=${selected.id}`)}>
            Prepare to buy
          </Button>
          <p className="confirmation-note">No payment happens on this page. You will review every detail first.</p>
        </aside>
      </div>

      {activeSource && <SourcePanel source={activeSource} onClose={() => setSourceId(null)} />}
    </div>
  );
}
