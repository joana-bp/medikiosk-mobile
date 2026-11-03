import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from './storage';

// Colours come from the MediKiosk logo (teal). Light and dark share the same accents.
export const palettes = {
  light: {
    bg: '#eef5f6', surface: '#ffffff', surfaceAlt: '#e8f4f6', border: '#dbe7ea',
    ink: '#0d2f38', inkSoft: '#2f4a54', muted: '#5f7780', placeholder: '#8fa3aa',
    teal: '#1f8c99', tealDeep: '#1a5660', primary: '#187782', onPrimary: '#ffffff',
    danger: '#a52a20', dangerBg: '#fde8e6', ok: '#1b6b3a', okBg: '#e1f5e8',
    tabBar: '#ffffff', statusBar: 'dark',
  },
  dark: {
    bg: '#0b2a32', surface: '#10404b', surfaceAlt: '#0f4955', border: '#1d5865',
    ink: '#eaf6f8', inkSoft: '#c5dde2', muted: '#93b3ba', placeholder: '#6f929a',
    teal: '#4cb7c4', tealDeep: '#9fdce4', primary: '#2fa4b3', onPrimary: '#06222a',
    danger: '#ffb4ab', dangerBg: '#4a1f1b', ok: '#8fdba9', okBg: '#17402a',
    tabBar: '#0b3843', statusBar: 'light',
  },
};

const ThemeContext = createContext(null);
const KEY = 'mk.theme'; // 'system' | 'light' | 'dark'

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [pref, setPref] = useState('system');

  useEffect(() => {
    storage.get(KEY).then((v) => v && setPref(v));
  }, []);

  const setPreference = (v) => {
    setPref(v);
    storage.set(KEY, v);
  };

  const mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const value = useMemo(() => ({ colors: palettes[mode], mode, pref, setPreference }), [mode, pref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export const fonts = { display: 'Montserrat_700Bold', displaySemi: 'Montserrat_600SemiBold', body: 'Inter_400Regular', bodyMedium: 'Inter_500Medium', bodyBold: 'Inter_700Bold' };
