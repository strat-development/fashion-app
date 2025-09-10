import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FollowUserMutation {
    followedAccountId: string
    userId: string
}

export const useUnFollowUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, followedAccountId }: FollowUserMutation) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('followers')
                .delete()
                .eq('followed_account', followedAccountId)
                .eq('user_id', userId)

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