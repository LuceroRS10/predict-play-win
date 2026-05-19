'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ppw-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.body.classList.add('light-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.remove('light-mode');
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('ppw-theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('ppw-theme', 'light');
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
