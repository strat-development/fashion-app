import { CommentData } from "@/fetchers/fetchComments";
import { useFetchCommentsReplies } from "@/fetchers/fetchCommentsReplies";
import { formatDate } from "@/helpers/helpers";
import { useCreateReplyMutation } from "@/mutations/CreateReplyMutation";
import { useDeleteCommentMutation } from "@/mutations/DeleteCommentMutation";
import { useUserContext } from "@/providers/userContext";
import { Image } from "expo-image";
import { Send, Trash } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export const CommentItem = ({ comment, isReply = false, depth = 0, parentCommentId }: { 
    comment: CommentData; 
    isReply?: boolean; 
    depth?: number; 
    parentCommentId?: string;
}) => {
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

    const targetParentId = isReply ? (parentCommentId || comment.parent_comment) : comment.id;

    const { mutateAsync: createReply, isPending } = useCreateReplyMutation({
        outfitId: comment.outfit_id || '',
        userId: userId || '',
        parentCommentId: targetParentId || comment.id,
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
        <View className={`flex-row mb-3 ${depth > 0 ? 'ml-4 pl-2 border-l border-gray-700/50' : 'px-4'}`}>
            <View className="mr-3">
                {avatar ? (
                    <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full" />
                ) : (
                    <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                )}
            </View>
            <View className="flex-1">
                <View className="bg-gray-800/50 rounded-lg p-3 relative">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white font-medium text-sm">{name}</Text>
                            <Text className="text-gray-400 text-2xs">{formatDate(comment.created_at || '')}</Text>
                        </View>
                        {userId === comment.user_id && (
                            <Pressable onPress={() => deleteComment()} className="p-1">
                                <Trash size={16} color="#EF4444" />
                            </Pressable>
                        )}
                    </View>
                    <Text className="text-gray-200 text-sm">{comment.comment_content}</Text>
                </View>

                <View className="flex-row items-center mt-2">
                    <Pressable onPress={() => setIsSetToReply(!isSetToReply)} className="mr-4">
                        <Text className="text-gray-400 text-xs">Reply</Text>
                    </Pressable>
                </View>

                {!isReply && replies && replies.length > 0 && !repliesVisible && (
                    <Pressable onPress={() => setRepliesVisible(true)} className="mt-2">
                        <Text className="text-blue-400 text-xs">
                            View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </Text>
                    </Pressable>
                )}

                {!isReply && repliesVisible && replies && replies.length > 0 && (
                    <View className="mt-3">
                        <Pressable onPress={() => setRepliesVisible(false)} className="mb-2">
                            <Text className="text-blue-400 text-xs">Hide replies</Text>
                        </Pressable>
                        {replies.map((reply) => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                isReply={true} 
                                depth={1} 
                                parentCommentId={comment.id}
                            />
                        ))}
                    </View>
                )}

                {isSetToReply && (
                    <View className="mt-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700/30">
                        <View className="flex-row items-center bg-gray-700/50 border border-gray-600/50 rounded-full px-3">
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder={`Reply to ${name}`}
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 text-white py-2 text-sm"
                                multiline
                            />
                            <Pressable onPress={handleSend} disabled={isPending || !text.trim()} className="ml-2 p-1">
                                <Send size={14} color={text.trim() ? '#A78BFA' : '#6B7280'} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => setIsSetToReply(false)} className="mt-1 self-end">
                            <Text className="text-gray-400 text-xs">Cancel</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
};