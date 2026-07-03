import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ColorSchemeName,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  theme: 'light' | 'dark';
  setPreference: (value: ThemePreference) => void;
  toggleTheme: () => void;
};

const THEME_PREFERENCE_KEY = 'learnmate_theme_preference_v1';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(pref: ThemePreference, systemScheme: ColorSchemeName): 'light' | 'dark' {
  if (pref === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return pref;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const theme = resolveTheme(preference, systemScheme);

  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, value);
    } catch {
      // ignore write failure
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    setPreference(nextTheme);
  }, [setPreference, theme]);

  const contextValue = useMemo(
    () => ({ preference, theme, setPreference, toggleTheme }),
    [preference, theme, setPreference, toggleTheme],
  );

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <NavigationThemeProvider
        value={theme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme}
      >
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
