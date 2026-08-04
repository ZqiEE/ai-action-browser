import type { OrderPreview, ProductOption, SourceRecord } from "@/types";

export const demoNotice =
  "Demo data for interface testing. Prices, availability, merchant status, and delivery estimates are not live.";

export const demoSources: SourceRecord[] = [
  {
    id: "bestbuy-yoga",
    publisher: "Best Buy",
    title: "Lenovo Yoga Pro 7 product listing",
    url: "https://www.bestbuy.com/",
    retrievedAt: "2026-08-04T07:00:00.000Z",
    type: "merchant",
    supports: "Listed price, shipping estimate, and return-window information.",
    stale: false,
  },
  {
    id: "review-yoga",
    publisher: "Independent review publication",
    title: "Yoga Pro 7 performance and battery review",
    url: "https://example.com/review/yoga-pro-7",
    retrievedAt: "2026-08-03T17:00:00.000Z",
    type: "editorial",
    supports: "Performance, battery, thermal behavior, and upgrade limitations.",
    stale: false,
    conflict:
      "One review reports louder fans during sustained 4K exports than another source.",
  },
  {
    id: "amazon-vivobook",
    publisher: "Amazon",
    title: "ASUS Vivobook 16 product listing",
    url: "https://www.amazon.com/",
    retrievedAt: "2026-08-04T06:30:00.000Z",
    type: "merchant",
    supports: "Listed price and delivery estimate.",
    stale: false,
  },
  {
    id: "apple-macbook",
    publisher: "Apple",
    title: "MacBook Air product listing",
    url: "https://www.apple.com/macbook-air/",
    retrievedAt: "2026-08-04T06:00:00.000Z",
    type: "merchant",
    supports: "Listed price, warranty, and product configuration.",
    stale: false,
  },
];

export const demoProducts: ProductOption[] = [
  {
    id: "lenovo-yoga-pro-7",
    name: "Lenovo Yoga Pro 7",
    merchant: "Best Buy",
    price: 949,
    currency: "USD",
    headline: "Best balance for video editing under the stated budget.",
    strengths: [
      "Strong editing performance without exceeding the $1,000 limit.",
      "Estimated delivery by Friday with a 30-day return window.",
    ],
    tradeoffs: [
      "Memory is soldered and cannot be upgraded later.",
      "Fan noise may be noticeable during sustained exports.",
    ],
    delivery: "Estimated by Friday",
    returns: "30-day returns",
    warranty: "1-year limited warranty",
    sourceIds: ["bestbuy-yoga", "review-yoga"],
  },
  {
    id: "asus-vivobook-16",
    name: "ASUS Vivobook 16",
    merchant: "Amazon",
    price: 799,
    currency: "USD",
    headline: "Lowest price while preserving a large display.",
    strengths: ["Lowest upfront price.", "Large 16-inch display."],
    tradeoffs: ["Average color accuracy for professional video work."],
    delivery: "Estimated in 3–5 days",
    returns: "30-day returns",
    warranty: "1-year limited warranty",
    sourceIds: ["amazon-vivobook"],
  },
  {
    id: "macbook-air-m2",
    name: "MacBook Air M2",
    merchant: "Apple",
    price: 999,
    currency: "USD",
    headline: "Most predictable battery life and resale value.",
    strengths: ["Long battery life.", "Stable software and high resale value."],
    tradeoffs: ["Base configuration includes only 256 GB of storage."],
    delivery: "Estimated in 2–4 days",
    returns: "14-day returns",
    warranty: "1-year limited warranty",
    sourceIds: ["apple-macbook"],
  },
];

export const demoOrder: OrderPreview = {
  productId: "lenovo-yoga-pro-7",
  destinationDomain: "bestbuy.com",
  merchantName: "Best Buy",
  subtotal: 899,
  tax: 50,
  shipping: 0,
  total: 949,
  cashback: 18,
  currency: "USD",
  deliveryDate: "2026-08-07T12:00:00.000Z",
  returnDeadline: "2026-09-06T12:00:00.000Z",
  deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
  paymentLabel: "Visa ending in 4242",
  sharedData: [
    "Name and shipping address",
    "Email address for the receipt",
    "Single-use payment token",
  ],
  retainedData: [
    "Full card number stays with the payment provider",
    "Browser history is not included in the order request",
  ],
};
