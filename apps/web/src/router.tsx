import { createHashRouter } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ComparePage } from "@/pages/ComparePage";
import { ConfirmPage } from "@/pages/ConfirmPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { SourcePage } from "@/pages/SourcePage";

// Hash routing keeps the prototype deployable on static hosts such as GitHub Pages
// without requiring a server-side fallback for every client route.
export const router = createHashRouter([
  {
    path: "/",
    Component: AppShell,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: "compare", Component: ComparePage },
      { path: "sources/:sourceId", Component: SourcePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/confirm",
    Component: ConfirmPage,
    ErrorBoundary: RouteErrorPage,
  },
]);
