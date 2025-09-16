import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { ProfileUserInfoContent } from '@/components/dashboard/ProfileUserInfoContent';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { useFetchUser } from '@/fetchers/fetchUser';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface UserProfileProps {
  isOwnProfile?: boolean;
  profileId: string;
}

export function UserProfile({ isOwnProfile = true, profileId }: UserProfileProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { colors } = useTheme();
  const { data: userData, isLoading } = useFetchUser(profileId);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading || !userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text>{t('userProfile.loading')}</Text>
      </View>
    );
  }

  const { full_name, bio, user_avatar, email, socials, user_id, is_public } = userData;

  if (!isOwnProfile && is_public === false) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 32, paddingBottom: 80 }}>
          <ProfileHeader
            userImage={user_avatar}
            userName={full_name}
            isOwnProfile={isOwnProfile}
            activeTab={''}
            onTabPress={() => {}}
            onEditProfile={() => {}}
          />
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {t('userProfile.about')}
            </Text>
            <Text style={{ color: colors.text, fontSize: 16, marginBottom: 16 }}>{bio}</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 24 }} />
            <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginTop: 32 }}>
              {t('userProfile.privateProfile')}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <ProfileUserInfoContent
            bio={bio}
            userId={user_id}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'created-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} profileId={user_id || ''} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} profileId={user_id || ''} />;
      default:
        return (
          <ProfileUserInfoContent
            bio={bio}
            userId={user_id}
            isOwnProfile={isOwnProfile}
          />
        );
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ paddingTop: 32, paddingBottom: 80 }}>
          <ProfileHeader
            userImage={user_avatar}
            userName={full_name}
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            onEditProfile={() => setShowEditModal(true)}
          />
          {renderTabContent()}
        </View>
      </ScrollView>

      {showEditModal && (
        <ProfileEdit
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentUserData={{
            name: full_name ?? undefined,
            bio: bio ?? undefined,
            avatar: user_avatar ?? undefined,
            email: email ?? undefined,
            socials: Array.isArray(socials) ? socials.map(s => typeof s === 'string' ? s : '').filter(Boolean) : [],
          }}
        />
      )}
    </>
  );
}

export default function TabUserProfile() {
  const { userId } = useUserContext();
  
  if (!userId) {
    return null;
  }

  return <UserProfile isOwnProfile={true} profileId={userId} />;
}