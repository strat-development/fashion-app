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
  if (!outfit) return null;

  const shareUrl = `https://fashion-app.com/outfit/${outfit.outfit_id}`;
  const shareText = `Check out this amazing outfit: "${outfit.outfit_name}" on Fashion App!`;
  const fullShareText = `${shareText}\n\n${shareUrl}`;

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: fullShareText,
        url: shareUrl,
        title: outfit.outfit_name || 'Fashion Outfit',
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share this outfit');
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert('Success', 'Link copied to clipboard!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
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
        Alert.alert(
          'Instagram Share',
          'Link copied! You can now paste it in your Instagram story or post.'
        );
        return;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(outfit.outfit_name || 'Fashion Outfit')}&body=${encodeURIComponent(fullShareText)}`;
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
        Alert.alert('Error', `Cannot open ${platform}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${platform}`);
    }
  };

  const shareOptions = [
    {
      id: 'native',
      label: 'Share...',
      icon: ShareIcon,
      color: '#3B82F6',
      onPress: handleNativeShare,
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: Copy,
      color: '#10B981',
      onPress: handleCopyLink,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      onPress: () => handleSocialShare('twitter'),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      onPress: () => handleSocialShare('facebook'),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: Camera,
      color: '#E4405F',
      onPress: () => handleSocialShare('instagram'),
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: '#6B7280',
      onPress: () => handleSocialShare('email'),
    },
    {
      id: 'sms',
      label: 'Message',
      icon: MessageCircle,
      color: '#10B981',
      onPress: () => handleSocialShare('sms'),
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      color: '#9CA3AF',
      onPress: handleNativeShare,
    },
  ];

  return (
    <Modal
      visible={isVisible}
      animationType={isAnimated ? 'slide' : 'none'}
      transparent={true}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-gray-900 rounded-t-3xl border-t border-gray-700">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            <Text className="text-white text-xl font-semibold">Share Outfit</Text>
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Outfit Preview */}
          <View className="px-6 py-4 border-b border-gray-800">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mr-4" />
              <View className="flex-1">
                <Text className="text-white font-medium text-lg" numberOfLines={1}>
                  {outfit.outfit_name || 'Untitled Outfit'}
                </Text>
                <Text className="text-gray-400 text-sm" numberOfLines={1}>
                  {outfit.description || 'Fashion outfit to share'}
                </Text>
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
              className="bg-gray-800 py-4 rounded-2xl border border-gray-700"
            >
              <Text className="text-white font-medium text-center text-lg">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
