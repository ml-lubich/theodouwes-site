"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  brainColorForTheme,
  isTheme,
  parsePref,
  resolveTheme,
  THEME_STORAGE_KEY,
  toggleTheme,
  type Theme,
  type ThemePref,
} from "@/lib/theme";

interface ThemeContextValue {
  readonly theme: Theme;
  readonly pref: ThemePref;
  readonly brainColor: string;
  readonly setTheme: (theme: Theme) => void;
  readonly setPref: (pref: ThemePref) => void;
  readonly toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredPref(pref: ThemePref): void {
  try {
    if (pref === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* ignore quota / private mode */
  }
}

function applyThemeToDocument(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

const LIGHT_MQ = "(prefers-color-scheme: light)";

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [theme, setThemeState] = useState<Theme>("dark");

  // Boot script already painted the right theme; sync React state to it.
  useEffect(() => {
    const stored = parsePref(readStoredTheme());
    setPrefState(stored);
    const next = resolveTheme(stored, window.matchMedia(LIGHT_MQ).matches);
    setThemeState(next);
    applyThemeToDocument(next);
  }, []);

  // While following the system, track OS changes live.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia(LIGHT_MQ);
    const on = () => {
      const next = resolveTheme("system", mq.matches);
      setThemeState(next);
      applyThemeToDocument(next);
    };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [pref]);

  const setPref = useCallback((next: ThemePref) => {
    const resolved = resolveTheme(next, window.matchMedia(LIGHT_MQ).matches);
    setPrefState(next);
    setThemeState(resolved);
    applyThemeToDocument(resolved);
    writeStoredPref(next);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      if (!isTheme(next)) return;
      setPref(next);
    },
    [setPref],
  );

  const toggle = useCallback(() => setPref(toggleTheme(theme)), [setPref, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      pref,
      brainColor: brainColorForTheme(theme),
      setTheme,
      setPref,
      toggle,
    }),
    [theme, pref, setTheme, setPref, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
