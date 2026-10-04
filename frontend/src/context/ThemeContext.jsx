import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, THEMES } from '../constants';

const ThemeContext = createContext(null);

export function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return stored === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(() => {
    function toggleTheme() {
      setTheme((current) => (current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
    }

    return { theme, toggleTheme };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
