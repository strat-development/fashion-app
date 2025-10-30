import { reportTopics } from '@/consts/reportTopics';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedGradient } from '@/providers/themeContext';
import { X, Flag } from 'lucide-react-native';

export type ReportPostPayload = {
  postId: string;
  postTitle?: string | null;
  postOwnerId?: string | null;
  reasons: string[];
  comment?: string;
};

interface ReportPostModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string | null;
  postOwnerId?: string | null;
}

export const ReportPostModal = ({ isVisible, onClose, postId, postTitle, postOwnerId }: ReportPostModalProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId, userName, userEmail } = useUserContext();

  const [selected, setSelected] = useState<string[]>([]); // stores topic keys
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggle = (topicKey: string) => {
    setSelected(prev => prev.includes(topicKey) ? prev.filter(t => t !== topicKey) : [...prev, topicKey]);
  };

  const canSubmit = useMemo(() => selected.length > 0 && !!userId, [selected, userId]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Map keys to English labels for consistent Discord/DB entries
      const reasonLabels = selected
        .map(key => reportTopics.find(rt => rt.key === key)?.label)
        .filter(Boolean) as string[];

      const payload = {
        userId,
        name: userName || null,
        email: userEmail || null,
        type: 'post-report',
        postId,
        postTitle: postTitle || null,
        postOwnerId: postOwnerId || null,
        reasons: reasonLabels,
        comment: comment || null,
      } as any;

      const candidates = [
        process.env.EXPO_PUBLIC_REPORT_CONTENT_FUNCTION_NAME,
        'report-content',
        'report_post',
      ].filter(Boolean) as string[];

      let invoked = false;
      let lastError: any = null;
      for (const fnName of candidates) {
        try {
          const { error } = await supabase.functions.invoke(fnName, { body: payload } as any);
          if (!error) { invoked = true; break; }
          lastError = error;
          console.warn(`Edge Function '${fnName}' invoke error:`, error);
        } catch (err) {
          lastError = err;
          console.warn(`Edge Function '${fnName}' invoke threw:`, err);
        }
      }

      if (!invoked) {
        // Fallback: insert into generic reports table
        const insertPayload = {
          user_id: userId,
          name: userName || null,
          email: userEmail || null,
          subject: 'Post report',
          message: JSON.stringify({ postId, postTitle, postOwnerId, reasons: selected, comment: comment || null }),
          created_at: new Date().toISOString(),
        } as any;
        const { error: insertErr } = await (supabase as any).from('reports').insert(insertPayload);
        if (insertErr) throw insertErr;
      }

      Alert.alert(t('reportPost.success') || 'Report sent');
      onClose();
      setSelected([]);
      setComment('');
    } catch (e) {
      console.error('Report post failed', e);
      Alert.alert(t('reportPost.failure') || 'Failed to send report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <X size={24} color={colors.textMuted} />
          </Pressable>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('reportPost.title') || 'Report post'}</Text>
          <Pressable onPress={handleSubmit} disabled={!canSubmit || submitting} style={{ padding: 8, opacity: !canSubmit || submitting ? 0.5 : 1 }}>
            <Text style={{ color: colors.primary }}>{t('reportPost.send') || 'Send'}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {!!postTitle && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('reportPost.post') || 'Post'}</Text>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{postTitle}</Text>
            </View>
          )}

          <Text style={{ color: colors.text, marginBottom: 8 }}>{t('reportPost.reasons') || 'Reasons'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {reportTopics.map((topic) => {
              const active = selected.includes(topic.key);
              const label = t(`reportPost.reason.${topic.key}`) || topic.label;
              return (
                <Pressable key={topic.key} onPress={() => toggle(topic.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active ? colors.accent + '20' : colors.surfaceVariant,
                  }}
                >
                  <Text style={{ color: active ? colors.accent : colors.text }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ color: colors.text, marginBottom: 8 }}>{t('reportPost.commentOptional') || 'Additional details (optional)'}</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            placeholder={t('reportPost.commentPlaceholder') || 'Describe the issue or add context...'}
            placeholderTextColor={colors.textMuted}
            style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, color: colors.text, textAlignVertical: 'top', minHeight: 120 }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};
