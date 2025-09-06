import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FollowUserMutation {
    followedAccountId: string
    userId: string
}


export const useFollowUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, followedAccountId }: FollowUserMutation) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('followers')
                .insert({
                    followed_account: followedAccountId,
                    user_id: userId
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