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

      const outfitIds = likedOutfits
        .map(o => o.outfit_id)
        .filter((id): id is string => typeof id === 'string');
      if (!outfitIds.length) return [];
      const { data: outfits, error: outfitsError } = await supabase
        .from('created-outfits')
        .select('*')
        .in('outfit_id', outfitIds)
        .order('created_at', { ascending: false });

      if (outfitsError) throw outfitsError;
      
      return outfits;
    },
    enabled: !!userId
  });
};