import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteSavedOutfitMutationProps {
    outfitId: string;
    userId: string;
}

export const useDeleteSavedOutfitMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ outfitId, userId }: DeleteSavedOutfitMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('saved-outfits')
                .delete()
                .eq('outfit_id', outfitId)
                .eq('saved_by', userId);

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['saved-outfits', variables.userId]
            });
        }
    })
}