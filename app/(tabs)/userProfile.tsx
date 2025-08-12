import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { BookOpen, Edit3, Heart, LogOut, Plus, Trophy, User, User2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

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
  } = useUserContext();

  const handleEditProfile = () => {
    console.log('Edit profile pressed - opening modal');
    setShowEditModal(true);
  };

  const handleLogout = () => {
    console.log('Logout button pressed');
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Logout cancelled'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed logout');
            try {
              console.log('Starting logout process...');
              const { error } = await supabase.auth.signOut();
              
              if (error) {
                console.error('Supabase logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
                return;
              }
              
              console.log('Logout successful');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'An unexpected error occurred during logout.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="mt-6 space-y-5">
            {/* Bio Section */}
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800/50">
              <Text className="text-white text-base font-medium mb-3">Bio</Text>
              <Text className="text-gray-300 text-sm leading-5">
                {userBio || "No bio available yet. Add one by editing your profile!"}
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
        return <CreatedOutfitsSection refreshing={refreshing} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gradient-to-b from-black to-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 pt-8 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="relative mb-4">
            {userImage ? (
              <Image 
                source={{ uri: userImage }} 
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
          
          <Text className="text-white text-2xl font-bold mb-1">{userName || "Anonymous User"}</Text>
          <Text className="text-gray-400 text-sm mb-4">Fashion Enthusiast</Text>

          {isOwnProfile && (
            <Pressable
              onPress={handleEditProfile}
              className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-3 rounded-full flex-row items-center border border-gray-600/50"
            >
              <Edit3 size={16} color="#FFFFFF" />
              <Text className="text-white font-medium ml-2">Edit Profile</Text>
            </Pressable>
          )}
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
                className={`flex-1 items-center py-3 rounded-xl ${
                  activeTab === key 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  size={20}
                  color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
                />
                <Text
                  className={`text-xs mt-2 font-medium ${
                    activeTab === key ? 'text-white' : 'text-gray-400'
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
