import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ReportModal } from '@/components/modals/ReportModal';
import { useFetchUser } from '@/fetchers/fetchUser';
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
  const { data: userData, isLoading, error } = useFetchUser(profileId || '');
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Loading profile...</Text>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Failed to load profile</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="space-y-4">
            {/* Bio Section */}
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800/50">
              <Text className="text-white text-base font-medium mb-3">Bio</Text>
              <Text className="text-gray-300 text-sm leading-5">
                {userData.bio || "No bio available yet. Add one by editing your profile!"}
              </Text>
            </View>

            {/* Statistics */}
            <UserStatistics />

            {/* Recent Activity */}
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

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-b from-black to-gray-900 mt-8"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 pt-8 pb-20">
        {/* Profile Header */}
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
            {/* Online indicator */}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
          </View>

          <Text className="text-white text-2xl font-bold mb-1">{userData.nickname || "Anonymous User"}</Text>
          <Text className="text-gray-400 text-sm mb-4">Fashion Enthusiast</Text>
        </View>

        {/* Tab Navigation */}
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

        {/* Tab Content */}
        {renderTabContent()}
      </View>
    </ScrollView>
  );
}