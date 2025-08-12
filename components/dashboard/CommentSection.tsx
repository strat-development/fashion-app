import { Image } from 'expo-image';
import { Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentData, useFetchComments } from '../../fetchers/fetchComments';
import { formatDate } from '../../helpers/helpers';
import { useUserContext } from '../../providers/userContext';

// We'll wire mutation via a local fetcher to avoid path alias issues during creation
import { useCreateCommentMutation } from '../../mutations/CreateCommentMutation';

interface CommentSectionProps {
  isVisible: boolean;
  onClose: () => void;
  outfitId: string;
  outfitTitle?: string;
}

const CommentItem = ({ comment }: { comment: CommentData }) => {
  const avatar = comment.user_info?.user_avatar;
  const name = comment.user_info?.full_name || 'Anonymous';
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
          <Text className="text-white font-medium text-sm">{name}</Text>
          <Text className="text-gray-400 text-2xs">{formatDate(comment.created_at || '')}</Text>
        </View>
        <Text className="text-gray-200 mt-1 text-sm">{comment.comment_content}</Text>
      </View>
    </View>
  );
};

export const CommentSection = ({ isVisible, onClose, outfitId, outfitTitle }: CommentSectionProps) => {
  const { userId } = useUserContext();
  const { data: comments = [], isLoading } = useFetchComments(outfitId);
  const [text, setText] = useState('');
  const { mutateAsync: createComment, isPending } = useCreateCommentMutation();

  const handleSend = async () => {
    if (!userId) {
      Alert.alert('Not logged in', 'You must be logged in to comment.');
      return;
    }
    if (!text.trim()) return;
    try {
      await createComment({ outfitId, userId, content: text.trim() });
      setText('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add comment');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/70">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700/40 bg-gray-900/90">
              <Text className="text-white font-semibold text-base" numberOfLines={1}>
                {outfitTitle ? `Comments • ${outfitTitle}` : 'Comments'}
              </Text>
              <Pressable onPress={onClose} className="p-2 rounded-full bg-gray-800/70 border border-gray-700/50">
                <X size={16} color="#E5E7EB" />
              </Pressable>
            </View>

            {/* List */}
            <ScrollView className="flex-1 bg-gray-900/80" contentContainerStyle={{ paddingVertical: 12 }}>
              {isLoading && (
                <Text className="text-gray-400 text-center mt-4">Loading…</Text>
              )}
              {!isLoading && comments.length === 0 && (
                <Text className="text-gray-400 text-center mt-4">No comments yet. Be the first!</Text>
              )}
              {!isLoading && comments.map((c: CommentData) => <CommentItem key={c.id} comment={c} />)}
            </ScrollView>

            {/* Input */}
            <View className="px-4 py-3 bg-gray-900/90 border-t border-gray-700/40">
              <View className="flex-row items-center bg-gray-800/70 border border-gray-700/50 rounded-full px-3">
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Add a comment…"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-white py-2"
                  multiline
                />
                <Pressable onPress={handleSend} disabled={isPending || !text.trim()} className="ml-2 p-2">
                  <X size={0} color="transparent" />
                  <Send size={18} color={text.trim() ? '#A78BFA' : '#6B7280'} />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CommentSection;
