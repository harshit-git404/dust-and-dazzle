'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'daylight' | 'candlelight';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('daylight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dust-and-dazzle-theme') as Theme;
    if (savedTheme === 'candlelight' || savedTheme === 'daylight') {
      setThemeState(savedTheme);
      if (savedTheme === 'candlelight') {
        document.documentElement.classList.add('candlelight');
      } else {
        document.documentElement.classList.remove('candlelight');
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('dust-and-dazzle-theme', newTheme);
    if (newTheme === 'candlelight') {
      document.documentElement.classList.add('candlelight');
    } else {
      document.documentElement.classList.remove('candlelight');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'daylight' ? 'candlelight' : 'daylight');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
