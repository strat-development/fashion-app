import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchSavedOutfits = (userId: string, page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['saved-outfits', userId, page, pageSize],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId) {
        return [];
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // First get saved outfit IDs
      const { data: savedOutfits, error: savedError } = await supabase
        .from('saved-outfits')
        .select('outfit_id, saved_at')
        .eq('saved_by', userId)
        .order('saved_at', { ascending: false })
        .range(from, to);
        
      if (savedError) {
        console.error('Error fetching saved outfits:', savedError);
        throw new Error(`Failed to fetch saved outfits: ${savedError.message}`);
      }

      if (!savedOutfits?.length) {
        return [];
      }

      const outfitIds = savedOutfits
        .map(o => o.outfit_id)
        .filter((id): id is string => typeof id === 'string');
      
      if (!outfitIds.length) {
        return [];
      }

      const { data: outfits, error: outfitsError } = await supabase
        .from('created-outfits')
        .select(`
          *,
          comments(count)
        `)
        .in('outfit_id', outfitIds)
        .order('created_at', { ascending: false });

      if (outfitsError) {
        console.error('Error fetching outfit details:', outfitsError);
        throw new Error(`Failed to fetch outfit details: ${outfitsError.message}`);
      }

      if (!outfits) {
        return [];
      }

      return outfits.map(outfit => ({
        ...outfit,
        comments: outfit.comments?.[0]?.count || 0
      }));
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};