import { buildTaskUrl, normalizeTabContext } from "./lib/context.mjs";

const form = document.querySelector("#task-form");
const goalInput = document.querySelector("#goal");
const includeContextInput = document.querySelector("#include-context");
const contextStatus = document.querySelector("#context-status");
const refreshButton = document.querySelector("#refresh-context");
const startButton = document.querySelector("#start-task");
const formError = document.querySelector("#form-error");

let currentContext = { available: false, reason: "Current page context has not been read yet." };

function selectedMode() {
  const input = document.querySelector('input[name="mode"]:checked');
  return input?.value ?? "search";
}

function renderContext() {
  if (currentContext.available !== true) {
    contextStatus.textContent = currentContext.reason;
    includeContextInput.checked = false;
    includeContextInput.disabled = true;
    return;
  }

  contextStatus.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = currentContext.title;
  const host = document.createElement("span");
  host.textContent = currentContext.hostname;
  contextStatus.append(title, host);
  includeContextInput.disabled = false;
}

async function refreshContext() {
  contextStatus.textContent = "Reading the active page…";
  refreshButton.disabled = true;
  formError.textContent = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    currentContext = normalizeTabContext(tab);
  } catch {
    currentContext = {
      available: false,
      reason: "The current page could not be read. Reopen the extension from the page you want to use.",
    };
  } finally {
    renderContext();
    refreshButton.disabled = false;
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
