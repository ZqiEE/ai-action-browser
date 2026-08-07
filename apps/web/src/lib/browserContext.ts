export interface BrowserPageContext {
  source: "extension";
  title: string;
  url: string;
  hostname: string;
}

function clean(value: string | null | undefined, maxLength: number): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function privacyBoundedUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function readBrowserPageContext(searchParams: URLSearchParams): BrowserPageContext | null {
  if (searchParams.get("ctx_source") !== "extension") return null;

  const url = privacyBoundedUrl(clean(searchParams.get("ctx_url"), 1800));
  if (!url) return null;

  return {
    source: "extension",
    title: clean(searchParams.get("ctx_title"), 240) || url.hostname,
    url: url.toString(),
    hostname: url.hostname,
  };
}

export function contextualizeGoal(
  goalValue: string,
  context: BrowserPageContext | null,
  maxLength: number,
): string {
  const goal = clean(goalValue, maxLength);
  if (!context) return goal;

  const contextTitle = clean(context.title, 160);
  const contextUrl = clean(context.url, 240);
  const suffix = `\nCurrent page title: ${contextTitle}\nCurrent page URL: ${contextUrl}`;
  const prefix = "User goal: ";
  const goalBudget = Math.max(1, maxLength - prefix.length - suffix.length);
  return `${prefix}${goal.slice(0, goalBudget)}${suffix}`.slice(0, maxLength);
}
