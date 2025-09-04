import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AcceptFollowerMutation {
    followedAccountId: string
    followerId: string
}


export const useAcceptFollowerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ followerId, followedAccountId }: AcceptFollowerMutation) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase
                .from('followers')
                .update({
                    is_approved: true
                })
                .eq('followed_account', followedAccountId)
                .eq('user_id', followerId)

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['followers', variables.followerId]
            });
        }
    })
}