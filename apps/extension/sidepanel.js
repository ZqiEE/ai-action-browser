import { buildTaskUrl, normalizeTabContext } from "./lib/context.mjs";
import {
  appendPageDetailsToGoal,
  extractPageSnapshot,
  normalizePageRead,
  pageReadToGoalText,
} from "./lib/page-read.mjs";

const form = document.querySelector("#task-form");
const goalInput = document.querySelector("#goal");
const includeContextInput = document.querySelector("#include-context");
const contextStatus = document.querySelector("#context-status");
const refreshButton = document.querySelector("#refresh-context");
const readPageButton = document.querySelector("#read-page");
const pageReadSection = document.querySelector("#page-read-section");
const pageReadPreview = document.querySelector("#page-read-preview");
const pageReadMessage = document.querySelector("#page-read-message");
const addPageDetailsButton = document.querySelector("#add-page-details");
const clearPageDetailsButton = document.querySelector("#clear-page-details");
const startButton = document.querySelector("#start-task");
const formError = document.querySelector("#form-error");

let currentTabId = null;
let currentContext = { available: false, reason: "Current page context has not been read yet." };

function selectedMode() {
  const input = document.querySelector('input[name="mode"]:checked');
  return input?.value ?? "search";
}

function clearPageRead(message = "") {
  pageReadPreview.value = "";
  pageReadPreview.disabled = false;
  pageReadSection.hidden = true;
  pageReadMessage.textContent = message;
  addPageDetailsButton.disabled = true;
}

function renderContext() {
  if (currentContext.available !== true) {
    contextStatus.textContent = currentContext.reason;
    includeContextInput.checked = false;
    includeContextInput.disabled = true;
    readPageButton.disabled = true;
    return;
  }

  contextStatus.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = currentContext.title;
  const host = document.createElement("span");
  host.textContent = currentContext.hostname;
  contextStatus.append(title, host);
  includeContextInput.disabled = false;
  readPageButton.disabled = false;
}

async function refreshContext() {
  contextStatus.textContent = "Reading the active page…";
  refreshButton.disabled = true;
  readPageButton.disabled = true;
  formError.textContent = "";
  clearPageRead();

  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    currentTabId = Number.isInteger(tab?.id) ? tab.id : null;
    currentContext = normalizeTabContext(tab);
  } catch {
    currentTabId = null;
    currentContext = {
      available: false,
      reason: "The current page could not be read. Reopen the extension from the page you want to use.",
    };
  } finally {
    renderContext();
    refreshButton.disabled = false;
  }
}

async function readCurrentPage() {
  formError.textContent = "";
  pageReadSection.hidden = false;
  pageReadPreview.value = "";
  pageReadPreview.disabled = true;
  addPageDetailsButton.disabled = true;
  readPageButton.disabled = true;
  pageReadMessage.textContent = "Reading visible page details after your explicit request…";

  try {
    if (currentContext.available !== true || !Number.isInteger(currentTabId)) {
      throw new Error("Open the extension from a normal Web page before reading page contents.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: extractPageSnapshot,
    });
    const pageRead = normalizePageRead(results?.[0]?.result);
    if (!pageRead) throw new Error("The page did not return readable details.");

    if (pageRead.sensitivePage) {
      pageReadPreview.value = "";
      pageReadMessage.textContent =
        "Page-content reading was blocked because this page contains a password, one-time-code, or payment-card field. Title and privacy-bounded URL metadata remain available.";
      return;
    }

    const text = pageReadToGoalText(pageRead);
    if (!text) {
      pageReadMessage.textContent = "No useful visible page details were found. Nothing was added to your task.";
      return;
    }

    pageReadPreview.disabled = false;
    pageReadPreview.value = text;
    addPageDetailsButton.disabled = false;
    pageReadMessage.textContent =
      "Review or edit these details. They stay in the extension until you explicitly add them to the goal.";
  } catch (error) {
    pageReadMessage.textContent =
      error instanceof Error
        ? error.message
        : "This page could not be read. Restricted browser pages do not allow page scripting.";
  } finally {
    readPageButton.disabled = currentContext.available !== true;
  }
}

function updateSubmitLabel() {
  const mode = selectedMode();
  startButton.textContent = mode === "search" ? "Start Search" : mode === "compare" ? "Start Compare" : "Start Prepare";
}

document.querySelectorAll('input[name="mode"]').forEach((input) => {
  input.addEventListener("change", updateSubmitLabel);
});

refreshButton.addEventListener("click", () => {
  void refreshContext();
});

readPageButton.addEventListener("click", () => {
  void readCurrentPage();
});

addPageDetailsButton.addEventListener("click", () => {
  const result = appendPageDetailsToGoal(goalInput.value, pageReadPreview.value, 1000);
  goalInput.value = result.goal;
  goalInput.focus();
  pageReadMessage.textContent = result.truncated
    ? "Page details were added visibly to the goal, truncated to the 1,000-character task limit. Review them before starting."
    : "Page details were added visibly to the goal. Review or edit them before starting.";
});

clearPageDetailsButton.addEventListener("click", () => {
  clearPageRead("Extracted page details were cleared without being added to the task.");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  startButton.disabled = true;

  try {
    const url = buildTaskUrl({
      mode: selectedMode(),
      goal: goalInput.value,
      context: currentContext,
      includeContext: includeContextInput.checked,
    });
    await chrome.tabs.create({ url, active: true });
  } catch (error) {
    formError.textContent = error instanceof Error ? error.message : "The browser task could not be opened.";
  } finally {
    startButton.disabled = false;
  }
});

void refreshContext();
