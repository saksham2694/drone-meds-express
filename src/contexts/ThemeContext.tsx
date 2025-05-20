
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme in localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    // Default to dark mode instead of system preference
    return "dark";
  });

  useEffect(() => {
    // Update class on document element when theme changes
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Update favicon based on theme
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink) {
      faviconLink.setAttribute('href', theme === 'dark' 
        ? '/lovable-uploads/05d16cab-f106-477e-99e9-c970e59960ad.png'
        : '/lovable-uploads/a25f0758-913a-43c9-bdb5-2b9cf0968628.png');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
