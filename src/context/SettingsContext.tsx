import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { reciters, type Reciter } from "@/data/reciters";

export type ColorTheme = {
  id: string;
  name: string;
  primary: string; // hsl values e.g. "142 71% 45%"
};

export const COLOR_THEMES: ColorTheme[] = [
  { id: 'default', name: 'أخضر', primary: '142 71% 45%' },
  { id: 'blue', name: 'أزرق', primary: '217 91% 60%' },
  { id: 'amber', name: 'ذهبي', primary: '38 92% 50%' },
  { id: 'teal', name: 'فيروزي', primary: '174 72% 40%' },
  { id: 'purple', name: 'بنفسجي', primary: '270 67% 60%' },
  { id: 'rose', name: 'وردي', primary: '347 77% 58%' },
];

interface SettingsContextType {
  reciter: Reciter;
  setReciter: (r: Reciter) => void;
  theme: string;
  setTheme: (t: string) => void;
  toggleTheme: () => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  colorTheme: ColorTheme;
  setColorTheme: (c: ColorTheme) => void;
}

const C = createContext<SettingsContextType | null>(null);

function getInitialReciter(): Reciter {
  try {
    const saved = localStorage.getItem("reciter");
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = reciters.find(r => r.id === parsed.id);
      if (found) return found;
    }
  } catch {}
  return reciters[0];
}

function getInitialColorTheme(): ColorTheme {
  try {
    const saved = localStorage.getItem("colorTheme");
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = COLOR_THEMES.find(c => c.id === parsed.id);
      if (found) return found;
    }
  } catch {}
  return COLOR_THEMES[0];
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [reciter, setReciterState] = useState<Reciter>(getInitialReciter);
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "light");
  const [fontSize, setFontSizeState] = useState(() => {
    const s = localStorage.getItem("fontSize");
    return s ? parseInt(s) : 28;
  });
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getInitialColorTheme);

  const setReciter = (r: Reciter) => {
    setReciterState(r);
    localStorage.setItem("reciter", JSON.stringify(r));
  };

  const setTheme = (t: string) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    document.documentElement.className = t;
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const setFontSize = (s: number) => {
    const clamped = Math.max(18, Math.min(40, s));
    setFontSizeState(clamped);
    localStorage.setItem("fontSize", String(clamped));
  };

  const setColorTheme = (c: ColorTheme) => {
    setColorThemeState(c);
    localStorage.setItem("colorTheme", JSON.stringify(c));
    document.documentElement.style.setProperty('--primary-hsl', c.primary);
  };

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.style.setProperty('--primary-hsl', colorTheme.primary);
  }, []);

  return (
    <C.Provider value={{ reciter, setReciter, theme, setTheme, toggleTheme, fontSize, setFontSize, colorTheme, setColorTheme }}>
      {children}
    </C.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};
