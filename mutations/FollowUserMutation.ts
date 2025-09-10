import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FollowUserMutation {
    followedAccountId: string
    userId: string
    isPublicAccount: boolean
}


export const useFollowUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, followedAccountId, isPublicAccount }: FollowUserMutation) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('followers')
                .insert({
                    followed_account: followedAccountId,
                    user_id: userId,
                    is_public_account: isPublicAccount,
                    is_approved: isPublicAccount ? true : false,    
                })

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['followers', variables.userId]
            });
        }
    })
}