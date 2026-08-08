import { Omniprompt } from "@/components/Omniprompt";

export function HomePage() {
  return (
    <div className="home-page">
      <section className="new-task" aria-labelledby="home-title">
        <div className="new-task__heading">
          <h1 id="home-title">New task</h1>
          <p>Search the web, compare options, or prepare a supported task.</p>
        </div>
        <Omniprompt />
      </section>

      <section className="browser-principles" aria-label="Browser guarantees">
        <span>Search stays normal search</span>
        <span>Compare does not accept paid ranking</span>
        <span>Important handoffs require confirmation</span>
      </section>
    </div>
  );
}
