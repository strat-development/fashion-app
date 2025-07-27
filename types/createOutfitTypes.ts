import { Database } from "@/types/supabase";

export interface OutfitCreateProps {
  isVisible?: boolean;
  onClose?: () => void;
  isAnimated?: boolean;
}

export type OutfitElementData = {
  type: string;
  price: number | null;
  imageUrl: string;
  siteUrl: string;
};

export type OutfitElementsData = OutfitElementData[];
export type OutfitTags = string[];

export type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"];
export type NewOutfitData = Database["public"]["Tables"]["created-outfits"]["Insert"];