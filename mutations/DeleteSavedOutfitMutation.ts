import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteSavedOutfitMutationProps {
    outfitId: string;
}

export const useDeleteSavedOutfitMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ outfitId }: DeleteSavedOutfitMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('saved-outfits')
                .delete()
                .eq('outfit_id', outfitId)

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['saved-outfits', data]
            })
        }
    })
}