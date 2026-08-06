import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface BrowserLocation {
  pathname: string;
  search: string;
}

export interface NavigateOptions {
  replace?: boolean;
}

type Navigate = (to: string | number, options?: NavigateOptions) => void;
type Params = Record<string, string | undefined>;

interface NavigationContextValue {
  location: BrowserLocation;
  navigate: Navigate;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);
const ParamsContext = createContext<Params>({});

function normalizePathname(pathname: string): string {
  const prefixed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = prefixed.replace(/\/{2,}/g, "/");
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
}

function normalizeTarget(target: string): string {
  const raw = target.startsWith("#") ? target.slice(1) : target;
  const [pathAndQuery = "/", fragment] = raw.split("#", 2);
  const queryIndex = pathAndQuery.indexOf("?");
  const pathname = queryIndex >= 0 ? pathAndQuery.slice(0, queryIndex) : pathAndQuery;
  const search = queryIndex >= 0 ? pathAndQuery.slice(queryIndex) : "";
  const normalized = `${normalizePathname(pathname || "/")}${search}`;
  return fragment ? `${normalized}#${fragment}` : normalized;
}

function readLocation(): BrowserLocation {
  const target = normalizeTarget(window.location.hash.slice(1) || "/");
  const queryIndex = target.indexOf("?");
  return {
    pathname: queryIndex >= 0 ? target.slice(0, queryIndex) : target,
    search: queryIndex >= 0 ? target.slice(queryIndex) : "",
  };
}

export function HashRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<BrowserLocation>(readLocation);

  useEffect(() => {
    const sync = () => setLocation(readLocation());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const navigate = useCallback<Navigate>((to, options = {}) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }

    const target = normalizeTarget(to);
    const nextHash = `#${target}`;
    if (options.replace) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
      setLocation(readLocation());
      return;
    }

    if (window.location.hash === nextHash) {
      setLocation(readLocation());
    } else {
      window.location.hash = target;
    }
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

function useNavigationContext(): NavigationContextValue {
  const value = useContext(NavigationContext);
  if (!value) throw new Error("Navigation hooks must be used inside HashRouter.");
  return value;
}

export function useLocation(): BrowserLocation {
  return useNavigationContext().location;
}

export function useNavigate(): Navigate {
  return useNavigationContext().navigate;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>, options?: NavigateOptions) => void] {
  const { location, navigate } = useNavigationContext();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const setParams = useCallback(
    (next: URLSearchParams | Record<string, string>, options?: NavigateOptions) => {
      const value = next instanceof URLSearchParams ? next : new URLSearchParams(next);
      const query = value.toString();
      navigate(`${location.pathname}${query ? `?${query}` : ""}`, options);
    },
    [location.pathname, navigate],
  );
  return [params, setParams];
}

export function RouteParamsProvider({ children, params }: { children: ReactNode; params: Params }) {
  return <ParamsContext.Provider value={params}>{children}</ParamsContext.Provider>;
}

export function useParams<T extends Params = Params>(): T {
  return useContext(ParamsContext) as T;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
}

export function Link({ to, onClick, target, ...props }: LinkProps) {
  const navigate = useNavigate();
  const href = `#${normalizeTarget(to)}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== "_self")
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  }

  return <a {...props} href={href} target={target} onClick={handleClick} />;
}
