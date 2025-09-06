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
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error('Error fetching feed outfits:', error);
        throw new Error(`Failed to fetch outfits: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const ids = (data as any[]).map((o: any) => o.outfit_id).filter(Boolean) as string[];
      let countsMap = new Map<string, number>();
      if (ids.length) {
        const { data: commentsRows } = await supabase
          .from('comments')
          .select('outfit_id')
          .in('outfit_id', ids);
        if (Array.isArray(commentsRows)) {
          countsMap = commentsRows.reduce((acc, row: any) => {
            const id = row.outfit_id as string | null;
            if (!id) return acc;
            acc.set(id, (acc.get(id) || 0) + 1);
            return acc;
          }, new Map<string, number>());
        }
      }

      return (data as any[]).map((outfit: any) => ({
        ...outfit,
        comments: countsMap.get(outfit.outfit_id) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};