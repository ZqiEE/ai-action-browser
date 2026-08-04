import { IconButton } from "@/components/Button";
import { CloseIcon, ExternalIcon } from "@/components/Icons";
import { formatDate, resolveLocale } from "@/lib/locale";
import type { SourceRecord } from "@/types";

interface SourcePanelProps {
  source: SourceRecord;
  onClose: () => void;
}

const typeLabels: Record<SourceRecord["type"], string> = {
  merchant: "Merchant listing",
  editorial: "Editorial review",
  "user-reviews": "User reviews",
};

export function SourcePanel({ source, onClose }: SourcePanelProps) {
  const locale = resolveLocale();

  return (
    <aside className="source-panel" aria-labelledby="source-panel-title">
      <div className="source-panel__header">
        <div>
          <p className="eyebrow">Source details</p>
          <h2 id="source-panel-title">{source.publisher}</h2>
        </div>
        <IconButton label="Close source details" onClick={onClose}><CloseIcon /></IconButton>
      </div>

      <dl className="source-facts">
        <div><dt>Title</dt><dd>{source.title}</dd></div>
        <div><dt>Type</dt><dd>{typeLabels[source.type]}</dd></div>
        <div><dt>Retrieved</dt><dd>{formatDate(source.retrievedAt, locale)}</dd></div>
        <div><dt>Freshness</dt><dd>{source.stale ? "May be out of date" : "Current for this demo"}</dd></div>
      </dl>

      <section className="source-panel__section">
        <h3>What this source supports</h3>
        <p>{source.supports}</p>
      </section>

      {source.conflict && (
        <section className="inline-alert inline-alert--warning" aria-label="Source conflict">
          <strong>Source conflict</strong>
          <p>{source.conflict}</p>
        </section>
      )}

      <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
        Visit original page <ExternalIcon />
      </a>
      <p className="demo-caption">External links and source status are included for prototype evaluation.</p>
    </aside>
  );
}
