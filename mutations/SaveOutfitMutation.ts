import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

interface SaveOutfitMutationProps {
    userId: string;
    outfitId: string;
    savedAt: string;
}

export const useSaveOutfitMutation = () => {
    return useMutation({
        mutationFn: async ({ userId, outfitId, savedAt }: SaveOutfitMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase.from('saved-outfits').insert({
                saved_by: userId,
                outfit_id: outfitId,
                saved_at: savedAt
            })

            if (error) {
                throw error;
            }

            return data;
        }
    })
}