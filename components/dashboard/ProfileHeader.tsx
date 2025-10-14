import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { Image } from 'expo-image';
import { BookOpen, Edit3, Heart, User, User2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

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
  const { colors } = useTheme();

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
        )}
      </View>

      {/* Tab Navigation */}
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