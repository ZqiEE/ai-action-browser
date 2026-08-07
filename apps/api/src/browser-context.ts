import { ApiError, cleanText } from "./http";
import type { BrowserPageContextInput } from "./types";

export interface BrowserPageContext {
  title: string;
  url: string;
  hostname: string;
}

function cleanTitle(value: unknown): string {
  return cleanText(value, 240).replace(/\s+/g, " ");
}

export function normalizeBrowserPageContext(
  value: BrowserPageContextInput | null | undefined,
): BrowserPageContext | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object") {
    throw new ApiError(400, "invalid_page_context", "Page context must be an object.");
  }

  const rawUrl = cleanText(value.url, 1_800);
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "invalid_page_context_url", "Page context URL is invalid.");
  }

  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
    throw new ApiError(
      400,
      "invalid_page_context_url",
      "Page context URL must use HTTP or HTTPS without embedded credentials.",
    );
  }

  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";

  return {
    title: cleanTitle(value.title) || url.hostname,
    url: url.toString(),
    hostname: url.hostname,
  };
}

export function discoveryGoal(
  goalValue: string,
  context: BrowserPageContext | null,
  maxLength = 1_400,
): string {
  const goal = cleanText(goalValue, maxLength);
  if (!context) return goal;

  const suffix = `\nCurrent page title: ${context.title}\nCurrent page location: ${context.url}`;
  const available = Math.max(1, maxLength - suffix.length);
  return `${goal.slice(0, available)}${suffix}`.slice(0, maxLength);
}
