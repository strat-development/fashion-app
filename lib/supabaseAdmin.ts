import { createClient } from '@supabase/supabase-js';

// Server-only Supabase admin client. Do NOT fall back to any EXPO_PUBLIC_* envs here.
// Require explicit SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to avoid accidental client exposure.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail fast on servers without proper secrets configured.
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars for supabaseAdmin. \n' +
      'Do NOT use EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY for server secrets.\n' +
      'Set SUPABASE_SERVICE_ROLE_KEY in your server environment (Vercel/Railway/etc).'
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
