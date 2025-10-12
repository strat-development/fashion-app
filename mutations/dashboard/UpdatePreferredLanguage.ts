import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdatePreferredLanguageProps {
    userId: string;
}

export const useUpdatePreferredLanguage = ({ userId }: UpdatePreferredLanguageProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (language: string) => {
            const { data, error } = await supabase
                .from('users')
                .update({
                    preferred_language: language
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