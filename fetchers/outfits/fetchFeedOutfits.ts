import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchFeedOutfits = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['created-outfits', page, pageSize],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('created-outfits')
        .select(`
          *,
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error('Error fetching feed outfits:', error);
        throw new Error(`Failed to fetch outfits: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map(outfit => ({
        ...outfit,
        comments: outfit.comments?.[0]?.count || 0
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};