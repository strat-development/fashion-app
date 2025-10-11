import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import Auth from '@/components/Auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import i18n from '@/i18n';
import { supabase } from '@/lib/supabase';
import ViewContextProvider from '@/providers/chatViewContext';
import { ThemeProvider as CustomThemeProvider } from '@/providers/themeContext';
import UserContextProvider from '@/providers/userContext';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    InstrumentSans: require('../assets/fonts/InstrumentSans-VariableFont.ttf'),
    InriaSans: require('../assets/fonts/InriaSans-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      (Text as any).defaultProps = (Text as any).defaultProps || {};
      const prev = (Text as any).defaultProps.style;
      (Text as any).defaultProps.style = Array.isArray(prev)
        ? [{ fontFamily: 'InriaSans' }, ...prev]
        : [{ fontFamily: 'InriaSans' }, prev].filter(Boolean);
    }
  }, [loaded]);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionChecked(true);
    });

    const subscription = supabase?.auth.onAuthStateChange?.((_event, session) => {
      setSession(session);
      setSessionChecked(true);
    })?.data?.subscription;

    return () => subscription?.unsubscribe();
  }, []);

  if (!loaded) {
    return null;
  }

  if (!sessionChecked) {
    return null;
  }

  if (!session) {
    return (
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Auth />
        </ThemeProvider>
      </CustomThemeProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18n}>
                <SessionContextProvider supabaseClient={supabase as any}>
                  <UserContextProvider>
                    <ViewContextProvider>
                      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.background : DefaultTheme.colors.background }}>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="+not-found" />
                        </Stack>
                        <StatusBar style="auto" />
                      </SafeAreaView>
                    </ViewContextProvider>
                  </UserContextProvider>
                </SessionContextProvider>
              </I18nextProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}