import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { getTextDirection, resolveLocale } from "@/lib/locale";
import "@/styles/tokens.css";
import "@/styles/global.css";
import "@/styles/enhancements.css";

const locale = resolveLocale();
document.documentElement.lang = locale;
document.documentElement.dir = getTextDirection(locale);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
