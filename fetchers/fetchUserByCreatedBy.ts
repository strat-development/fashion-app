import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchUser = (userId: string) => {
    return useQuery({
        queryKey: ['users', userId],
        queryFn: async () => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('users')
                .select('full_name')
                .eq('user_id', userId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        }
    });
};