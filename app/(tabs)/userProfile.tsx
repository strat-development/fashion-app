import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { FollowButton } from '@/components/dashboard/FollowButton';
import { ProfileHeader } from '@/components/dashboard/ProfileHeader';
import { ProfileUserInfoContent } from '@/components/dashboard/ProfileUserInfoContent';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { PendingRequestsModal } from '@/components/modals/PendingRequestsModal';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { useFetchPendingFollowersDetailed } from '@/fetchers/fetchIsFollowed';
import { useFetchUser } from '@/fetchers/fetchUser';
import { useAcceptFollowerMutation } from '@/mutations/AcceptFollower';
import { useUnFollowUserMutation } from '@/mutations/UnfollowUserMutation';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { useRouter } from 'expo-router';
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
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const { colors } = useTheme();
  const { data: userData, isLoading } = useFetchUser(profileId);
  const { data: pendingFollowers = [], refetch: refetchPending } = useFetchPendingFollowersDetailed(profileId);
  const { mutate: acceptFollower } = useAcceptFollowerMutation();
  const { mutate: declineFollower } = useUnFollowUserMutation();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading || !userData) {
    return <FullScreenLoader message={t('userProfile.loading')} />;
  }
  const router = useRouter();

  const { full_name, bio, user_avatar, email, socials, user_id, is_public } = userData;

  if (!isOwnProfile && is_public === false) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 32, paddingBottom: 80 }}>
          <View style={{ position: 'relative' }}>
            <ProfileHeader
            userImage={user_avatar}
            userName={full_name}
            isOwnProfile={isOwnProfile}
            activeTab={''}
            onTabPress={() => {}}
            onEditProfile={() => {}}
            />
            {!isOwnProfile && pendingFollowers.length > 0 && (
              <View style={{ position: 'absolute', top: 8, right: 24 }}>
                <NotificationBell count={pendingFollowers.length} onPress={() => setShowRequestsModal(true)} />
              </View>
            )}
          </View>
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {t('userProfile.about')}
            </Text>
            <Text style={{ color: colors.text, fontSize: 16, marginBottom: 16 }}>{bio}</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 24 }} />
            <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginTop: 32 }}>
              {t('userProfile.privateProfile')}
            </Text>
            <FollowButton profileId={profileId} isPublic={is_public} />
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {activeTab === 'user-info' ? (
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={{ paddingTop: 32, paddingBottom: 80 }}>
              <View style={{ position: 'relative' }}>
                <ProfileHeader
                userImage={user_avatar}
                userName={full_name}
                isOwnProfile={isOwnProfile}
                activeTab={activeTab}
                onTabPress={setActiveTab}
                onEditProfile={() => setShowEditModal(true)}
                />
                {isOwnProfile && pendingFollowers.length > 0 && (
                  <View style={{ position: 'absolute', top: 8, right: 24 }}>
                    <NotificationBell count={pendingFollowers.length} onPress={() => setShowRequestsModal(true)} />
                  </View>
                )}
              </View>
              {renderTabContent()}
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingTop: 32 }}>
            <View style={{ position: 'relative' }}>
              <ProfileHeader
              userImage={user_avatar}
              userName={full_name}
              isOwnProfile={isOwnProfile}
              activeTab={activeTab}
              onTabPress={setActiveTab}
              onEditProfile={() => setShowEditModal(true)}
              />
              {isOwnProfile && pendingFollowers.length > 0 && (
                <View style={{ position: 'absolute', top: 8, right: 24 }}>
                  <NotificationBell count={pendingFollowers.length} onPress={() => setShowRequestsModal(true)} />
                </View>
              )}
            </View>
            {renderTabContent()}
          </View>
        )}
      </View>

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

      <PendingRequestsModal
        visible={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        requests={pendingFollowers}
        onApprove={(followerId) => acceptFollower({ followerId, followedAccountId: profileId })}
        onDecline={(followerId) => declineFollower({ userId: followerId, followedAccountId: profileId })}
      />
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