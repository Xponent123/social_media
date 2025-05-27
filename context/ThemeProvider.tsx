"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage if available
  useEffect(() => {
    // Only run once when component mounts
    if (!mounted) {
      setMounted(true);
      const savedTheme = localStorage.getItem("theme") as Theme;

      // Clear existing classes first
      document.documentElement.classList.remove("light", "dark");

      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
        document.documentElement.classList.add(savedTheme);
      } else {
        // Default to dark mode if no saved preference
        document.documentElement.classList.add("dark");
      }
    }
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // Update state
    setTheme(newTheme);

    // Update localStorage
    localStorage.setItem("theme", newTheme);

    // Update DOM - remove old class first to prevent multiple classes
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
