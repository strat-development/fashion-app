import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type CreateCommentData = {
  outfitId: string;
  userId: string;
  content: string;
};

export const useCreateCommentMutation = ({ outfitId, userId, content }: CreateCommentData) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').insert({
        outfit_id: outfitId,
        user_id: userId,
        comment_content: content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', outfitId] });
      queryClient.refetchQueries({ queryKey: ['comments', outfitId] });
    },
  });
};
