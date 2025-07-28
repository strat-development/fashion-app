import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

interface DeleteOutfitMutationProps {
    createdBy: string;
}

export const useDeleteOutfitMutation = () => {
    return useMutation({
        mutationFn: async ({ createdBy }: DeleteOutfitMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('created-outfits')
                .delete()
                .eq('created_by', createdBy)

            if (error) {
                throw error;
            }

            return data;
        }
    })
}