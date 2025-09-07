import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { ProfileUserInfoContent } from '@/components/dashboard/ProfileUserInfoContent';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface Notification {
  id: string;
  type: 'like' | 'follow_request';
  message: string;
  createdAt: string;
  userId: string;
}

interface UserProfileProps {
  isOwnProfile?: boolean;
}

export default function UserProfile({ isOwnProfile = true }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { colors } = useTheme();
  const { userName, userBio, userImage, userEmail, userSocials, userId } = useUserContext();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <ProfileUserInfoContent
            bio={userBio}
            userId={userId}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'created-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      default:
        return null;
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
            userImage={userImage}
            userName={userName}
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
            name: userName,
            bio: userBio,
            avatar: userImage,
            email: userEmail,
            socials: userSocials,
          }}
        />
      )}
    </>
  );
}
