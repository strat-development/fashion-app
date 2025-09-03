import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteOutfitMutationProps {
    outfitId: string;
    userId: string;
}

export const useDeleteOutfitMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            outfitId,
            userId
        }: DeleteOutfitMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { error } = await supabase
                .from('created-outfits')
                .delete()
                .eq('outfit_id', outfitId)
                .eq('created_by', userId);

            if (error) {
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['created-outfits', variables.userId]
            });
            queryClient.invalidateQueries({
                queryKey: ['saved-outfits', variables.userId]
            });
        }
    });
}