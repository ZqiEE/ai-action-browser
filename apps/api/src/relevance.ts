import type { OfferRow } from "./types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "better",
  "by",
  "compare",
  "current",
  "find",
  "for",
  "from",
  "goal",
  "in",
  "is",
  "me",
  "of",
  "on",
  "option",
  "options",
  "or",
  "page",
  "please",
  "the",
  "this",
  "to",
  "under",
  "url",
  "user",
  "with",
]);

function normalize(value: string): string {
  return value.toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}

export function goalTokens(value: string): string[] {
  const matches = normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(matches.filter((token) => token.length >= 2 && !STOP_WORDS.has(token)))].slice(0, 40);
}

export function offerRelevanceScore(offer: OfferRow, goal: string): number {
  const normalizedGoal = normalize(goal);
  const category = normalize(offer.category);
  const title = normalize(offer.title);
  const description = normalize(offer.description);
  const tokens = goalTokens(goal);

  let score = 0;
  if (category && normalizedGoal.includes(category)) score += 16;
  if (title && normalizedGoal.includes(title)) score += 20;

  for (const token of tokens) {
    if (category.includes(token)) score += 6;
    if (title.includes(token)) score += 4;
    if (description.includes(token)) score += 1;
  }

  return score;
}

function isWithinBudget(offer: OfferRow, budget: number | null): boolean {
  return budget === null || offer.price <= budget;
}

function isInStock(offer: OfferRow): boolean {
  return normalize(offer.availability) === "in_stock";
}

export function rankOffersForGoal(
  offers: OfferRow[],
  goal: string,
  budget: number | null,
  explicitCategory: boolean,
  limit = 3,
): OfferRow[] {
  const scored = offers.map((offer) => ({ offer, score: offerRelevanceScore(offer, goal) }));
  const relevant = explicitCategory ? scored : scored.filter((item) => item.score > 0);
  if (relevant.length === 0) return [];

  const anyWithinBudget = budget !== null && relevant.some((item) => isWithinBudget(item.offer, budget));

  relevant.sort((left, right) => {
    if (left.score !== right.score) return right.score - left.score;

    if (anyWithinBudget) {
      const leftWithin = isWithinBudget(left.offer, budget);
      const rightWithin = isWithinBudget(right.offer, budget);
      if (leftWithin !== rightWithin) return leftWithin ? -1 : 1;
    }

    const leftStock = isInStock(left.offer);
    const rightStock = isInStock(right.offer);
    if (leftStock !== rightStock) return leftStock ? -1 : 1;

    if (left.offer.price !== right.offer.price) return left.offer.price - right.offer.price;
    return right.offer.retrieved_at.localeCompare(left.offer.retrieved_at);
  });

  return relevant.slice(0, Math.max(1, limit)).map((item) => item.offer);
}
