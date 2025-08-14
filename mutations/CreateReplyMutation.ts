import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type CreateReplyData = {
    outfitId: string;
    userId: string;
    content: string;
    parentCommentId: string
};

export const useCreateReplyMutation = ({ outfitId, userId, content, parentCommentId }: CreateReplyData) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('comments')
                .insert({
                    outfit_id: outfitId,
                    user_id: userId,
                    comment_content: content,
                    parent_comment: parentCommentId
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', outfitId] });
            queryClient.refetchQueries({ queryKey: ['comments', outfitId] });
        },
    });
};
