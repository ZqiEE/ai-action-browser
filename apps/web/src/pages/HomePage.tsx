import { Link } from "react-router";
import { Omniprompt } from "@/components/Omniprompt";

const examples = [
  {
    label: "Compare laptops under $1,000",
    to: "/compare?mode=compare&q=Find%20a%20laptop%20under%20%241%2C000%20for%20video%20editing%20with%20free%20returns",
  },
  {
    label: "Search the Web normally",
    to: "/search?q=What%20is%20an%20AI-native%20browser%3F",
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <p className="eyebrow">Completely free AI browser</p>
          <h1 id="home-title">What do you want to find or get done?</h1>
          <p>
            Search normally, compare active provider results, or prepare a task. You review the
            destination and shared data before any important handoff.
          </p>
        </div>

        <Omniprompt initialValue="Find a laptop under $1,000 for video editing, delivered by next week, with free returns." />

        <div className="home-examples" aria-label="Example browser tasks">
          {examples.map((example) => (
            <Link key={example.to} to={example.to}>{example.label}</Link>
          ))}
        </div>
      </section>

      <section className="recent-task" aria-labelledby="browser-model-title">
        <div>
          <p className="eyebrow">Browser model</p>
          <h2 id="browser-model-title">Search → Compare → Prepare → Confirm</h2>
          <p>Normal Search stays normal. Cross-provider work starts only after you choose it.</p>
        </div>
        <Link to="/providers" className="text-link">Provider integration</Link>
      </section>

      <footer className="home-footer">
        <p>Free for consumers · No paid ranking · Important handoffs require confirmation</p>
        <p>Providers can pay for software and verified outcomes, never for the independent best-result position.</p>
      </footer>
    </div>
  );
}
