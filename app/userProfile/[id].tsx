import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ReportModal } from '@/components/modals/ReportModal';
import { useFetchIsFollowed } from '@/fetchers/fetchIsFollowed';
import { useFetchUser } from '@/fetchers/fetchUser';
import { useFollowUserMutation } from '@/mutations/FollowUserMutation';
import { useUnFollowUserMutation } from '@/mutations/UnfollowUserMutation';
import { useUserContext } from '@/providers/userContext';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Heart, Plus, Trophy, User, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const isOwnProfile = !id || id === userId;
  const profileId = isOwnProfile ? userId : id;
  const { data: userData, isLoading: userLoading, error: userError } = useFetchUser(profileId || '');
  const { data: followStatus, isLoading: followLoading } = useFetchIsFollowed(userId || '', profileId || '');
  const isFollowed = followStatus?.isFollowed || false;
  const isPending = followStatus?.isPending || false;
  const { mutate: followUser } = useFollowUserMutation();
  const { mutate: unFollowUser } = useUnFollowUserMutation();
  const navigation = useNavigation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTransparent: true,
      headerBackground: () => (
        <BlurView
          style={{
            flex: 1,
          }}
          tint="dark"
        />
      ),
      headerTintColor: '#FFFFFF',
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              router.push('/');
            }
          }}
          className="flex-row items-center p-2"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
      ),
      headerRight: () => (
        <ReportModal userId={profileId || ''} />
      ),
      headerBackTitleVisible: false,
    });
  }, [navigation, router]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (userLoading || followLoading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Loading profile...</Text>
      </View>
    );
  }

  if (userError || !userData) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Failed to load profile</Text>
      </View>
    );
  }

  const showPrivateMessage = userData?.is_public === false && !isOwnProfile && !isFollowed; 

  const renderFollowButton = () => {
    if (isOwnProfile) return null;

    if (isPending) {
      return (
        <Pressable
          disabled={true}
          className="bg-gray-600 py-4 rounded-lg mt-4 w-full opacity-50"
        >
          <Text className="text-gray-300 font-medium text-sm text-center">Follow Request Pending</Text>
        </Pressable>
      );
    }

    return isFollowed ? (
      <Pressable
        onPress={() => {
          if (profileId) {
            unFollowUser({ followedAccountId: profileId, userId: userId || '' });
          } else {
            console.error('profileId is null');
          }
        }}
        className="bg-gray-800 py-4 rounded-lg mt-4 w-full"
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-300 font-semibold">Unfollow</Text>
        </View>
      </Pressable>
    ) : (
      <Pressable
        onPress={() => {
          if (profileId) {
            followUser({ followedAccountId: profileId, userId: userId || '' });
          } else {
            console.error('profileId is null');
          }
        }}
        className="bg-gray-800 py-4 rounded-lg mt-4 w-full"
      >
        <Text className="text-gray-300 font-medium text-sm text-center">Follow</Text>
      </Pressable>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="space-y-4">
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800/50">
              <Text className="text-white text-base font-medium mb-3">Bio</Text>
              <Text className="text-gray-300 text-sm leading-5">
                {userData.bio || "No bio available yet. Add one by editing your profile!"}
              </Text>
            </View>
            {profileId && <UserStatistics userId={profileId} />}
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800/50">
              <Text className="text-white text-base font-medium mb-4">Recent Activity</Text>
              <View className="space-y-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3">
                    <Trophy size={14} color="#22C55E" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Your outfit got 50+ likes!</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-pink-500/20 rounded-full items-center justify-center mr-3">
                    <Heart size={14} color="#EC4899" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Liked 5 new outfits</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                    <Plus size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Created "Summer Casual Look"</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'created-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} profileId={profileId || ""} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} profileId={profileId || ""} />;
      default:
        return null;
    }
  };

  if (showPrivateMessage) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 mt-24">
        <View className="items-center justify-center px-6">
          <Image
            source={{ uri: userData.user_avatar || 'https://via.placeholder.com/120' }}
            className="w-32 h-32 rounded-full border-2 border-gray-600 mb-6"
            style={{ width: 128, height: 128, borderRadius: 64 }}
          />
          <Text className="text-white text-2xl font-bold mb-2">
            {userData.nickname || userData.full_name || 'User'}
          </Text>
          <Text className="text-gray-400 text-lg mb-8">
            @{userData.nickname || userData.full_name || 'username'}
          </Text>
          <View className="bg-gray-800/80 backdrop-blur-xl rounded-xl py-4 border border-gray-700/50">
            <View className="flex-row items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-400 mr-2" />
              <Text className="text-gray-300 text-lg font-semibold">Private Account</Text>
            </View>
            <Text className="text-gray-500 text-center text-base">
              This account is private. Only approved followers can see their content.
            </Text>
          </View>
          {renderFollowButton()}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-black to-gray-900 mt-8"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 pt-8 pb-20">
        <View className="items-center mb-8">
          <View className="relative mb-4">
            {userData.user_avatar ? (
              <Image
                source={{ uri: userData.user_avatar }}
                className="w-28 h-28 rounded-full border-2 border-gray-700"
              />
            ) : (
              <View className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center border-2 border-gray-700">
                <User size={32} color="#FFFFFF" />
              </View>
            )}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
          </View>
          <Text className="text-white text-2xl font-bold mb-1">{userData.nickname || "Anonymous User"}</Text>
          <Text className="text-gray-400 text-sm mb-4">Fashion Enthusiast</Text>
          {renderFollowButton()}
        </View>
        <View className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-2 mb-6 border border-gray-800/50">
          <View className="flex-row">
            {[
              { key: 'user-info', label: 'Profile', icon: User2 },
              { key: 'created-outfits', label: 'Created', icon: BookOpen },
              { key: 'saved-outfits', label: 'Saved', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabType)}
                className={`flex-1 items-center py-3 rounded-xl ${activeTab === key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-transparent'
                  }`}
              >
                <Icon
                  size={20}
                  color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
                />
                <Text
                  className={`text-xs mt-2 font-medium ${activeTab === key ? 'text-white' : 'text-gray-400'
                    }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {renderTabContent()}
      </View>
    </ScrollView>
  );
}