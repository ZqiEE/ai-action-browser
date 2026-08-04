import { Link } from "react-router";
import { Omniprompt } from "@/components/Omniprompt";

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <p className="eyebrow">Free action browser</p>
          <h1 id="home-title">What do you want to find or get done?</h1>
          <p>
            Search normally, compare options, or prepare a task. You stay in control before
            anything important happens.
          </p>
        </div>

        <Omniprompt initialValue="Find a laptop under $1,000 for video editing, delivered by next week, with free returns." />

        <div className="home-examples" aria-label="Example tasks">
          <button type="button">Compare carry-on bags for a U.S. flight</button>
          <button type="button">Find a family hotel near Central Park</button>
          <button type="button">Prepare a grocery pickup order</button>
        </div>
      </section>

      <section className="recent-task" aria-labelledby="recent-task-title">
        <div>
          <p className="eyebrow">Recent task</p>
          <h2 id="recent-task-title">Laptop comparison</h2>
          <p>Three options reviewed · Demo data · No purchase made</p>
        </div>
        <Link to="/compare?q=laptop&mode=compare" className="text-link">Open comparison</Link>
      </section>

      <footer className="home-footer">
        <p>Free to use · No account required · Important actions always require your confirmation</p>
        <p>Designed for people worldwide. This prototype uses U.S. English and U.S. shopping examples.</p>
      </footer>
    </div>
  );
}
