import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RateOutfitMutationProps {
    outfitId: string;
    userId: string;
    outfitCreatorId?: string;
}

export const useRateOutfitMutation = ({ outfitId, userId, outfitCreatorId }: RateOutfitMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ topRated }: { topRated: boolean }) => {
            if (!supabase) {
                throw new Error("Supabase client is not initialized.");
            }

            const { data: existingRating, error: fetchError } = await supabase
                .from("outfits-rating")
                .select("id, top_rated")
                .eq("outfit_id", outfitId)
                .eq("rated_by", userId)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }

            let ratedOutfit;
            if (existingRating) {
                const { data, error } = await supabase
                    .from("outfits-rating")
                    .update({ top_rated: topRated })
                    .eq("id", existingRating.id)
                    .select()
                    .single();

                if (error) throw error;
                ratedOutfit = data;
            } else {
                const { data, error } = await supabase
                    .from("outfits-rating")
                    .insert({ outfit_id: outfitId, rated_by: userId, top_rated: topRated })
                    .select()
                    .single();

                if (error) throw error;
                ratedOutfit = data;
            }

            if (topRated && outfitCreatorId) {
                const { count } = await supabase
                    .from('outfits-rating')
                    .select('*', { count: 'exact', head: true })
                    .eq('outfit_id', outfitId)
                    .eq('top_rated', true);

                const milestones = [5, 10, 20, 50, 100, 200, 500, 1000];
                const currentCount = count || 0;

                for (const milestone of milestones) {
                    if (currentCount === milestone) {
                        await supabase.from('activities').insert({
                            user_id: outfitCreatorId,
                            activity_type: `milestone_${milestone}_likes`,
                            outfit_id: outfitId,
                        });
                        break;
                    }
                }
            }

            return ratedOutfit;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outfits-rats", outfitId] });
            
            if (outfitCreatorId) {
                queryClient.invalidateQueries({ 
                    queryKey: ["userStatistics", outfitCreatorId] 
                });
            }
        },
        onError: (error) => {
            console.error("Error updating rating:", error);
        },
    });
};