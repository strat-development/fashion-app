import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateCommentParams {
  outfitId: string;
  userId: string;
  content: string;
}

export const useCreateCommentMutation = ({ outfitId, userId }: Omit<CreateCommentParams, 'content'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
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

      const { error: activityError } = await supabase.from('activities').insert({
        user_id: userId,
        activity_type: 'new_comment',
        outfit_id: outfitId,
      });

      if (activityError) throw activityError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', outfitId] });
      queryClient.refetchQueries({ queryKey: ['comments', outfitId] });
      queryClient.invalidateQueries({ queryKey: ['created-outfits'] });
      queryClient.invalidateQueries({ queryKey: ['saved-outfits'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity', userId] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
};