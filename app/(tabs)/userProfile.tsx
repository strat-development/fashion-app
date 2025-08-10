import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { BookOpen, Edit3, Heart, Plus, Trophy, User, User2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface UserProfileProps {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export default function UserProfile({
  isOwnProfile = true,
  onEditProfile
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);

  const {
    userName,
    userBio,
    userImage,
  } = useUserContext();

  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl mt-8 p-4 mb-6 border border-gray-800">

            <Button onPress={handleLogout}>
              <Text className="text-white text-base font-medium">Logout</Text>
            </Button>

            <View className="flex-col items-start mb-4">
              <Text className="text-white text-base font-medium mb-3">Bio</Text>
              <Text className="text-gray-300 text-sm leading-5">
                {userBio}
              </Text>
            </View>

            <UserStatistics />

            {/* Recent Activity */}
            <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800">
              <Text className="text-white text-base font-medium mb-4">Recent Activity</Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Trophy size={16} color="#9CA3AF" />
                  <Text className="text-gray-300 ml-3 text-sm">Your outfit got 50+ likes!</Text>
                </View>
                <View className="flex-row items-center">
                  <Heart size={16} color="#9CA3AF" />
                  <Text className="text-gray-300 ml-3 text-sm">Liked 5 new outfits</Text>
                </View>
                <View className="flex-row items-center">
                  <Plus size={16} color="#9CA3AF" />
                  <Text className="text-gray-300 ml-3 text-sm">Created "Summer Casual Look"</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'created-outfits':
        return <SavedOutfitsSection refreshing={refreshing} />;
      case 'saved-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1 px-6 bg-gradient-to-b from-black to-gray-900">
      <View className="pt-8 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-gray-700 rounded-full items-center justify-center mb-4">
            {userImage && (
              <Image source={{ uri: userImage }} className="w-full h-full rounded-full" />
            ) || (
                <View className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-3">
                  <User size={24} color="#FFFFFF" />
                </View>
              )}
          </View>
          <Text className="text-white text-xl font-medium">{userName}</Text>
          <Text className="text-gray-400 text-sm mt-1">Fashion Enthusiast</Text>

          {isOwnProfile && (
            <Pressable
              onPress={onEditProfile}
              className="bg-gray-800 px-4 py-2 rounded-lg mt-4 flex-row items-center"
            >
              <Edit3 size={14} color="#9CA3AF" />
              <Text className="text-gray-300 font-medium ml-2 text-sm">Edit Profile</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row w-fit gap-12">
        {[
          { key: 'user-info', label: 'User', icon: User2 },
          { key: 'created-outfits', label: 'Created', icon: BookOpen },
          { key: 'saved-outfits', label: 'Saved', icon: Heart },
        ].map(({ key, label, icon: Icon }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key as TabType)}
            className={`flex-1 items-center py-3 rounded-full`}
          >
            <Icon
              size={18}
              color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
            />
            <Text
              className={`text-xs mt-1 font-medium ${activeTab === key ? 'text-white' : 'text-gray-400'}`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {renderTabContent()}
    </ScrollView>
  );
};
