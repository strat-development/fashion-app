import { CommentData } from "@/fetchers/fetchComments";
import { useFetchCommentsReplies } from "@/fetchers/fetchCommentsReplies";
import { formatDate } from "@/helpers/helpers";
import { useCreateReplyMutation } from "@/mutations/CreateReplyMutation";
import { useDeleteCommentMutation } from "@/mutations/DeleteCommentMutation";
import { useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { AlertTriangle, Send, Trash, X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BlurView } from 'expo-blur';
import { CommentReactions } from "./CommentReactions";


export const CommentItem = ({ comment, isReply = false, depth = 0, parentCommentId }: {
    comment: CommentData;
    isReply?: boolean;
    depth?: number;
    parentCommentId?: string;
}) => {
    const { t } = useTranslation();
    const [isSetToReply, setIsSetToReply] = useState(false);
    const [repliesVisible, setRepliesVisible] = useState(isReply);
    const [text, setText] = useState('');

    const { userId } = useUserContext();
    const { colors, isDark } = useTheme();
    const avatar = comment.user_info?.user_avatar;
    const name = comment.user_info?.nickname || t('outfitDetail.info.anonymous');

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
    });

    const handleSend = async () => {
        if (!userId) {
            Alert.alert(t('commentItem.alerts.notLoggedIn.title'), t('commentItem.alerts.notLoggedIn.message'));
            return;
        }
        if (!text.trim()) return;
        try {
            await createReply("@" + name + " " + text);
            setText('');
            setIsSetToReply(false);
        } catch (e: any) {
            Alert.alert(t('commentItem.alerts.error.title'), e?.message || t('commentItem.alerts.error.message'));
        }
    };

    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

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
                <View style={{ borderWidth: 1, borderColor: colors.borderVariant, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                                <Link href={{ pathname: "/userProfile/[id]", params: { id: comment.user_id } }} style={{ color: colors.text, fontWeight: '500', fontSize: 13, lineHeight: 16 }}>{name}</Link>
                                <Text style={{ color: colors.textMuted, fontSize: 10 }}>{formatDate(comment.created_at || '')}</Text>
                            </View>
                            <Text style={{ color: colors.text, fontSize: 13, lineHeight: 18, marginTop: 4 }}>{comment.comment_content}</Text>
                        </View>
                        {userId === comment.user_id && (
                            <Pressable
                                onPress={() => setConfirmDeleteVisible(true)}
                                hitSlop={8}
                                style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: -4, marginTop: -4, borderRadius: 6 }}
                            >
                                <Trash size={16} color="#ef4444" />
                            </Pressable>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Pressable
                            onPress={() => setIsSetToReply(!isSetToReply)}
                            hitSlop={8}
                            style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}
                        >
                            <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.2 }}>{t('commentItem.reply')}</Text>
                        </Pressable>
                        {!isReply && replies && replies.length > 0 && !repliesVisible && (
                            <Pressable onPress={() => setRepliesVisible(true)} hitSlop={8} style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 }}>
                                <Text style={{ color: isDark ? colors.primary : colors.accent, fontSize: 11, letterSpacing: 0.2 }}>{t('commentItem.viewReplies')} { replies.length }</Text>
                            </Pressable>
                        )}
                        {!isReply && repliesVisible && replies && replies.length > 0 && (
                            <Pressable onPress={() => setRepliesVisible(false)} hitSlop={8} style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 }}>
                                <Text style={{ color: isDark ? colors.primary : colors.accent, fontSize: 11, letterSpacing: 0.2 }}>{t('commentItem.hideReplies')}</Text>
                            </Pressable>
                        )}
                    </View>
                    <CommentReactions
                        commentId={comment.id}
                        reactions={comment.reactions as any}
                    />
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
                    <View style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', borderWidth: 1, borderColor: colors.borderVariant, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface }}>
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder={t('commentItem.replyPlaceholder') + name}
                                placeholderTextColor={colors.textMuted}
                                style={{ flex: 1, color: colors.text, fontSize: 13, maxHeight: 128 }}
                                multiline
                            />
                            <Pressable
                                onPress={handleSend}
                                disabled={isPending || !text.trim()}
                                hitSlop={8}
                                style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
                            >
                                <Send size={16} color={text.trim() ? colors.primary : colors.textMuted} />
                            </Pressable>
                        </View>
                        <Pressable onPress={() => setIsSetToReply(false)} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t('commentItem.cancel')}</Text>
                        </Pressable>
                    </View>
                )}

                {/* Delete confirmation modal - styled to match AI chat delete */}
                <Modal
                    visible={confirmDeleteVisible}
                    animationType={'fade'}
                    transparent={true}
                    onRequestClose={() => setConfirmDeleteVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)' }}>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
                        </View>
                        <View style={{ width: '100%', maxWidth: 520, borderRadius: 18, padding: 18, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: `${colors.error}20` }}>
                                        <AlertTriangle size={18} color={colors.error} />
                                    </View>
                                    <Text style={{ color: colors.text, fontWeight: '600' }}>{t('deleteModalOutfit.title')}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={{ padding: 6 }}>
                                    <X size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ color: colors.textSecondary, marginBottom: 18 }}>{t('deleteModalOutfit.message')}</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' }}>
                                    <Text style={{ color: colors.text }}>{t('deleteModalOutfit.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setConfirmDeleteVisible(false); deleteComment(); }} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center' }}>
                                    <Text style={{ color: colors.white }}>{t('deleteModalOutfit.delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};