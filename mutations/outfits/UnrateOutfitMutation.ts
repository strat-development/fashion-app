import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UnrateOutfitMutationProps {
    outfitId: string;
    userId: string;
    outfitCreatorId?: string;
}

export const useUnrateOutfitMutation = ({ userId, outfitId, outfitCreatorId }: UnrateOutfitMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { error } = await supabase
                .from('outfits-rating')
                .delete()
                .eq('outfit_id', outfitId)
                .eq('rated_by', userId);

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outfits-rating', outfitId] });
            queryClient.invalidateQueries({ queryKey: ['outfits-rating', userId] });
            queryClient.invalidateQueries({ queryKey: ['outfits-rating'] });
            
            if (outfitCreatorId) {
                queryClient.invalidateQueries({ 
                    queryKey: ["userStatistics", outfitCreatorId] 
                });
            }
        },
        onError: (error) => {
            console.error('Error unliking outfit:', error);
        }
    });
}