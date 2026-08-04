import type { IntentMode } from "@/types";

export interface IntentSuggestion {
  mode: Exclude<IntentMode, "search">;
  reason: string;
}

const comparePatterns = [
  /\bcompare\b/i,
  /\bbest\b.*\b(option|choice|deal|value)\b/i,
  /\bunder\s+\$?\d/i,
  /\bversus\b|\bvs\.?\b/i,
  /\bwhich\s+(one|product|hotel|flight|plan)\b/i,
];

const preparePatterns = [
  /\bprepare\b/i,
  /\bfill\s+(out|in)\b/i,
  /\bbook\b|\breserve\b/i,
  /\border\b|\bbuy\b|\bpurchase\b/i,
  /\bsubmit\b|\bsend\b|\bschedule\b/i,
];

export function suggestIntent(value: string): IntentSuggestion | null {
  const normalized = value.trim();
  if (normalized.length < 8) return null;

  const prepareMatches = preparePatterns.filter((pattern) => pattern.test(normalized)).length;
  const compareMatches = comparePatterns.filter((pattern) => pattern.test(normalized)).length;

  if (prepareMatches > compareMatches && prepareMatches > 0) {
    return {
      mode: "prepare",
      reason: "This sounds like a task that can be prepared for your review.",
    };
  }

  if (compareMatches > 0) {
    return {
      mode: "compare",
      reason: "This request includes choices or constraints that are easier to compare.",
    };
  }

  return null;
}
