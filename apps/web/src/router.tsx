import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ComparePage } from "@/pages/ComparePage";
import { ConfirmPage } from "@/pages/ConfirmPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SourcePage } from "@/pages/SourcePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
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
  },
]);
