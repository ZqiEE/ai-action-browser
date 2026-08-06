import { createHashRouter } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ComparePage } from "@/pages/ComparePage";
import { ConfirmPage } from "@/pages/ConfirmPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OutcomePage } from "@/pages/OutcomePage";
import { ProviderPage } from "@/pages/ProviderPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { SearchPage } from "@/pages/SearchPage";
import { SourcePage } from "@/pages/SourcePage";

// Hash routing keeps the Web surface deployable on static hosts without requiring a
// server-side fallback for each browser route. Live data is provided by the production API.
export const router = createHashRouter([
  {
    path: "/",
    Component: AppShell,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "compare", Component: ComparePage },
      { path: "providers", Component: ProviderPage },
      { path: "sources/:sourceId", Component: SourcePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/confirm",
    Component: ConfirmPage,
    ErrorBoundary: RouteErrorPage,
  },
  {
    path: "/outcomes/:outcomeId",
    Component: OutcomePage,
    ErrorBoundary: RouteErrorPage,
  },
]);
