import { useUserContext } from '@/features/auth/context/UserContext';
import { CommentData, useFetchCommentsReplies } from '@/fetchers/fetchComments';
import { useCreateReplyMutation } from '@/mutations/CreateReplyMutation';
import { useDeleteCommentMutation } from '@/mutations/DeleteCommentMutation';
import { ReactionData } from '@/mutations/UpdateCommentReactionMutation';
import { useTheme } from '@/providers/themeContext';
import { formatDate } from '@/utils/dateUtils';
import { Link, useRouter } from 'expo-router';
import { AlertTriangle, Send, Trash } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CommentReactions } from './CommentReactions';

interface CommentItemProps {
    comment: CommentData;
    outfitId: string;
    depth?: number;
}

export const CommentItem = ({ comment, outfitId, depth = 0 }: CommentItemProps) => {
    const { t } = useTranslation();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { userId } = useUserContext();
    const { colors } = useTheme();
    const router = useRouter();

    const { data: replies } = useFetchCommentsReplies(comment.id);

    const { mutate: deleteComment, isPending: isDeleting } = useDeleteCommentMutation({
        commentId: comment.id,
        userId: userId || ''
    });

    const { mutate: createReply, isPending: isReplying } = useCreateReplyMutation({
        outfitId,
        userId: userId || '',
        parentCommentId: comment.id
    });

    const handleDelete = () => {
        deleteComment();
        setShowDeleteModal(false);
    };

    const handleReply = () => {
        if (!replyText.trim()) return;

        createReply(replyText, {
            onSuccess: () => {
                setReplyText('');
                setShowReplyInput(false);
            }
        });
    };

    const isOwner = userId === comment.user_id;

    return (
        <View style={{ marginLeft: depth * 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row' }}>
                <Link href={`/userProfile/${comment.user_id}`} asChild>
                    <Pressable>
                        <Image
                            source={{ uri: comment.profiles?.user_avatar || 'https://via.placeholder.com/40' }}
                            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                        />
                    </Pressable>
                </Link>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link href={`/userProfile/${comment.user_id}`} asChild>
                            <Pressable>
                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>
                                    {comment.profiles?.nickname || 'User'}
                                </Text>
                            </Pressable>
                        </Link>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            {formatDate(comment.created_at)}
                        </Text>
                    </View>

                    <Text style={{ color: colors.text, marginTop: 4, fontSize: 14 }}>{comment.comment_content}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
                        <Pressable onPress={() => setShowReplyInput(!showReplyInput)}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                                {t('comments.reply')}
                            </Text>
                        </Pressable>

                        {isOwner && (
                            <Pressable onPress={() => setShowDeleteModal(true)}>
                                <Trash size={14} color={colors.error} />
                            </Pressable>
                        )}
                    </View>

                    <CommentReactions commentId={comment.id} reactions={comment.reactions as unknown as ReactionData} />

                    {showReplyInput && (
                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder={t('comments.writeReply')}
                                placeholderTextColor={colors.textSecondary}
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.surface,
                                    borderRadius: 20,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    color: colors.text,
                                    marginRight: 8,
                                }}
                            />
                            <Pressable
                                onPress={handleReply}
                                disabled={isReplying || !replyText.trim()}
                                style={{
                                    backgroundColor: colors.primary,
                                    padding: 8,
                                    borderRadius: 20,
                                    opacity: isReplying || !replyText.trim() ? 0.5 : 1,
                                }}
                            >
                                <Send size={16} color="#FFF" />
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            {replies?.map((reply: CommentData) => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    outfitId={outfitId}
                    depth={depth + 1}
                />
            ))}

            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '80%', maxWidth: 320 }}>
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 999, marginBottom: 16 }}>
                                <AlertTriangle size={24} color="#EF4444" />
                            </View>
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                                {t('comments.deleteTitle')}
                            </Text>
                            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                                {t('comments.deleteMessage')}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowDeleteModal(false)}
                                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                            >
                                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600' }}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                disabled={isDeleting}
                                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444' }}
                            >
                                <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '600' }}>
                                    {isDeleting ? t('common.deleting') : t('common.delete')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};