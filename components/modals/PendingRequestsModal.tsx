import { PendingFollowerDetailed } from '@/fetchers/fetchIsFollowed';
import { RedGradient, ThemedGradient, useTheme } from '@/providers/themeContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

interface PendingRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  requests: PendingFollowerDetailed[];
  onApprove: (followerId: string) => void;
  onDecline: (followerId: string) => void;
}

export function PendingRequestsModal({ visible, onClose, requests, onApprove, onDecline }: PendingRequestsModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} visible={visible}>
      <View style={{ flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '86%', borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            {t('userProfile.pendingRequests')}
          </Text>
          {requests.length === 0 ? (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('userProfile.noPendingRequests')}</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {requests.map((req) => (
                <View key={req.user_id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pressable
                    onPress={() => {
                      router.push({ pathname: '/userProfile/[id]', params: { id: req.user_id } });
                      onClose();
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  >
                    <Image
                      source={req.user_avatar ? { uri: req.user_avatar } : undefined}
                      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant }}
                    />
                    <Text style={{ color: colors.text, fontSize: 14 }}>{req.nickname || req.user_id}</Text>
                  </Pressable>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <ThemedGradient style={{ borderRadius: 10 }}>
                      <Pressable
                        onPress={() => onApprove(req.user_id)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.white, fontWeight: '600' }}>{t('common.approve')}</Text>
                      </Pressable>
                    </ThemedGradient>
                    <RedGradient style={{ borderRadius: 10 }}>
                      <Pressable
                        onPress={() => onDecline(req.user_id)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.white, fontWeight: '600' }}>{t('common.decline')}</Text>
                      </Pressable>
                    </RedGradient>
                  </View>
                </View>
              ))}
            </View>
          )}
          <Pressable onPress={onClose} style={{ marginTop: 16, alignSelf: 'center' }}>
            <Text style={{ color: colors.text }}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}


