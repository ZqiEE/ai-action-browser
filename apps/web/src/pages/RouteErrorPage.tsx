import { Status } from "@/components/FormPrimitives";
import { Link } from "@/lib/navigation";

export function RouteErrorPage({ error }: { error?: unknown }) {
  const title = "This page could not be opened";
  const detail =
    error instanceof Error && error.message
      ? error.message
      : "An unexpected interface error occurred. No purchase, submission, or other external action was performed.";

  return (
    <main className="route-error">
      <p className="eyebrow">Safe recovery</p>
      <h1>{title}</h1>
      <Status tone="danger">{detail}</Status>
      <div className="route-error__actions">
        <Link to="/" className="button button--primary">Return home</Link>
        <button type="button" className="button button--secondary" onClick={() => window.location.reload()}>
          Try this page again
        </button>
      </div>
    </main>
  );
}
