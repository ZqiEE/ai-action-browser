const MAX_SELECTION = 1000;
const MAX_DESCRIPTION = 600;
const MAX_HEADING = 180;
const MAX_HEADINGS = 6;
const MAX_EXCERPT = 2400;

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

export function normalizePageRead(value) {
  if (!value || typeof value !== "object") return null;

  const sensitivePage = value.sensitivePage === true;
  const headings = Array.isArray(value.headings)
    ? value.headings.map((item) => clean(item, MAX_HEADING)).filter(Boolean).slice(0, MAX_HEADINGS)
    : [];

  return {
    sensitivePage,
    description: sensitivePage ? "" : clean(value.description, MAX_DESCRIPTION),
    headings: sensitivePage ? [] : headings,
    selectedText: sensitivePage ? "" : clean(value.selectedText, MAX_SELECTION),
    excerpt: sensitivePage ? "" : clean(value.excerpt, MAX_EXCERPT),
  };
}

export function pageReadToGoalText(pageRead) {
  const normalized = normalizePageRead(pageRead);
  if (!normalized || normalized.sensitivePage) return "";

  const parts = [];
  if (normalized.selectedText) parts.push(`Selected text: ${normalized.selectedText}`);
  if (normalized.description) parts.push(`Page description: ${normalized.description}`);
  if (normalized.headings.length > 0) parts.push(`Page headings: ${normalized.headings.join(" | ")}`);
  if (normalized.excerpt) parts.push(`Visible page excerpt: ${normalized.excerpt}`);
  return parts.join("\n");
}

export function extractPageSnapshot() {
  const cleanPageText = (value, maxLength) =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";

  const sensitiveSelectors = [
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[autocomplete="new-password"]',
    'input[autocomplete="one-time-code"]',
    'input[autocomplete="cc-number"]',
    'input[autocomplete="cc-csc"]',
  ];
  const sensitivePage = sensitiveSelectors.some((selector) => document.querySelector(selector));
  if (sensitivePage) {
    return { sensitivePage: true, description: "", headings: [], selectedText: "", excerpt: "" };
  }

  const description = cleanPageText(
    document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    600,
  );
  const headings = [...document.querySelectorAll("h1, h2")]
    .map((element) => cleanPageText(element.textContent ?? "", 180))
    .filter(Boolean)
    .slice(0, 6);
  const selectedText = cleanPageText(window.getSelection()?.toString() ?? "", 1000);

  const source = document.querySelector("main, article, [role='main']") ?? document.body;
  let excerpt = "";
  if (source) {
    const clone = source.cloneNode(true);
    if (clone instanceof Element) {
      clone
        .querySelectorAll(
          "script,style,noscript,form,input,textarea,select,button,[contenteditable='true'],nav,header,footer",
        )
        .forEach((element) => element.remove());
      excerpt = cleanPageText(clone.textContent ?? "", 2400);
    }
  }

  return { sensitivePage: false, description, headings, selectedText, excerpt };
}
