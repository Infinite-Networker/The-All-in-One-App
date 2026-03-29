/**
 * The All-in-One App — useTheme Hook
 * Cherry Computer Ltd.
 *
 * Provides current theme context and toggle functionality.
 * Respects system preference by default, with user override support.
 */

import { useCallback, useEffect, useState } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME } from '../theme';

const THEME_STORAGE_KEY = '@allinone_theme_preference';

/**
 * useTheme — access the current theme and toggle between dark/light/system.
 *
 * @returns {{
 *   theme: object,          — Active theme object (DARK_THEME or LIGHT_THEME)
 *   mode: string,           — 'dark' | 'light'
 *   preference: string,     — 'dark' | 'light' | 'system'
 *   setPreference: function — (preference: string) => void
 *   isDark: boolean
 * }}
 */
export const useTheme = () => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('dark'); // Default: dark mode

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved) setPreferenceState(saved);
    });
  }, []);

  // Listen for system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (preference === 'system') {
        // Force re-render when system changes and we're in system mode
        setPreferenceState('system');
      }
    });
    return () => subscription.remove();
  }, [preference]);

  const setPreference = useCallback(async (newPreference) => {
    setPreferenceState(newPreference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newPreference);
  }, []);

  const resolvedMode =
    preference === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : preference;

  const isDark = resolvedMode === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    theme,
    mode: resolvedMode,
    preference,
    setPreference,
    isDark,
  };
};

export default useTheme;
