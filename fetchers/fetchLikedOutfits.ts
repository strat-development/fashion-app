import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchLikedOutfits = (userId: string) => {
    return useQuery({
        queryKey: ['liked-outfits', userId],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('liked-outfits')
                .select('*')
                .eq('user_id', userId)

            if (error) {
                throw error;
            }

            return data;
        },
        enabled: !!userId
    });
}