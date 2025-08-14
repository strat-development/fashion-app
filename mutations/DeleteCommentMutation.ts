import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type DeleteCommentData = {
  commentId: string;
  userId: string;
};

export const useDeleteCommentMutation = ({ commentId, userId }: DeleteCommentData) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.refetchQueries({ queryKey: ['comments'] });
    },
  });
};
