export const DEFAULT_APP_BASE_URL = "https://zqiee.github.io/ai-action-browser/";

const MAX_GOAL_LENGTH = 500;
const MAX_TITLE_LENGTH = 240;
const MAX_URL_LENGTH = 1800;
const MODES = new Set(["search", "compare", "prepare"]);

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function privacyBoundedPageUrl(url) {
  const bounded = new URL(url.toString());
  bounded.username = "";
  bounded.password = "";
  bounded.search = "";
  bounded.hash = "";
  return bounded.toString();
}

export function normalizeTabContext(tab) {
  const rawUrl = clean(tab?.url, MAX_URL_LENGTH);
  if (!rawUrl) return { available: false, reason: "No current Web page is available." };

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { available: false, reason: "The current page URL is invalid." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { available: false, reason: "Current-page context is available only on normal Web pages." };
  }

  return {
    available: true,
    title: clean(tab?.title, MAX_TITLE_LENGTH) || url.hostname,
    url: privacyBoundedPageUrl(url),
    hostname: url.hostname,
  };
}

export function buildTaskUrl({
  appBaseUrl = DEFAULT_APP_BASE_URL,
  mode,
  goal,
  context,
  includeContext = true,
}) {
  if (!MODES.has(mode)) throw new Error("Unsupported browser task mode.");

  const normalizedGoal = clean(goal, MAX_GOAL_LENGTH);
  if (!normalizedGoal) throw new Error("Enter a goal before starting the task.");

  const appUrl = new URL(appBaseUrl);
  if (appUrl.protocol !== "https:" && !(appUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(appUrl.hostname))) {
    throw new Error("The AI browser application URL must use HTTPS, except for local development.");
  }

  const params = new URLSearchParams({ q: normalizedGoal });
  let route = "search";

  if (mode === "compare") {
    route = "compare";
    params.set("mode", "compare");
  } else if (mode === "prepare") {
    route = "compare";
    params.set("mode", "prepare");
  }

  if (includeContext && context?.available === true) {
    params.set("ctx_source", "extension");
    params.set("ctx_title", clean(context.title, MAX_TITLE_LENGTH));
    params.set("ctx_url", clean(context.url, MAX_URL_LENGTH));
  }

  appUrl.hash = `/${route}?${params.toString()}`;
  return appUrl.toString();
}
