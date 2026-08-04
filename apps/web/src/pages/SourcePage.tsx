import { Link, useParams } from "react-router";
import { ExternalIcon } from "@/components/Icons";
import { demoSources } from "@/data/demo";
import { formatDate, resolveLocale } from "@/lib/locale";

export function SourcePage() {
  const { sourceId } = useParams();
  const source = demoSources.find((item) => item.id === sourceId);
  const locale = resolveLocale();

  if (!source) {
    return (
      <section className="simple-page">
        <h1>Source not found</h1>
        <p>The requested demo source is unavailable.</p>
        <Link to="/compare" className="text-link">Return to comparison</Link>
      </section>
    );
  }

  return (
    <article className="source-page">
      <Link to="/compare" className="back-link">← Back to comparison</Link>
      <p className="eyebrow">Source details</p>
      <h1>{source.publisher}</h1>
      <p className="source-page__title">{source.title}</p>

      <dl className="source-facts source-facts--page">
        <div><dt>Retrieved</dt><dd>{formatDate(source.retrievedAt, locale)}</dd></div>
        <div><dt>Source type</dt><dd>{source.type.replace("-", " ")}</dd></div>
        <div><dt>Freshness</dt><dd>{source.stale ? "May be out of date" : "Current for this demo"}</dd></div>
      </dl>

      <section className="content-section">
        <h2>What this source supports</h2>
        <p>{source.supports}</p>
      </section>

      {source.conflict && (
        <section className="inline-alert inline-alert--warning">
          <h2>Conflicting information</h2>
          <p>{source.conflict}</p>
        </section>
      )}

      <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
        Visit original page <ExternalIcon />
      </a>
      <p className="demo-caption">This route is a readable fallback for narrow screens and assistive technology.</p>
    </article>
  );
}
