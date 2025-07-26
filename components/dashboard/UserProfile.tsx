import { Edit3, Heart, Plus, Trophy, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface UserStats {
  createdOutfits: number;
  savedOutfits: number;
  totalLikes: number;
  followers: number;
  following?: number;
}

interface UserProfileProps {
  userName?: string;
  userBio?: string;
  userImage?: string;
  stats: UserStats;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userName = "Your Profile",
  userBio = "Passionate about fashion and style. Love creating unique outfit combinations and exploring new trends. Always looking for inspiration! ✨",
  stats,
  isOwnProfile = true,
  onEditProfile
}) => {
  return (
    <ScrollView className="flex-1 px-4">
      <View className="pt-6 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mb-4">
            <User size={40} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold">{userName}</Text>
          <Text className="text-white/60 text-base mt-1">Fashion Enthusiast</Text>
          
          {isOwnProfile && (
            <Pressable 
              onPress={onEditProfile}
              className="bg-white/10 px-6 py-3 rounded-full mt-4 flex-row items-center"
            >
              <Edit3 size={16} color="white" />
              <Text className="text-white font-medium ml-2">Edit Profile</Text>
            </Pressable>
          )}
        </View>

        {/* Bio Section */}
        <View className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-lg font-semibold mb-3">Bio</Text>
          <Text className="text-white/80 text-base leading-6">
            {userBio}
          </Text>
        </View>

        {/* Stats */}
        <View className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-lg font-semibold mb-4">Statistics</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{stats.createdOutfits}</Text>
              <Text className="text-white/60 text-sm">Created</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{stats.savedOutfits}</Text>
              <Text className="text-white/60 text-sm">Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{stats.totalLikes}</Text>
              <Text className="text-white/60 text-sm">Likes</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{stats.followers}</Text>
              <Text className="text-white/60 text-sm">Followers</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <Text className="text-white text-lg font-semibold mb-4">Recent Activity</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Trophy size={20} color="#FFD700" />
              <Text className="text-white/80 ml-3">Your outfit got 50+ likes!</Text>
            </View>
            <View className="flex-row items-center">
              <Heart size={20} color="#FF4458" />
              <Text className="text-white/80 ml-3">Liked 5 new outfits</Text>
            </View>
            <View className="flex-row items-center">
              <Plus size={20} color="#4ECDC4" />
              <Text className="text-white/80 ml-3">Created "Summer Casual Look"</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
