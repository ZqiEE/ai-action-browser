import { describe, expect, it } from "vitest";
import { addBrowserPageContext, readBrowserPageContext } from "./browserContext";

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

  it("keeps current-page metadata separate from the user goal", () => {
    const params = addBrowserPageContext(
      new URLSearchParams({ q: "Compare this with better laptops under $1,000" }),
      {
        source: "extension",
        title: "Laptop product page",
        url: "https://shop.example/products/laptop-1",
        hostname: "shop.example",
      },
    );

    expect(params.get("q")).toBe("Compare this with better laptops under $1,000");
    expect(params.get("ctx_title")).toBe("Laptop product page");
    expect(params.get("ctx_url")).toBe("https://shop.example/products/laptop-1");
  });

  it("does not add context fields when no extension context is present", () => {
    const params = addBrowserPageContext(new URLSearchParams({ q: "normal Web search" }), null);
    expect(params.get("q")).toBe("normal Web search");
    expect([...params.keys()].some((key) => key.startsWith("ctx_"))).toBe(false);
  });
});
