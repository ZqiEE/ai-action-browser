import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Status } from "@/components/FormPrimitives";

export function RouteErrorPage() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "This page could not be opened";
  const detail = isRouteErrorResponse(error)
    ? "The requested route returned an error. Your task has not been executed."
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
