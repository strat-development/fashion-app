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
        content: "@" + name + " " + text,
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
            <View className="mr-3 mt-0.5">
                {avatar ? (
                    <Image source={{ uri: avatar }} className="w-9 h-9 rounded-full" />
                ) : (
                    <View className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                )}
            </View>
            <View className="flex-1">
                <View className="bg-gray-800/40 border border-gray-700/40 rounded-xl px-3.5 py-3">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-2">
                            <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                                <Text className="text-white font-medium text-[13px] leading-tight">{name}</Text>
                                <Text className="text-gray-500 text-[10px]">{formatDate(comment.created_at || '')}</Text>
                            </View>
                            <Text className="text-gray-200 text-[13px] leading-relaxed mt-1">
                                {comment.comment_content}
                            </Text>
                        </View>
                        {userId === comment.user_id && (
                            <Pressable
                                onPress={() => deleteComment()}
                                hitSlop={8}
                                className="px-2 py-1 -mr-1 -mt-1 rounded-md active:opacity-70"
                            >
                                <Trash size={16} color="#ef4444" />
                            </Pressable>
                        )}
                    </View>
                    <View className="flex-row items-center mt-2">
                        <Pressable
                            onPress={() => setIsSetToReply(!isSetToReply)}
                            hitSlop={8}
                            className="rounded px-2 py-1 active:opacity-70"
                        >
                            <Text className="text-gray-400 text-[11px] tracking-tight">Reply</Text>
                        </Pressable>
                        {!isReply && replies && replies.length > 0 && !repliesVisible && (
                            <Pressable onPress={() => setRepliesVisible(true)} hitSlop={8} className="rounded px-2 py-1 ml-1 active:opacity-70">
                                <Text className="text-blue-400 text-[11px] tracking-tight">View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</Text>
                            </Pressable>
                        )}
                        {!isReply && repliesVisible && replies && replies.length > 0 && (
                            <Pressable onPress={() => setRepliesVisible(false)} hitSlop={8} className="rounded px-2 py-1 ml-1 active:opacity-70">
                                <Text className="text-blue-400 text-[11px] tracking-tight">Hide replies</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {!isReply && repliesVisible && replies && replies.length > 0 && (
                    <View className="mt-3 space-y-2">
                        {replies.map(reply => (
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
                    <View className="mt-2">
                        <View className="flex-row items-end bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2">
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder={`Reply to ${name}`}
                                placeholderTextColor="#6B7280"
                                className="flex-1 text-white text-[13px] max-h-32"
                                multiline
                            />
                            <Pressable
                                onPress={handleSend}
                                disabled={isPending || !text.trim()}
                                hitSlop={8}
                                className="ml-2 px-2 py-1 rounded-lg active:opacity-70"
                            >
                                <Send size={16} color={text.trim() ? '#A78BFA' : '#4B5563'} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => setIsSetToReply(false)} hitSlop={8} className="self-end mt-1 px-2 py-1">
                            <Text className="text-gray-500 text-[11px]">Cancel</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
};