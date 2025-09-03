import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditProfileMutationProps {
    userName: string;
    userBio: string;
    userImage: string;
    userEmail: string;
    userSocials: string[];
    isPublic: boolean;
}

export const useEditProfileMutation = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userName,
            userBio,
            userImage,
            userEmail,
            userSocials,
            isPublic
        }: EditProfileMutationProps) => {
            if (!supabase) {
                throw new Error('Supabase client is not initialized.');
            }

            console.log('Updating profile with data:', {
                full_name: userName,
                bio: userBio,
                user_avatar: userImage,
                email: userEmail,
                socials: userSocials,
                is_public: isPublic
            });

            const { data, error } = await supabase.from('users')
                .update({
                    full_name: userName,
                    bio: userBio,
                    user_avatar: userImage,
                    email: userEmail,
                    socials: userSocials,
                    is_public: isPublic
                })
                .eq('user_id', userId)
                .select()

            if (error) {
                console.error('Profile update error:', error);
                throw error;
            }

            console.log('Profile updated successfully:', data);
            return data;

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