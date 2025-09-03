import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchRatingStats = (outfitId: string) => {
    return useQuery({
        queryKey: ['outfits-rats', outfitId],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('outfits-rating')
                .select('*')
                .eq('outfit_id', outfitId);

            if (error) {
                throw error;
            }

            const validRatings = data.filter(rating => rating.top_rated !== null);
            const totalRatings = validRatings.length;
            const positiveRatings = validRatings.filter(rating => rating.top_rated === true).length;
            const positivePercentage = totalRatings > 0 
                ? Math.round((positiveRatings / totalRatings) * 100) 
                : 0;

            if (totalRatings === 1 && positiveRatings === 0 && positivePercentage !== 0) {
                console.warn('Unexpected positivePercentage for single negative rating:', {
                    totalRatings,
                    positiveRatings,
                    positivePercentage,
                    data
                });
            }

            return {
                totalRatings,
                positiveRatings,
                positivePercentage,
                data
            };
        },
        enabled: !!outfitId
    });
};