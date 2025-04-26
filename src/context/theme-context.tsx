import { createContext, useEffect, useState, ReactNode } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setDefaultTheme: () => {},
});

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = sessionStorage.getItem("theme");
    return storedTheme || "dark";
  });

  useEffect(() => {
    sessionStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (!root) return;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setDefaultTheme = () => {
    const stored = sessionStorage.getItem("theme");
    if (stored) setTheme(stored);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setDefaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider };
export default ThemeContext;
