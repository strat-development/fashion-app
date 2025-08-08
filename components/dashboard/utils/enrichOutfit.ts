import { OutfitData } from '../OutfitCard';

export const enrichOutfit = (raw: any, savedIds: Set<string>): OutfitData => ({
  ...(raw as any),
  likes: (raw as any).likes ?? 0,
  comments: (raw as any).comments ?? 0,
  isSaved: savedIds.has(raw.outfit_id),
});
