import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ReactionType = 'like' | 'haha' | 'sad';

export interface ReactionData {
  [key: string]: string[]; 
}

interface UpdateCommentReactionParams {
  commentId: string;
  userId: string;
  reactionType: ReactionType;
}

const updateCommentReaction = async ({ commentId, userId, reactionType }: UpdateCommentReactionParams) => {
  console.log('Updating reaction:', { commentId, userId, reactionType });
  
  const { data: existingComment, error: checkError } = await supabase
    .from('comments')
    .select('id, reactions, user_id')
    .eq('id', commentId)
    .maybeSingle();

  console.log('Existing comment check:', { existingComment, checkError });

  if (checkError) {
    console.error('Check error:', checkError);
    throw new Error(`Failed to find comment: ${checkError.message}`);
  }

  if (!existingComment) {
    throw new Error('Comment not found or no permission to access');
  }
  
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('reactions')
    .eq('id', commentId)
    .maybeSingle();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    throw new Error(`Failed to fetch comment: ${fetchError.message}`);
  }

  if (!comment) {
    throw new Error('Comment not found');
  }

  console.log('Current reactions:', comment.reactions);

  let reactions: ReactionData = {};
  
  if (comment.reactions && typeof comment.reactions === 'object') {
    reactions = { ...comment.reactions } as ReactionData;
  }

  if (!reactions.like) reactions.like = [];
  if (!reactions.haha) reactions.haha = [];
  if (!reactions.sad) reactions.sad = [];

  Object.keys(reactions).forEach(reaction => {
    reactions[reaction] = reactions[reaction].filter(id => id !== userId);
  });

  if (!reactions[reactionType].includes(userId)) {
    reactions[reactionType].push(userId);
  }

  console.log('Updated reactions:', reactions);

  console.log('Attempting direct update...');
  
  const { data: updateData, error, count } = await supabase
    .from('comments')
    .update({ reactions })
    .eq('id', commentId)
    .select('id, reactions');

  console.log('Update result:', { updateData, error, count });

  if (error) {
    console.error('Update error:', error);
    throw new Error(`Failed to update reaction: ${error.message}`);
  }

  if (!updateData || updateData.length === 0) {
    console.warn('No rows were updated - might be RLS policy issue');
    
    const { data: testRead, error: readError } = await supabase
      .from('comments')
      .select('id, user_id, reactions')
      .eq('id', commentId)
      .maybeSingle();
    
    console.log('Test read after update:', { testRead, readError });
    
    throw new Error('No rows were updated - check RLS policies or user permissions');
  }

  const { data: updatedComment, error: verifyError } = await supabase
    .from('comments')
    .select('reactions')
    .eq('id', commentId)
    .maybeSingle();

  if (verifyError) {
    console.error('Verification fetch error:', verifyError);
  } else {
    console.log('Verified updated comment reactions:', updatedComment?.reactions);
  }

  console.log('Reaction updated successfully');
  return { commentId, reactions };
};

export const useUpdateCommentReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommentReaction,
    onMutate: async ({ commentId, userId, reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      
      const previousComments = queryClient.getQueriesData({ queryKey: ['comments'] });
      
      queryClient.setQueriesData({ queryKey: ['comments'] }, (old: any) => {
        if (!old) return old;
        
        return old.map((comment: any) => {
          if (comment.id === commentId) {
            let newReactions = { like: [], haha: [], sad: [], ...comment.reactions };
            
            Object.keys(newReactions).forEach(reaction => {
              newReactions[reaction] = newReactions[reaction].filter((id: string) => id !== userId);
            });
            
            if (!newReactions[reactionType].includes(userId)) {
              newReactions[reactionType].push(userId);
            }
            
            console.log('Optimistic update:', { commentId, newReactions });
            return { ...comment, reactions: newReactions };
          }
          return comment;
        });
      });
      
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments-replies'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};
