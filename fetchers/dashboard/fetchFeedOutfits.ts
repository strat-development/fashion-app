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

            const outfits = data || [];
            const ids = outfits.map(o => o.outfit_id).filter(Boolean) as string[];
            if (ids.length === 0) return outfits;

            // Fetch comments for these outfits and count client-side
            const { data: commentsRows, error: commentsError } = await supabase
                .from('comments')
                .select('outfit_id')
                .in('outfit_id', ids);

            if (commentsError) {
                // On failure, still return outfits without counts
                return outfits.map(o => ({ ...o, comments: 0 } as any));
            }

            const counts = new Map<string, number>();
            (commentsRows || []).forEach(r => {
                const key = (r as any).outfit_id as string;
                counts.set(key, (counts.get(key) || 0) + 1);
            });

            return outfits.map(o => ({ ...o, comments: counts.get(o.outfit_id) || 0 } as any));
        }
    });
};