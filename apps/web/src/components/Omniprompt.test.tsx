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

  it("keeps Search as default and lets the user choose Compare with the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <HashRouter>
        <Omniprompt initialValue="Compare laptops under $1,000" />
        <LocationProbe />
      </HashRouter>,
    );

    const input = screen.getByRole("textbox", { name: /search, compare, or prepare/i });
    await user.click(input);

    expect(screen.getByRole("option", { name: /search the web/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByLabelText("current route")).toHaveTextContent("/compare?mode=compare");
  });
});
