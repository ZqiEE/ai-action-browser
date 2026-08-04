import { useState } from "react";
import { Button, IconButton } from "@/components/Button";
import { CloseIcon } from "@/components/Icons";

export function SponsoredOffer() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <section className="sponsored-offer" aria-labelledby="sponsored-title">
      <div className="sponsored-offer__content">
        <div className="sponsored-offer__heading">
          <span className="sponsored-label">Sponsored offer</span>
          <IconButton label="Hide sponsored offer" onClick={() => setHidden(true)}>
            <CloseIcon />
          </IconButton>
        </div>
        <h2 id="sponsored-title">Optional 5% cashback from a participating merchant</h2>
        <p>
          This offer appears after the independent comparison. It did not change which product was
          recommended.
        </p>
        <p className="cashback">Estimated cashback: $18 after an eligible purchase</p>
      </div>
      <Button variant="secondary">View offer terms</Button>
    </section>
  );
}
