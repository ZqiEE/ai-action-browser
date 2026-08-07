import { describe, expect, it } from "vitest";
import { contextualizeGoal, readBrowserPageContext } from "./browserContext";

describe("browser extension context", () => {
  it("accepts only explicit extension context and strips sensitive URL parts", () => {
    const params = new URLSearchParams({
      ctx_source: "extension",
      ctx_title: "  Product   page  ",
      ctx_url: "https://user:secret@shop.example/products/1?session=abc#checkout",
    });

    expect(readBrowserPageContext(params)).toEqual({
      source: "extension",
      title: "Product page",
      url: "https://shop.example/products/1",
      hostname: "shop.example",
    });
  });

  it("ignores untrusted or unsupported context", () => {
    expect(
      readBrowserPageContext(
        new URLSearchParams({ ctx_source: "web", ctx_url: "https://example.com/private" }),
      ),
    ).toBeNull();
    expect(
      readBrowserPageContext(
        new URLSearchParams({ ctx_source: "extension", ctx_url: "chrome://settings" }),
      ),
    ).toBeNull();
  });

  it("keeps the user goal and bounded current-page context inside upstream query limits", () => {
    const context = readBrowserPageContext(
      new URLSearchParams({
        ctx_source: "extension",
        ctx_title: "Laptop product page",
        ctx_url: "https://shop.example/products/laptop-1",
      }),
    );
    const query = contextualizeGoal("Compare this with better laptops under $1,000", context, 500);

    expect(query).toContain("User goal: Compare this with better laptops under $1,000");
    expect(query).toContain("Current page title: Laptop product page");
    expect(query).toContain("Current page URL: https://shop.example/products/laptop-1");
    expect(query.length).toBeLessThanOrEqual(500);
  });

  it("leaves a normal browser goal unchanged when no extension context is present", () => {
    expect(contextualizeGoal("normal Web search", null, 500)).toBe("normal Web search");
  });
});
