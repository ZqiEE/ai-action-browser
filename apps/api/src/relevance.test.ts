import { describe, expect, it } from "vitest";
import { goalTokens, offerRelevanceScore, rankOffersForGoal } from "./relevance";
import type { OfferRow } from "./types";

function offer(overrides: Partial<OfferRow>): OfferRow {
  return {
    id: "offer",
    provider_id: "provider",
    provider_name: "Provider",
    provider_domain: "provider.test",
    category: "laptop",
    title: "Laptop",
    description: "",
    price: 999,
    currency: "USD",
    availability: "in_stock",
    delivery_text: "",
    returns_text: "",
    warranty_text: "",
    prepare_url: "https://provider.test/prepare",
    source_url: "https://provider.test/source",
    evidence_json: "{}",
    retrieved_at: "2026-08-08T00:00:00Z",
    ...overrides,
  };
}

describe("category-neutral Provider relevance", () => {
  it("removes generic instruction words from goal tokens", () => {
    expect(goalTokens("Compare this current page with better laptop options for video editing"))
      .toEqual(expect.arrayContaining(["laptop", "video", "editing"]));
    expect(goalTokens("Compare this current page with better laptop options")).not.toContain("compare");
  });

  it("prefers a software offer for a software goal without an explicit category", () => {
    const offers = [
      offer({ id: "laptop", category: "laptop", title: "Creator Laptop" }),
      offer({
        id: "software",
        category: "software",
        title: "Project management software",
        description: "Team planning and collaboration for small companies",
        price: 29,
      }),
      offer({ id: "travel", category: "travel", title: "Hotel booking" }),
    ];

    const ranked = rankOffersForGoal(
      offers,
      "Find project management software for a small team under $50",
      50,
      false,
    );

    expect(ranked[0]?.id).toBe("software");
  });

  it("returns no cross-category guess when nothing is relevant", () => {
    const offers = [
      offer({ id: "laptop", category: "laptop", title: "Creator Laptop" }),
      offer({ id: "hotel", category: "travel", title: "City hotel room" }),
    ];

    expect(rankOffersForGoal(offers, "Schedule a dentist appointment", null, false)).toEqual([]);
  });

  it("keeps explicit-category offers available even when wording is sparse", () => {
    const offers = [
      offer({ id: "one", category: "laptop", title: "Model One", price: 900 }),
      offer({ id: "two", category: "laptop", title: "Model Two", price: 700 }),
    ];

    expect(rankOffersForGoal(offers, "show me choices", 800, true).map((item) => item.id)).toEqual([
      "two",
      "one",
    ]);
  });

  it("does not use commercial fields because they do not exist in the ranking row", () => {
    const software = offer({
      category: "software",
      title: "Secure note software",
      description: "Encrypted notes",
      price: 10,
    });
    expect(offerRelevanceScore(software, "secure note software")).toBeGreaterThan(0);
    expect("commission" in software).toBe(false);
    expect("bid" in software).toBe(false);
    expect("expected_revenue" in software).toBe(false);
  });
});
