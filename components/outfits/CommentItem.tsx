import { CommentData } from "@/fetchers/fetchComments";
import { formatDate } from "@/helpers/helpers";
import { useDeleteCommentMutation } from "@/mutations/DeleteCommentMutation";
import { Image } from "expo-image";
import { Trash } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export const CommentItem = ({ comment }: { comment: CommentData }) => {
    const avatar = comment.user_info?.user_avatar;
    const name = comment.user_info?.full_name || 'Anonymous';

    const { mutate: deleteComment } = useDeleteCommentMutation({
        userId: comment.user_id || '',
        commentId: comment.id
    });

    return (
        <View className="flex-row mb-4 px-4">
            <View className="mr-3">
                {avatar ? (
                    <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full" />
                ) : (
                    <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                )}
            </View>
            <View className="flex-1">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                        <Text className="text-white font-medium text-sm">{name}</Text>
                        <Text className="text-gray-400 text-2xs">{formatDate(comment.created_at || '')}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Pressable onPress={() => deleteComment()}
                        className="flex-row items-center gap-2">
                            <Trash size={16} className="text-red-500" />
                        </Pressable>
                    </View>
                </View>

                <Text className="text-gray-200 mt-1 text-sm">{comment.comment_content}</Text>
                <View>
                    <Pressable className="flex-row items-center gap-2 mt-2">
                        <Text className="text-gray-400 text-2xs">Reply</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};