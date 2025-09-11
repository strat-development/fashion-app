import { Database } from "@/types/supabase";

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDelete?: () => void;
  isAnimated?: boolean;
}

export type OutfitElementData = {
  type: string;
  price: number | null;
  currency: string | null;
  imageUrl: string;
  siteUrl: string;
};

export type OutfitElementsData = OutfitElementData[];
export type OutfitTags = string[];

export type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"];
export type NewOutfitData = Database["public"]["Tables"]["created-outfits"]["Insert"];