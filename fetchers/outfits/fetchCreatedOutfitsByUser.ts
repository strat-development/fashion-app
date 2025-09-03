import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchCreatedOutfitsByUser = (userId: string, page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['created-outfits', userId, page, pageSize],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      if (!userId) {
        return [];
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('created-outfits')
        .select(`
          *,
          comments(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .range(from, to);
            
      if (error) {
        console.error('Error fetching created outfits by user:', error);
        throw new Error(`Failed to fetch user outfits: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map(outfit => ({
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