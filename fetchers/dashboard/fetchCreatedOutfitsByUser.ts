import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchCreatedOutfitsByUser = (userId: string) => {
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
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data;
        },
        enabled: !!userId 
    });
};