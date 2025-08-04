import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteOutfitMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ outfitId }: { outfitId: string }) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { error } = await supabase
                .from('created-outfits')
                .delete()
                .eq('outfit_id', outfitId);

            if (error) {
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['created-outfits', data]
            });
            queryClient.invalidateQueries({
                queryKey: ['saved-outfits', data]
            });
        }
    });
}