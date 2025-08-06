import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LikeOutfitMutationProps {
    outfitId: string;
    userId: string;
}

export const useLikeOutfitMutation = ({
    outfitId,
    userId
}: LikeOutfitMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('liked-outfits')
                .insert({
                    outfit_id: outfitId,
                    user_id: userId
                });

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liked-outfits', outfitId] });
            queryClient.invalidateQueries({ queryKey: ['liked-outfits', userId] });
            queryClient.invalidateQueries({ queryKey: ['liked-outfits'] });
        },
        onError: (error: Error) => {
            console.error('Like outfit error:', error);
        }
    });
};