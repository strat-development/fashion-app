import { FilterOptions } from "@/components/outfits/FeedFilters";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchFilteredFeedOutfits = (
  page: number = 1, 
  pageSize: number = 10,
  filters: FilterOptions
) => {
  return useQuery({
    queryKey: ['filtered-feed-outfits', page, pageSize, JSON.stringify(filters)],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('created-outfits')
        .select(`
          *,
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filters.search.trim() && filters.tags.length > 0) {
        const searchCondition = `outfit_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`;
        const tagConditions = filters.tags.map(tag => `outfit_tags.cs.["${tag}"]`);
        
        query = query.or(`${searchCondition},${tagConditions.join(',')}`);
      } else if (filters.search.trim()) {
        query = query.or(`outfit_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      } else if (filters.tags.length > 0) {
        console.log('Filtering by tags only:', filters.tags);
        const tagConditions = filters.tags.map(tag => `outfit_tags.cs.["${tag}"]`);
        console.log('Tag conditions:', tagConditions);
        query = query.or(tagConditions.join(','));
      }

      if (filters.elements.length > 0) {
        const elementConditions = filters.elements.map(element => 
          `outfit_elements_data.cs.[{"type":"${element}"}]`
        );
        query = query.or(elementConditions.join(','));
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching filtered feed outfits:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      return data.map(outfit => ({
        ...outfit,
        comments: outfit.comments?.[0]?.count || 0
      }));
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
    enabled: true,
  });
};
