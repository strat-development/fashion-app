import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchSavedOutfits = (userId: string) => {
  return useQuery({
    queryKey: ['saved-outfits', userId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data: likedOutfits, error: likedError } = await supabase
        .from('saved-outfits')
        .select('outfit_id')
        .eq('saved_by', userId);

      if (likedError) throw likedError;
      if (!likedOutfits?.length) return [];

      const outfitIds = likedOutfits.map((outfit) => outfit.outfit_id);
      const { data: outfits, error: outfitsError } = await supabase
        .from('created-outfits')
        .select('*')
        .in('outfit_id', outfitIds);

      if (outfitsError) throw outfitsError;
      return outfits;
    }
  });
};