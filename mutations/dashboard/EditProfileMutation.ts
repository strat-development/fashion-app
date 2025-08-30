import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditProfileMutationProps {
    userName: string;
    userBio: string;
    userImage: string;
    userEmail: string;
    userSocials: string[];
}

export const useEditProfileMutation = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userName,
            userBio,
            userImage,
            userEmail,
            userSocials
        }: EditProfileMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            const { data, error } = await supabase.from('users')
                .update({
                    full_name: userName,
                    bio: userBio,
                    user_avatar: userImage,
                    email: userEmail,
                    socials: userSocials
                })
                .eq('user_id', userId)
                .select()

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users']
            });
            queryClient.invalidateQueries({
                queryKey: ['user', userId]
            });
        }
    })
}