import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

export type CommentData = Database["public"]["Tables"]["comments"]["Row"] & {
  user_info?: {
    nickname: string | null;
    user_avatar: string | null;
  };
};

export const useFetchComments = (outfitId: string) => {
  return useQuery({
    queryKey: ['comments', outfitId],
    queryFn: async () => {
      console.log('Fetching comments for outfit:', outfitId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_info:users!user_id (
            nickname,
            user_avatar
          )
        `)
        .eq('outfit_id', outfitId)
        .is('parent_comment', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('Fetched comments data:', data);
      
      data?.forEach(comment => {
        console.log(`Comment ${comment.id} reactions:`, comment.reactions);
      });
      
      return data as CommentData[];
    },
    enabled: !!outfitId
  });
};