import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UnlikeOutfitMutationProps {
    outfitId: string;
    userId: string;
}

export const useUnlikeOutfitMutation = ({ userId, outfitId }: UnlikeOutfitMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { error } = await supabase
                .from('liked-outfits')
                .delete()
                .eq('outfit_id', outfitId)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liked-outfits', outfitId] });
            queryClient.invalidateQueries({ queryKey: ['liked-outfits', userId] });
            queryClient.invalidateQueries({ queryKey: ['liked-outfits'] });
        },
        onError: (error) => {
            console.error('Error unliking outfit:', error);
        }
    });
}