import { useTheme } from '@/providers/themeContext';
import React from 'react';
import { View } from 'react-native';
import { ProfileBioSection } from './ProfileBioSection';
import { ProfileRecentActivitySection } from './ProfileRecentActivitySection';
import { ProfileSettingsButtons } from './ProfileSettingsButtons';
import { UserStatistics } from './UserStatistics';

interface ProfileUserInfoContentProps {
  bio: string | null;
  userId: string | null;
  isOwnProfile: boolean;
}

export function ProfileUserInfoContent({
  bio,
  userId,
  isOwnProfile,
}: ProfileUserInfoContentProps) {
  const { colors } = useTheme();
  return (
    <View className="mt-6 space-y-6 px-6">
      <ProfileBioSection bio={bio} />

      <View
        style={{
          paddingBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 24,
        }}
      >
        {userId && <UserStatistics userId={userId} />}
      </View>

      <ProfileRecentActivitySection />

      {isOwnProfile && <ProfileSettingsButtons />}
    </View>
  );
}
