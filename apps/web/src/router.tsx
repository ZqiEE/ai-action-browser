import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { RouteParamsProvider, useLocation } from "@/lib/navigation";
import { ComparePage } from "@/pages/ComparePage";
import { ConfirmPage } from "@/pages/ConfirmPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OutcomePage } from "@/pages/OutcomePage";
import { ProviderPage } from "@/pages/ProviderPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { SearchPage } from "@/pages/SearchPage";
import { SourcePage } from "@/pages/SourcePage";

class RouteBoundary extends Component<
  { children: ReactNode },
  { error: unknown | null }
> {
  state: { error: unknown | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("route_render_failed", { error, componentStack: info.componentStack });
  }

  render() {
    return this.state.error ? <RouteErrorPage error={this.state.error} /> : this.props.children;
  }
}

function matchDynamic(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const value = pathname.slice(prefix.length);
  return value && !value.includes("/") ? decodeURIComponent(value) : null;
}

export function AppRouter() {
  const location = useLocation();
  const sourceId = matchDynamic(location.pathname, "/sources/");
  const outcomeId = matchDynamic(location.pathname, "/outcomes/");

  let page: ReactNode;
  let useShell = true;
  let params: Record<string, string> = {};

  switch (location.pathname) {
    case "/":
      page = <HomePage />;
      break;
    case "/search":
      page = <SearchPage />;
      break;
    case "/compare":
      page = <ComparePage />;
      break;
    case "/providers":
      page = <ProviderPage />;
      break;
    case "/confirm":
      page = <ConfirmPage />;
      useShell = false;
      break;
    default:
      if (sourceId) {
        params = { sourceId };
        page = <SourcePage />;
      } else if (outcomeId) {
        params = { outcomeId };
        page = <OutcomePage />;
        useShell = false;
      } else {
        page = <NotFoundPage />;
      }
  }

  const content = <RouteParamsProvider params={params}>{page}</RouteParamsProvider>;
  return (
    <RouteBoundary key={`${location.pathname}${location.search}`}>
      {useShell ? <AppShell>{content}</AppShell> : content}
    </RouteBoundary>
  );
}
