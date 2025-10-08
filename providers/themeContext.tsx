import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ViewStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderVariant: string;
    accent: string;
    accentSecondary: string;
    success: string;
    warning: string;
    error: string;
    white: string;
    black: string;
  };
}

const lightColors = {
  primary: '#7e22ce',
  secondary: '#db2777',
  tertiary: '#059669',
  background: '#F8FBFF',
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  border: '#e2e8f0',
  borderVariant: '#cbd5e1',
  accent: '#2563EB',
  accentSecondary: '#db2777',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  white: '#ffffff',
  black: '#000000',
};

const darkColors = {
  primary: '#a855f7',
  secondary: '#ec4899',
  tertiary: '#10b981',
  background: '#121212',
  surface: '#1f1f1fcc',
  surfaceVariant: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  border: '#2a2a2a',
  borderVariant: '#374151',
  accent: '#7e22ce',
  accentSecondary: '#db2777',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  black: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const systemColorScheme = useColorScheme();

  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((savedMode) => {
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  const value: ThemeContextType = {
    mode,
    isDark,
    setMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ThemedGradientProps {
  active?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function ThemedGradient({ 
  active = true, 
  style, 
  children, 
  start = { x: 0, y: 0 }, 
  end = { x: 1, y: 1 } 
}: ThemedGradientProps) {
  const { isDark } = useTheme();
  const darkFrom = '#A75FFF99';
  const darkTo = '#64399999';
  const lightFrom = '#5F87FFCC';
  const lightTo = '#6F31FFCC';
  return (
    <LinearGradient
      colors={active ? (isDark ? [darkFrom, darkTo] : [lightFrom, lightTo]) : ['#00000000', '#00000000']}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
