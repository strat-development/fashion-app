import { Database } from "./supabase";

export type UserData = Database['public']['Tables']['users']['Row'];