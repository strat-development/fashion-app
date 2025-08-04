import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchFeedOutfits = () => {
    return useQuery({
        queryKey: ['created-outfits'],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('created-outfits')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data;
        }
    });
};