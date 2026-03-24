import { createContext, useContext, useState, useEffect } from "react";

type SettingsType = {
  reciter: string;
  setReciter: (r: string) => void;
  theme: string;
  setTheme: (t: string) => void;
};

const SettingsContext = createContext<SettingsType | null>(null);

export const SettingsProvider = ({ children }: any) => {
  const [reciter, setReciter] = useState(
    localStorage.getItem("reciter") || "husary"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("reciter", reciter);
  }, [reciter]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{ reciter, setReciter, theme, setTheme }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("SettingsContext error");
  return context;
};
