import { OutfitElementData } from '@/types/createOutfitTypes';

export interface OutfitState {
  outfit_name: string;
  description: string | null;
  outfit_tags: string[];
  outfit_elements_data: OutfitElementData[];
  created_at: string;
  created_by: string | null;
  outfit_id: string;
}

export interface PendingImage {
  uri: string;
  type?: string;
  fileName?: string;
}