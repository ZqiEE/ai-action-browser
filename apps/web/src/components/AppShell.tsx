import { useEffect, useState, type ReactNode } from "react";
import { IconButton } from "@/components/Button";
import { MoonIcon, SunIcon } from "@/components/Icons";
import { Link } from "@/lib/navigation";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem("aab-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("aab-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="AI Action Browser home">
          <span className="wordmark__mark" aria-hidden="true" />
          <span>AI Action Browser</span>
        </Link>
        <nav className="site-header__actions" aria-label="Browser controls">
          <IconButton
            label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </nav>
      </header>
      <main id="main-content" className="page-content">
        {children}
      </main>
    </div>
  );
}
