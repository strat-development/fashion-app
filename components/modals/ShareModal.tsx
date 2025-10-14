import { useTheme } from '@/providers/themeContext';
import { OutfitData } from '@/types/createOutfitTypes';
import { BlurView } from 'expo-blur';
import {
  Camera,
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Share as ShareIcon,
  Twitter,
  X,
} from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Clipboard,
  Linking,
  Modal,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  outfit: OutfitData | null;
  isAnimated?: boolean;
}

export const ShareModal = ({
  isVisible,
  onClose,
  outfit,
  isAnimated = true,
}: ShareModalProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!outfit) return null;

  const shareUrl = `https://fashion-app.com/outfit/${outfit.outfit_id}`;
  const shareText = t('shareModal.shareText', { outfitName: outfit.outfit_name || t('shareModal.untitledOutfit') });
  const fullShareText = `${shareText}\n\n${shareUrl}`;

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: fullShareText,
        url: shareUrl,
        title: outfit.outfit_name || t('shareModal.untitledOutfit'),
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch {
      Alert.alert(t('shareModal.alerts.shareError'), t('shareModal.alerts.shareError'));
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert(t('shareModal.alerts.copySuccess'), t('shareModal.alerts.copySuccess'));
      onClose();
    } catch {
      Alert.alert(t('shareModal.alerts.copyError'), t('shareModal.alerts.copyError'));
    }
  };

  const handleSocialShare = async (platform: string) => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'instagram':
        await handleCopyLink();
        Alert.alert(t('shareModal.alerts.instagramShare'), t('shareModal.alerts.instagramShare'));
        return;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(outfit.outfit_name || t('shareModal.untitledOutfit'))}&body=${encodeURIComponent(fullShareText)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(fullShareText)}`;
        break;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose();
      } else {
        Alert.alert(t('shareModal.alerts.platformError'), t('shareModal.alerts.platformError' + platform));
      }
    } catch {
      Alert.alert(t('shareModal.alerts.platformError'), t('shareModal.alerts.platformError' + platform));
    }
  };

  const shareOptions = [
    {
      id: 'native',
      label: t('shareModal.shareOptions.native'),
      icon: ShareIcon,
      color: '#3B82F6',
      onPress: handleNativeShare,
    },
    {
      id: 'copy',
      label: t('shareModal.shareOptions.copy'),
      icon: Copy,
      color: '#10B981',
      onPress: handleCopyLink,
    },
    {
      id: 'twitter',
      label: t('shareModal.shareOptions.twitter'),
      icon: Twitter,
      color: '#1DA1F2',
      onPress: () => handleSocialShare('twitter'),
    },
    {
      id: 'facebook',
      label: t('shareModal.shareOptions.facebook'),
      icon: Facebook,
      color: '#1877F2',
      onPress: () => handleSocialShare('facebook'),
    },
    {
      id: 'instagram',
      label: t('shareModal.shareOptions.instagram'),
      icon: Camera,
      color: '#E4405F',
      onPress: () => handleSocialShare('instagram'),
    },
    {
      id: 'email',
      label: t('shareModal.shareOptions.email'),
      icon: Mail,
      color: '#6B7280',
      onPress: () => handleSocialShare('email'),
    },
    {
      id: 'sms',
      label: t('shareModal.shareOptions.sms'),
      icon: MessageCircle,
      color: '#10B981',
      onPress: () => handleSocialShare('sms'),
    },
    {
      id: 'more',
      label: t('shareModal.shareOptions.more'),
      icon: MoreHorizontal,
      color: '#9CA3AF',
      onPress: handleNativeShare,
    },
  ];

  return (
    <Modal
      visible={isVisible}
      animationType={isAnimated ? 'none' : 'none'}
      transparent={true}
    >
      <View className="flex-1 justify-end">
        <BlurView
          intensity={40}
          tint={colors.background === '#121212' ? 'dark' : 'light'}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="rounded-t-3xl border-t"
          style={{ backgroundColor: colors.background,
            borderColor: colors.border
           }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>{t('shareModal.title')}</Text>
            <Pressable onPress={onClose}>
              <X size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Share Options */}
          <View className="px-5 py-4">
            <View className="flex-row flex-wrap justify-between">
              {shareOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={option.onPress}
                  className="items-center mb-3 w-16"
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mb-1.5"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <option.icon size={20} color={option.color} />
                  </View>
                  <Text className="text-xs text-center font-medium" numberOfLines={1} style={{ color: colors.textSecondary }}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Cancel Button */}
          <View className="px-5 pb-6">
            <Pressable
              onPress={onClose}
              className="py-3 rounded-xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <Text className="font-medium text-center" style={{ color: colors.text }}>
                {t('shareModal.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};