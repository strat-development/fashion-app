import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchCreatedOutfits = (userId: string) => {
    return useQuery({
        queryKey: ['created-outfits', userId],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('created-outfits')
                .select('*')
                .eq('created_by', userId)

            if (error) {
                throw error;
            }

            return data;
        }
    });
};