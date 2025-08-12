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

            const outfits = data || [];
            const ids = outfits.map(o => o.outfit_id).filter(Boolean) as string[];
            if (ids.length === 0) return outfits;

            const { data: commentsRows, error: commentsError } = await supabase
                .from('comments')
                .select('outfit_id')
                .in('outfit_id', ids);

            if (commentsError) return outfits.map(o => ({ ...o, comments: 0 } as any));

            const counts = new Map<string, number>();
            (commentsRows || []).forEach(r => {
                const key = (r as any).outfit_id as string;
                counts.set(key, (counts.get(key) || 0) + 1);
            });

            return outfits.map(o => ({ ...o, comments: counts.get(o.outfit_id) || 0 } as any));
        },
        enabled: !!userId 
    });
};