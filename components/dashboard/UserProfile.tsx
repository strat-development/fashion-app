import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { Edit3, Heart, Plus, Trophy, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { UserStatistics } from './UserStatistics';

interface UserProfileProps {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const UserProfile = ({
  isOwnProfile = true,
  onEditProfile
}: UserProfileProps) => {
  const {
    userName,
    userBio,
    userImage,
    userJoinedAt,
    userSocials,
    userEmail
  } = useUserContext();

  return (
    <ScrollView className="flex-1 px-6">
      <View className="pt-8 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-gray-700 rounded-full items-center justify-center mb-4">
            {userImage && (
              <Image source={{ uri: userImage }} className="w-full h-full rounded-full" />
            ) || (
                <User size={40} color="#9CA3AF" />
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

        {/* Bio Section */}
        <View className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 mb-5 border border-gray-800">
          <Text className="text-white text-base font-medium mb-3">Bio</Text>
          <Text className="text-gray-300 text-sm leading-5">
            {userBio}
          </Text>
        </View>

        {/* Stats */}

        {/* <Text className="text-white text-base font-medium mb-4">Statistics</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-xl font-semibold">{stats.createdOutfits}</Text>
              <Text className="text-gray-400 text-xs">Created</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-semibold">{stats.savedOutfits}</Text>
              <Text className="text-gray-400 text-xs">Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-semibold">{stats.totalLikes}</Text>
              <Text className="text-gray-400 text-xs">Likes</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-semibold">{stats.followers}</Text>
              <Text className="text-gray-400 text-xs">Followers</Text>
            </View>
          </View> */}
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
    </ScrollView>
  );
};
