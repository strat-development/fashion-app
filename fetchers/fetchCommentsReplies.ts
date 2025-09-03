import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

export type CommentData = Database["public"]["Tables"]["comments"]["Row"] & {
    user_info?: {
        nickname: string | null;
        user_avatar: string | null;
    };
};

export const useFetchCommentsReplies = (parentCommentId: string) => {
    return useQuery({
        queryKey: ['comments', parentCommentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select(`
      *,
      user_info:users!user_id (
        nickname,
        user_avatar
      )
    `)
                .eq('parent_comment', parentCommentId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as CommentData[];
        },
        enabled: !!parentCommentId
    });
};