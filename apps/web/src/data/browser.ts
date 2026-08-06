import type { ProviderRecord, SearchResult } from "@/types";

export const demoSearchResults: SearchResult[] = [
  {
    id: "search-browser-definition",
    title: "What is an AI browser?",
    url: "https://example.com/ai-browser-overview",
    displayUrl: "example.com / ai-browser-overview",
    snippet:
      "An AI-native browser combines ordinary web navigation with assisted search, comparison, and user-controlled task preparation.",
    sourceType: "editorial",
    retrievedAt: "2026-08-06T10:00:00.000Z",
  },
  {
    id: "search-laptop-guide",
    title: "Laptop buying guide for video editing",
    url: "https://example.com/video-editing-laptop-guide",
    displayUrl: "example.com / video-editing-laptop-guide",
    snippet:
      "A practical guide to processors, memory, displays, storage, thermals, returns, and warranties for editing workloads.",
    sourceType: "editorial",
    retrievedAt: "2026-08-06T09:40:00.000Z",
  },
  {
    id: "search-merchant-results",
    title: "Current laptop listings from supported demo providers",
    url: "https://example.com/provider-listings",
    displayUrl: "example.com / provider-listings",
    snippet:
      "Demo merchant listings used to test the transition from normal Search to independent Compare and Prepare behavior.",
    sourceType: "merchant",
    retrievedAt: "2026-08-06T09:30:00.000Z",
  },
];

export const demoProviders: ProviderRecord[] = [
  {
    id: "provider-bestbuy-demo",
    name: "Best Buy demo provider",
    domain: "bestbuy.com",
    integrationStatus: "demo",
    capabilities: [
      "normalized product feed",
      "price and availability evidence",
      "Prepare handoff",
      "outcome attribution token",
      "refund and reversal reporting",
    ],
    commercialModel: "Demo only — no active commercial agreement.",
    recommendationIndependent: true,
  },
  {
    id: "provider-amazon-demo",
    name: "Amazon demo provider",
    domain: "amazon.com",
    integrationStatus: "demo",
    capabilities: ["normalized product feed", "price evidence", "Prepare handoff"],
    commercialModel: "Demo only — no active commercial agreement.",
    recommendationIndependent: true,
  },
  {
    id: "provider-apple-demo",
    name: "Apple demo provider",
    domain: "apple.com",
    integrationStatus: "demo",
    capabilities: ["normalized product feed", "warranty evidence", "Prepare handoff"],
    commercialModel: "Demo only — no active commercial agreement.",
    recommendationIndependent: true,
  },
];
