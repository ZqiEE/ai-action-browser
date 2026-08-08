import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Omniprompt } from "@/components/Omniprompt";
import { HashRouter, useLocation } from "@/lib/navigation";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current route">{`${location.pathname}${location.search}`}</output>;
}

describe("Omniprompt", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", `${window.location.pathname}#/`);
  });

  it("keeps Search as the stable default and changes mode only after an explicit click", async () => {
    const user = userEvent.setup();

    render(
      <HashRouter>
        <Omniprompt initialValue="Compare laptops under $1,000" />
        <LocationProbe />
      </HashRouter>,
    );

    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Compare" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Compare" }));
    expect(screen.getByRole("button", { name: "Compare" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /continue with compare/i }));

    expect(screen.getByLabelText("current route")).toHaveTextContent("/compare?mode=compare");
  });
});
