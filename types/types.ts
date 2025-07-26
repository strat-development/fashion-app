import { Database } from "./supabase";

export type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"];