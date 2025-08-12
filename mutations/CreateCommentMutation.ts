import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type CreateCommentData = {
  outfitId: string;
  userId: string;
  content: string;
};

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ outfitId, userId, content }: CreateCommentData) => {
      const { error } = await supabase.from('comments').insert({
        outfit_id: outfitId,
        user_id: userId,
        comment_content: content,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.outfitId] });
    },
  });
};
