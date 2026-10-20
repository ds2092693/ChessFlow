import { createContext, useEffect, useState } from "react";

export type THEME = "default" | "cyber" | "emerald" | "midnight" | "pink" | "classic";

export type THEME_CONTEXT = {
  theme: THEME,
  updateTheme: (theme: THEME) => void
}

const AVAILABLE_THEMES: THEME[] = ["default", "cyber", "emerald", "midnight", "pink", "classic"];

export const ThemeContext = createContext<THEME_CONTEXT | null>(null);

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<THEME>("cyber");

  function updateTheme(newTheme: THEME) {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") as THEME | null;

    if (currentTheme && AVAILABLE_THEMES.includes(currentTheme)) {
      setTheme(currentTheme);
      document.documentElement.setAttribute("data-theme", currentTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "cyber");
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      updateTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
