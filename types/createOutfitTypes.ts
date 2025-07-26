export interface OutfitCreateProps {
  isVisible?: boolean;
  onClose?: () => void;
  isAnimated?: boolean;
}

export interface NewOutfitData {
  createdAt: string;
  createdBy: string;
  description: string;
  outfitElements: OutfitElementData[];
  outfitTags: string[];
  outfitName: string;
}

export interface OutfitElementData {
  type: string;
  price: number | null;
  imageUrl: string;
  siteUrl: string;
}