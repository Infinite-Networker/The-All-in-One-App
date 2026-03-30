/**
 * The All-in-One App — useTheme Hook
 * Cherry Computer Ltd.
 *
 * Provides the active theme (dark/light) and a toggle function.
 * Persists user preference to AsyncStorage.
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME } from '../theme';

const THEME_KEY = '@allinoneapp_theme';

// Create theme context
const ThemeContext = createContext({
  theme:       DARK_THEME,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const React = require('react');
  const [theme, setTheme] = useState(DARK_THEME);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light') setTheme(LIGHT_THEME);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current.mode === 'dark' ? LIGHT_THEME : DARK_THEME;
      AsyncStorage.setItem(THEME_KEY, next.mode);
      return next;
    });
  }, []);

  return React.createElement(ThemeContext.Provider, { value: { theme, toggleTheme } }, children);
};

export const useTheme = () => useContext(ThemeContext);

export default useTheme;
