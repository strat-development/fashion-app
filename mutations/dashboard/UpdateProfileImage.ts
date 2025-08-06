import { supabaseAdmin } from "@/lib/admin";
import { useMutation } from "@tanstack/react-query";

interface UpdateProfileImageProps {
    image: File;
    userId: string;
}

export const useUpdateProfileImage = ({ image, userId }: UpdateProfileImageProps) => {
    const path = userId + image.name + Date.now();

    return useMutation({
        mutationFn: async () => {
            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ user_avatar: path })
                .eq('user_id', userId)

            if (error) {
                throw error;
            }

            return data
        }
    })
}