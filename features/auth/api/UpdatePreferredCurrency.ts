import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdatePreferredCurrencyProps {
    userId: string;
}

export const useUpdatePreferredCurrency = ({ userId }: UpdatePreferredCurrencyProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (currency: string) => {
            const { data, error } = await supabase
                .from('users')
                .update({
                    preferred_currency: currency
                })
                .eq('user_id', userId)

            if (error) {
                throw error;
            }

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users']
            });
            queryClient.invalidateQueries({
                queryKey: ['users', userId]
            });
            queryClient.refetchQueries({
                queryKey: ['users']
            });
            queryClient.refetchQueries({
                queryKey: ['users', userId]
            });
        }
    })
}