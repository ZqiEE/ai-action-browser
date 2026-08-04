import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="simple-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page may have moved, or the task link may no longer be available.</p>
      <Link to="/" className="text-link">Return home</Link>
    </section>
  );
}
