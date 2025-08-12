import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

export type CommentData = Database["public"]["Tables"]["comments"]["Row"] & {
  user_info?: {
    full_name: string | null;
    user_avatar: string | null;
  };
};

const fetchCommentsForOutfit = async (outfitId: string): Promise<CommentData[]> => {
  if (!outfitId) return [];

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_info:users!user_id (
        full_name,
        user_avatar
      )
    `)
    .eq('outfit_id', outfitId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const useFetchComments = (outfitId: string) => {
  return useQuery({
    queryKey: ['comments', outfitId],
    queryFn: () => fetchCommentsForOutfit(outfitId),
    enabled: !!outfitId,
    staleTime: 30000, // 30 seconds
  });
};
