import { useCreateCommentMutation } from '@/mutations/CreateCommentMutation';
import { Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentData, useFetchComments } from '../../fetchers/fetchComments';
import { useTheme } from '../../providers/themeContext';
import { useUserContext } from '../../providers/userContext';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  isVisible: boolean;
  onClose: () => void;
  outfitId: string;
  outfitTitle?: string;
  asInline?: boolean;
}

export default function CommentSection({ isVisible, onClose, outfitId, outfitTitle, asInline = false }: CommentSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = useUserContext();
  const { data: comments = [], isLoading } = useFetchComments(outfitId);
  const [text, setText] = useState('');
  const { mutateAsync: createComment, isPending } = useCreateCommentMutation({ outfitId, userId: userId ?? '' });

  const handleSend = async () => {
    if (!userId) {
      Alert.alert(t('commentSection.alerts.notLoggedIn.title'), t('commentSection.alerts.notLoggedIn.message'));
      return;
    }
    if (!text.trim()) return;
    try {
      await createComment(text);
      setText('');
    } catch (e: any) {
      Alert.alert(t('commentSection.alerts.error.title'), e?.message || t('commentSection.alerts.error.message'));
    }
  };

  const content = (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }} numberOfLines={1}>
              {outfitTitle ? `${t('commentSection.header')}${outfitTitle}` : t('commentSection.headerDefault')}
            </Text>
            {!asInline && (
              <Pressable onPress={onClose} style={{ padding: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.borderVariant, backgroundColor: colors.background }}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingVertical: 12 }}>
            {isLoading && (
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 16 }}>{t('commentSection.loading')}</Text>
            )}
            {!isLoading && comments.length === 0 && (
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 16 }}>{t('commentSection.empty')}</Text>
            )}
            {!isLoading && comments.map((c: CommentData) => (
              <CommentItem 
                key={c.id} 
                comment={c} 
                depth={0} 
                parentCommentId={undefined}
              />
            ))}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }}>
            <View 
              style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderVariant, borderRadius: 999, paddingHorizontal: 12, backgroundColor: colors.surfaceVariant, minHeight: 44 }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('commentSection.placeholder')}
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, color: colors.text, paddingVertical: 12, textAlignVertical: 'center', backgroundColor: 'transparent' }}
                multiline={false}
              />
              <Pressable onPress={handleSend} disabled={isPending || !text.trim()} style={{ marginLeft: 8, padding: 8 }}>
                <Send size={18} color={text.trim() ? colors.secondary : colors.textMuted} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );

  if (asInline) {
    return content;
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      {content}
    </Modal>
  );
};