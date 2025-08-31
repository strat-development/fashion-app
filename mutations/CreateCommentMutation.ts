import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateCommentParams {
  outfitId: string;
  userId: string;
  content: string;
}

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ outfitId, userId, content }: CreateCommentParams) => {
      if (!content.trim()) {
        throw new Error('Comment content cannot be empty');
      }
      const { error } = await supabase
        .from('comments')
        .insert({
          outfit_id: outfitId,
          user_id: userId,
          comment_content: content,
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.outfitId] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
};