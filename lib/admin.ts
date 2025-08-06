import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);