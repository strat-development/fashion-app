import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { BookOpen, Edit3, Heart, LogOut, Plus, Trophy, User, User2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface UserProfileProps {
  isOwnProfile?: boolean;
}

export default function UserProfile({
  isOwnProfile = true
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    userName,
    userBio,
    userImage,
    userEmail,
    userSocials,
    userId,
  } = useUserContext();

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="mt-6 space-y-6 px-6">
            {/* Bio Section */}
            <View className="pb-6 border-b border-gray-800/50">
              <Text className="text-white text-lg font-semibold mb-3">About</Text>
              <Text className="text-gray-300 text-base leading-6">
                {userBio || "No bio available yet. Add one by editing your profile!"}
              </Text>
            </View>

            {/* Statistics */}
            <View className="pb-6 border-b border-gray-800/50">
              {userId && <UserStatistics userId={userId} />}
            </View>

            {/* Recent Activity */}
            <View className="pb-6">
              <Text className="text-white text-lg font-semibold mb-4">Recent Activity</Text>
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
                  <View className="w-8 h-8 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                    <Plus size={14} color="#A855F7" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Created "Summer Casual Look"</Text>
                </View>
              </View>
            </View>

            {/* Logout Button */}
            {isOwnProfile && (
              <Pressable
                onPress={handleLogout}
                className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 flex-row items-center justify-center mt-4"
              >
                <LogOut size={18} color="#EF4444" />
                <Text className="text-red-400 font-medium ml-2">Logout</Text>
              </Pressable>
            )}
          </View>
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
    <ScrollView
      className="flex-1 bg-black"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="pt-8 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-8 px-6">
          <View className="relative mb-4">
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                className="w-28 h-28 rounded-full border-2 border-gray-600"
              />
            ) : (
              <View className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center border-2 border-gray-600">
                <User size={32} color="#FFFFFF" />
              </View>
            )}
            {/* Online indicator */}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black" />
          </View>

          <Text className="text-white text-2xl font-bold mb-1">{userName || "Anonymous User"}</Text>
          <Text className="text-gray-400 text-sm mb-4">Fashion Enthusiast</Text>

          {isOwnProfile && (
            <Pressable
              onPress={handleEditProfile}
              style={{ backgroundColor: '#1f1f1fcc' }}
              className="px-6 py-3 rounded-full flex-row items-center border border-gray-600/60"
            >
              <Edit3 size={16} color="#FFFFFF" />
              <Text className="text-white font-medium ml-2">Edit Profile</Text>
            </Pressable>
          )}
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-center mb-8 px-6">
          <View style={{ backgroundColor: '#1f1f1fcc' }} className="flex-row rounded-full p-1">
            {[
              { key: 'user-info', label: 'Profile', icon: User2 },
              { key: 'created-outfits', label: 'Created', icon: BookOpen },
              { key: 'saved-outfits', label: 'Saved', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabType)}
                className={`flex-row items-center px-4 py-2 rounded-full ${activeTab === key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-transparent'
                  }`}
              >
                <Icon
                  size={16}
                  color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
                />
                <Text
                  className={`text-sm ml-2 font-medium ${activeTab === key ? 'text-white' : 'text-gray-400'
                    }`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>

      {/* Profile Edit Modal */}
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
    </ScrollView>
  );
};
