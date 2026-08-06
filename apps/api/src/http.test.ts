import { describe, expect, it } from "vitest";
import {
  ApiError,
  normalizeProviderDomain,
  parseIsoDate,
  parseProviderHttpsUrl,
  parsePublicHttpUrl,
  stringifyBoundedJson,
} from "./http";

describe("provider URL validation", () => {
  it("accepts the provider hostname and its HTTPS subdomains", () => {
    expect(normalizeProviderDomain("Shop.Example.com.")).toBe("shop.example.com");
    expect(
      parseProviderHttpsUrl(
        "https://checkout.shop.example.com/cart/123",
        "shop.example.com",
        "prepare_url",
      ),
    ).toBe("https://checkout.shop.example.com/cart/123");
  });

  it("rejects credentials, non-HTTPS schemes, and unrelated domains", () => {
    expect(() =>
      parseProviderHttpsUrl(
        "javascript:alert(1)",
        "shop.example.com",
        "prepare_url",
      ),
    ).toThrow(ApiError);
    expect(() =>
      parseProviderHttpsUrl(
        "http://shop.example.com/cart",
        "shop.example.com",
        "prepare_url",
      ),
    ).toThrow(/HTTPS/);
    expect(() =>
      parseProviderHttpsUrl(
        "https://evil.example/cart",
        "shop.example.com",
        "prepare_url",
      ),
    ).toThrow(/provider domain/);
  });

  it("filters unsafe public search URLs", () => {
    expect(parsePublicHttpUrl("https://example.com/page")?.hostname).toBe("example.com");
    expect(parsePublicHttpUrl("data:text/html,hello")).toBeNull();
    expect(parsePublicHttpUrl("https://user:pass@example.com/private")).toBeNull();
  });
});

describe("bounded provider input", () => {
  it("rejects invalid and far-future timestamps", () => {
    expect(() => parseIsoDate("not-a-date", "occurred_at")).toThrow(ApiError);
    expect(() =>
      parseIsoDate(new Date(Date.now() + 60_000).toISOString(), "occurred_at", {
        maxFutureMs: 1_000,
      }),
    ).toThrow(/future/);
  });

  it("rejects oversized evidence", () => {
    expect(() => stringifyBoundedJson({ value: "x".repeat(100) }, "evidence", 16)).toThrow(
      /too large/,
    );
  });
});
