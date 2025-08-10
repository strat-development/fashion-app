import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RateOutfitMutationProps {
    outfitId: string;
    userId: string;
}

export const useRateOutfitMutation = ({ outfitId, userId }: RateOutfitMutationProps) => {
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

            if (existingRating) {
                const { data, error } = await supabase
                    .from("outfits-rating")
                    .update({ top_rated: topRated })
                    .eq("id", existingRating.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from("outfits-rating")
                    .insert({ outfit_id: outfitId, rated_by: userId, top_rated: topRated })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outfits-rats", outfitId] });
        },
        onError: (error) => {
            console.error("Error updating rating:", error);
        },
    });
};