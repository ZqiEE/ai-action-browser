import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import { IconButton } from "@/components/Button";
import { MoonIcon, SunIcon } from "@/components/Icons";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem("aab-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppShell() {
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
          <span>Action Browser</span>
        </Link>
        <nav className="site-header__actions" aria-label="Account and appearance">
          <button type="button" className="text-action">Sign in</button>
          <IconButton
            label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </nav>
      </header>
      <main id="main-content" className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
