import { supabase } from '@/lib/supabase';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { BookOpen, Bug, Edit3, Heart, User, User2, X, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

interface ProfileHeaderProps {
  userImage: string | null;
  userName: string | null;
  isOwnProfile: boolean;
  activeTab: string;
  onTabPress: (tab: 'user-info' | 'created-outfits' | 'saved-outfits') => void;
  onEditProfile: () => void;
}

export function ProfileHeader({
  userImage,
  userName,
  isOwnProfile,
  activeTab,
  onTabPress,
  onEditProfile,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportSubject, setReportSubject] = React.useState('');
  const [reportMessage, setReportMessage] = React.useState('');
  const [showThanks, setShowThanks] = React.useState(false);
  const { userId, userName: currentUserName, userEmail: currentUserEmail } = useUserContext();

  const handleSendReport = async () => {
    const funcPayload = {
      userId: userId || null,
      name: currentUserName || null,
      email: currentUserEmail || null,
      subject: reportSubject || 'Bug report',
      description: reportMessage || ''
    };

    console.log('Sending report (client):', funcPayload);

    try {
      const candidates = [
        process.env.EXPO_PUBLIC_REPORT_FUNCTION_NAME,
        'report',
        'report-handler',
      ].filter(Boolean) as string[];

      let invoked = false;
      let lastError: any = null;
      for (const fnName of candidates) {
        try {
          const { data, error } = await supabase.functions.invoke(fnName, {
            body: funcPayload,
          } as any);
          if (!error) {
            invoked = true;
            break;
          }
          lastError = error;
          console.warn(`Edge Function '${fnName}' invoke error:`, error);
        } catch (err) {
          lastError = err;
          console.warn(`Edge Function '${fnName}' invoke threw:`, err);
        }
      }

      if (!invoked) {
        console.warn('No Edge Function invocation succeeded, falling back to direct insert.', lastError);
        const insertPayload = {
          user_id: userId || null,
          name: currentUserName || null,
          email: currentUserEmail || null,
          subject: reportSubject || 'Bug report',
          message: reportMessage || '',
          created_at: new Date().toISOString(),
        } as any;
        const { error: insertErr } = await supabase.from('reports' as any).insert(insertPayload);
        if (insertErr) {
          throw insertErr;
        }
      }

      // Show thank-you popup styled like delete confirmation modal
      setShowThanks(true);
    } catch (e) {
      console.error('Report send failed', e);
      Alert.alert(t('profileHeader.reportFailed') || 'Failed to send report');
    }
    // Defer closing and clearing until user acknowledges in the thank-you modal
  };

  const tabs = [
    { key: 'user-info', label: t('profileHeader.tabs.user-info'), icon: User2 },
    { key: 'created-outfits', label: t('profileHeader.tabs.created-outfits'), icon: BookOpen },
    { key: 'saved-outfits', label: t('profileHeader.tabs.saved-outfits'), icon: Heart },
  ];

  return (
    <>
      {/* Profile Header */}
      <View style={{ alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
        <View style={{ position: 'relative', marginBottom: 16 }}>
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                borderWidth: 2,
                borderColor: colors.border,
              }}
            />
          ) : (
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.border,
              }}
            >
              <User size={32} color={colors.white} />
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 24,
              height: 24,
              backgroundColor: colors.success,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          />
        </View>

        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
          {userName || t('profileHeader.anonymousUser')}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 16 }}>
          {t('profileHeader.defaultRole')}
        </Text>

        {isOwnProfile && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={onEditProfile}
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Edit3 size={16} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>
                {t('profileHeader.editProfile')}
              </Text>
            </Pressable>

            {/* Small circular bug report button */}
            <Pressable
              onPress={() => setShowReportModal(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bug size={18} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      {/* Report Modal */}
      <Modal visible={showReportModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Pressable onPress={() => setShowReportModal(false)} style={{ padding: 8 }}>
              <X size={24} color={colors.textMuted} />
            </Pressable>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('profileHeader.reportBug') || 'Report a bug'}</Text>
            <Pressable onPress={handleSendReport} style={{ padding: 8 }}>
              <Text style={{ color: colors.primary }}>{t('profileHeader.send') || 'Send'}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ color: colors.text, marginBottom: 8 }}>{t('profileHeader.reportSubject') || 'Subject'}</Text>
            <TextInput value={reportSubject} onChangeText={setReportSubject} placeholder={t('profileHeader.reportSubjectPlaceholder') || 'Short summary'} placeholderTextColor={colors.textMuted} style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, color: colors.text, marginBottom: 12 }} />

            <Text style={{ color: colors.text, marginBottom: 8 }}>{t('profileHeader.reportDescription') || 'Description'}</Text>
            <TextInput
              value={reportMessage}
              onChangeText={setReportMessage}
              placeholder={t('profileHeader.reportDescriptionPlaceholder') || 'Describe the issue...'}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
                textAlignVertical: 'top',
                minHeight: 180,
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Thank you popup - styled like delete confirmation modal with single OK button */}
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
                onPress={() => {
                  setShowThanks(false);
                  setShowReportModal(false);
                  setReportSubject('');
                  setReportMessage('');
                }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' }}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>{t('common.ok') || 'OK'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, paddingHorizontal: 24 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            flexDirection: 'row',
            borderRadius: 999,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {tabs.map(({ key, label, icon: Icon }) => (
            <Pressable
              key={key}
              onPress={() => onTabPress(key as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              {activeTab === key && (
                <ThemedGradient
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              )}
              <View style={{ zIndex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  size={16}
                  color={activeTab === key ? colors.white : colors.textMuted}
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginLeft: 8,
                    fontWeight: '500',
                    color: activeTab === key ? colors.white : colors.textMuted,
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}
