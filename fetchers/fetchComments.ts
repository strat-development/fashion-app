import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

export type CommentData = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles?: {
    nickname: string | null;
    user_avatar: string | null;
  };
  reactions?: any; // Add reactions to type since it's used
};

export const useFetchComments = (outfitId: string) => {
  return useQuery({
    queryKey: ['comments', outfitId],
    queryFn: async () => {

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:users!user_id (
            nickname,
            user_avatar
          )
        `)
        .eq('outfit_id', outfitId)
        .is('parent_comment', null)
        .order('created_at', { ascending: false });
      if (error) throw error;

      return data as CommentData[];
    },
    enabled: !!outfitId
  });
};

export const useFetchCommentsReplies = (commentId: string) => {
  return useQuery({
    queryKey: ['comments', 'replies', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:users!user_id (
            nickname,
            user_avatar
          )
        `)
        .eq('parent_comment', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data as CommentData[];
    },
    enabled: !!commentId
  });
};