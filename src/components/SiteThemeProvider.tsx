import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  subscribeToMenuConfig,
  type ThemeMode,
  type ThemeSeason,
} from "@/lib/menu";

type SiteTheme = {
  season: ThemeSeason;
  mode: ThemeMode;
};

const DEFAULT_THEME: SiteTheme = {
  season: "winter",
  mode: "dark",
};

const STORAGE_KEY = "site-theme";

const SiteThemeContext = createContext<SiteTheme>(DEFAULT_THEME);

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}

function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SiteTheme>;
      return {
        season: parsed.season ?? DEFAULT_THEME.season,
        mode: parsed.mode ?? DEFAULT_THEME.mode,
      };
    }
  } catch {
    // ignore malformed/unavailable storage
  }
  return DEFAULT_THEME;
}

function applyTheme({ season, mode }: SiteTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.season = season;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ season, mode }));
  } catch {
    // ignore storage write failures
  }
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(readStoredTheme);

  useEffect(() => {
    const unsubscribe = subscribeToMenuConfig(
      (config) => {
        setTheme({
          season: config.season ?? DEFAULT_THEME.season,
          mode: config.mode ?? DEFAULT_THEME.mode,
        });
      },
      (error) => {
        console.error("Failed to subscribe to site theme:", error);
      },
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <SiteThemeContext.Provider value={theme}>
      {children}
    </SiteThemeContext.Provider>
  );
}
