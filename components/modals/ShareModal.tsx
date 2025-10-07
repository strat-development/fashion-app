import { OutfitData } from '@/types/createOutfitTypes';
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
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/themeContext';

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
    } catch (error) {
      Alert.alert(t('shareModal.alerts.shareError.title'), t('shareModal.alerts.shareError.message'));
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert(t('shareModal.alerts.copySuccess.title'), t('shareModal.alerts.copySuccess.message'));
      onClose();
    } catch (error) {
      Alert.alert(t('shareModal.alerts.copyError.title'), t('shareModal.alerts.copyError.message'));
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
        Alert.alert(t('shareModal.alerts.instagramShare.title'), t('shareModal.alerts.instagramShare.message'));
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
        Alert.alert(t('shareModal.alerts.platformError.title'), t('shareModal.alerts.platformError.message' + platform));
      }
    } catch (error) {
      Alert.alert(t('shareModal.alerts.platformError.title'), t('shareModal.alerts.platformError.message' + platform));
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
      <View className="flex-1 justify-end bg-black/0 backdrop-blur-sm">
        <View className="rounded-t-3xl border-t"
          style={{ backgroundColor: colors.background,
            borderColor: colors.border
           }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: colors.border }}>
            <Text className="text-xl font-semibold" style={{ color: colors.text }}>{t('shareModal.title')}</Text>
            <Pressable onPress={onClose}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Outfit Preview */}
          <View className="px-6 py-4 border-b"
            style={{ borderColor: colors.border }}>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl mr-4"
                style={{ backgroundColor: colors.surface }} />
              <View className="flex-1">
                <Text className="font-medium text-lg" numberOfLines={1} style={{ color: colors.text }}>{outfit.outfit_name || t('shareModal.untitledOutfit')}</Text>
                <Text className="text-sm" numberOfLines={1} style={{ color: colors.textSecondary }}>{outfit.description || t('shareModal.defaultDescription')}</Text>
              </View>
            </View>
          </View>

          {/* Share Options */}
          <View className="px-6 py-6">
            <View className="flex-row flex-wrap justify-between">
              {shareOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={option.onPress}
                  className="items-center mb-6 w-20"
                >
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <option.icon size={24} color={option.color} />
                  </View>
                  <Text className="text-gray-300 text-xs text-center font-medium">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Cancel Button */}
          <View className="px-6 pb-8">
            <Pressable
              onPress={onClose}
              className="py-4 rounded-2xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <Text className="text-white font-medium text-center text-lg">
                {t('shareModal.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};