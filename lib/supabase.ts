import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Zapewnia poprawne URL polyfill w środowisku RN/Expo
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient<Database> | undefined;
}

// Prosty memory storage dla środowisk bez window (np. SSR w expo-router web podczas bundlingu)
const memoryStore: Record<string, string> = {};
const memoryStorage = {
  getItem: async (key: string) => memoryStore[key] ?? null,
  setItem: async (key: string, value: string) => { memoryStore[key] = value; },
  removeItem: async (key: string) => { delete memoryStore[key]; },
};

function createSupabaseSingleton() {
  if (!global.__supabaseClient) {
    const storage = typeof window === 'undefined' ? memoryStorage : AsyncStorage;
    global.__supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  }
  return global.__supabaseClient;
}

export const supabase = createSupabaseSingleton();

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  useEffect(() => {
    setClient(supabase);
  }, []);
  return client;
}