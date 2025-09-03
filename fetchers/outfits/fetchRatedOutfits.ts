import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchRatingStats = (outfitId: string) => {
    return useQuery({
        queryKey: ['outfits-rats', outfitId],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            if (!outfitId) {
                return {
                    totalRatings: 0,
                    positiveRatings: 0,
                    positivePercentage: 0,
                    data: []
                };
            }

            const { data, error } = await supabase
                .from('outfits-rating')
                .select('*')
                .eq('outfit_id', outfitId);

            if (error) {
                console.error('Error fetching rating stats:', error);
                throw new Error(`Failed to fetch rating stats: ${error.message}`);
            }

            if (!data) {
                return {
                    totalRatings: 0,
                    positiveRatings: 0,
                    positivePercentage: 0,
                    data: []
                };
            }

            const validRatings = data.filter(rating => rating.top_rated !== null);
            const totalRatings = validRatings.length;
            const positiveRatings = validRatings.filter(rating => rating.top_rated === true).length;
            const positivePercentage = totalRatings > 0 
                ? Math.round((positiveRatings / totalRatings) * 100) 
                : 0;

            return {
                totalRatings,
                positiveRatings,
                positivePercentage,
                data
            };
        },
        enabled: !!outfitId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};