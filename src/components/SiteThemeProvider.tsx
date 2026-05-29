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

const SiteThemeContext = createContext<SiteTheme>(DEFAULT_THEME);

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}

function applyTheme({ season, mode }: SiteTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.season = season;
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);

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
