import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * ThemeContext — single source of truth for the app's color theme.
 *
 * `theme`          the user's choice: "light" | "dark"
 * `resolvedTheme`  same as theme (no "auto" mode)
 * `setTheme(next)` set an explicit mode
 * `cycleTheme()`   light → dark → light (used by ThemeToggle)
 *
 * Side effects (done in ONE place so nothing else has to):
 *  - writes the `data-theme` attribute on <html>, which drives every
 *    `var(--theme-*)` token in tokens.css
 *  - persists the choice to localStorage under "theme"
 *
 * Charts (which take colors as JS props, not CSS) read `resolvedTheme` via
 * the useChartColors() hook so they restyle when the theme flips.
 */

const THEMES = ["light", "dark"];
const STORAGE_KEY = "theme";

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && THEMES.includes(saved)) return saved;
  return "dark";
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Keep the <html data-theme> attribute and localStorage in sync.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const resolvedTheme = theme;

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length]);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, cycleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
