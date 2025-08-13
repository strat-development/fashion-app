import { CommentData } from "@/fetchers/fetchComments";
import { useFetchCommentsReplies } from "@/fetchers/fetchCommentsReplies";
import { formatDate } from "@/helpers/helpers";
import { useCreateReplyMutation } from "@/mutations/CreateReplyMutation";
import { useDeleteCommentMutation } from "@/mutations/DeleteCommentMutation";
import { useUserContext } from "@/providers/userContext";
import { Image } from "expo-image";
import { Send, Trash, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export const CommentItem = ({ comment, isReply = false }: { comment: CommentData; isReply?: boolean }) => {
    const [isSetToReply, setIsSetToReply] = useState(false);
    const [repliesVisible, setRepliesVisible] = useState(isReply);
    const [text, setText] = useState('');

    const { userId } = useUserContext();
    const avatar = comment.user_info?.user_avatar;
    const name = comment.user_info?.full_name || 'Anonymous';

    const { data: replies } = useFetchCommentsReplies(comment.id);

    const { mutate: deleteComment } = useDeleteCommentMutation({
        userId: comment.user_id || '',
        commentId: comment.id,
    });

    const { mutateAsync: createReply, isPending } = useCreateReplyMutation({
        outfitId: comment.outfit_id || '',
        userId: comment.user_id || '',
        parentCommentId: comment.id,
        content: "@"+name + " " + text,
    });

    const handleSend = async () => {
        if (!userId) {
            Alert.alert('Not logged in', 'You must be logged in to comment.');
            return;
        }
        if (!text.trim()) return;
        try {
            await createReply();
            setText('');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to add comment');
        }
    };

    return (
        <View className={`flex-row mb-4 ${isReply ? 'ml-[-60px] px-4' : 'px-4'}`}>
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
                    {userId === comment.user_id && (
                        <View className="flex-row items-center gap-2">
                            <Pressable onPress={() => deleteComment()} className="flex-row items-center gap-2">
                                <Trash size={16} className="text-red-500" />
                            </Pressable>
                        </View>
                    )}
                </View>

                <Text className="text-gray-200 mt-1 text-sm">{comment.comment_content}</Text>

                <Pressable onPress={() => setIsSetToReply(!isSetToReply)} className="flex-row items-center gap-2 mt-2">
                    <Text className="text-gray-400 text-2xs">Reply</Text>
                </Pressable>

                {!isReply && replies && replies.length > 0 && !repliesVisible && (
                    <Pressable onPress={() => setRepliesVisible(true)} className="flex-row items-center gap-2 mt-2">
                        <Text className="text-gray-400 text-2xs">
                            View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </Text>
                    </Pressable>
                )}

                {repliesVisible && replies && replies.length > 0 && (
                    <View className="flex flex-col gap-4 w-[80vw] mt-2">
                        {!isReply && (
                            <Pressable onPress={() => setRepliesVisible(false)} className="flex-row items-center gap-2">
                                <Text className="text-gray-400 text-2xs mb-2">Hide replies</Text>
                            </Pressable>
                        )}
                        {replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </View>
                )}

                {isSetToReply && (
                    <View className="px-4 py-3 border-gray-700/40">
                        <View className="flex-row items-center border border-gray-700/50 rounded-full px-3">
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder={`Reply to ${name}`}
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 text-white py-2"
                                multiline
                            />
                            <Pressable onPress={handleSend} disabled={isPending || !text.trim()} className="ml-2 p-2">
                                <X size={0} color="transparent" />
                                <Send size={18} color={text.trim() ? '#A78BFA' : '#6B7280'} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => setIsSetToReply(false)} className="flex-row items-center gap-2 mt-2 self-end">
                            <Text className="text-gray-400 text-2xs">Cancel</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
};