import { describe, expect, it } from "vitest";
import { discoveryGoal, normalizeBrowserPageContext } from "./browser-context";
import { ApiError } from "./http";

describe("ephemeral browser page context", () => {
  it("removes query parameters and fragments server-side", () => {
    const context = normalizeBrowserPageContext({
      title: "  Example   product  ",
      url: "https://shop.example/products/one?session=secret#checkout",
    });

    expect(context).toEqual({
      title: "Example product",
      url: "https://shop.example/products/one",
      hostname: "shop.example",
    });
  });

  it("rejects embedded URL credentials", () => {
    expect(() =>
      normalizeBrowserPageContext({
        title: "Private",
        url: "https://user:password@example.test/account",
      }),
    ).toThrow(ApiError);
  });

  it("builds transient discovery text without changing the original goal", () => {
    const goal = "Compare this with better options";
    const context = normalizeBrowserPageContext({
      title: "Model X",
      url: "https://shop.example/products/x",
    });
    const effective = discoveryGoal(goal, context);

    expect(goal).toBe("Compare this with better options");
    expect(effective).toContain(goal);
    expect(effective).toContain("Current page title: Model X");
    expect(effective).toContain("https://shop.example/products/x");
  });

  it("returns the goal unchanged without page context", () => {
    expect(discoveryGoal("Find project software", null)).toBe("Find project software");
  });
});
