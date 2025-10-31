import { reportTopics } from '@/consts/reportTopics';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedGradient } from '@/providers/themeContext';
import { X, CheckCircle } from 'lucide-react-native';

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
  const { colors, isDark } = useTheme();
  const { userId, userName, userEmail } = useUserContext();

  const [selected, setSelected] = useState<string[]>([]); // stores topic keys
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

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

      // Show friendly thank-you popup instead of a plain alert
      setShowThanks(true);
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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {reportTopics.map((topic) => {
              const active = selected.includes(topic.key);
              const label = t(`reportPost.reason.${topic.key}`) || topic.label;
              return (
                <Pressable
                  key={topic.key}
                  onPress={() => toggle(topic.key)}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active ? colors.accent : colors.surface,
                  }}
                >
                  <Text style={{
                    color: active ? colors.white : colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>{label}</Text>
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
        {/* Thank you popup - styled like delete confirmation modal, with single OK */}
        <Modal
          visible={showThanks}
          animationType={'fade'}
          transparent={true}
          onRequestClose={() => setShowThanks(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)' }}>
            <View style={{ width: '100%', maxWidth: 520, borderRadius: 18, padding: 18, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: `${colors.accent}20` }}>
                    <CheckCircle size={18} color={colors.accent} />
                  </View>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{t('reportPost.thanksTitle') || 'Thank you!'}</Text>
                </View>
                <Pressable onPress={() => setShowThanks(false)} style={{ padding: 6 }}>
                  <X size={20} color={colors.text} />
                </Pressable>
              </View>
              <Text style={{ color: colors.textSecondary, marginBottom: 18 }}>{t('reportPost.thanksBody') || 'Thanks for your report. Our team is reviewing it.'}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Pressable
                  onPress={() => { setShowThanks(false); onClose(); }}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.white, fontWeight: '600' }}>{t('common.ok') || 'OK'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};
