import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

async function ensureUserProfile(userId: string) {
    // Próbuje znaleźć, a jeśli nie ma – tworzy pusty profil
    const { data, error, status } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error && status !== 406) throw error;
    if (!data) {
        const { data: inserted, error: insertError } = await supabase
            .from('users')
            .insert({ user_id: userId })
            .select()
            .single();
        if (insertError) throw insertError;
        return inserted;
    }
    return data;
}

export const useFetchUser = (userId: string) => {
    return useQuery({
        queryKey: ['users', userId],
    queryFn: async () => ensureUserProfile(userId),
        enabled: !!userId 
    });
};