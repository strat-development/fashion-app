import { formatDate } from "@/helpers/helpers";
import { Database } from "@/types/supabase";
import { Json } from "@/types/supabase";
import { Calendar, Tag, User } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

type UserData = {
  nickname?: string | null;
  user_avatar?: string | null;
};

type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

interface OutfitDetailInfoProps {
  outfit: OutfitData;
  userData: UserData | undefined;
  tags: (Json | string)[];
}

export default function OutfitDetailInfo({ outfit, userData, tags }: OutfitDetailInfoProps) {
  return (
    <>
      {/* Creator Info */}
      <View className="flex-row items-center mb-4">
        {userData?.user_avatar ? (
          <Image 
            source={{ uri: userData.user_avatar }} 
            className="w-12 h-12 rounded-full mr-3" 
          />
        ) : (
          <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-3">
            <User size={20} color="#FFFFFF" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            {userData?.nickname || 'Anonymous'}
          </Text>
          <View className="flex-row items-center">
            <Calendar size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm ml-1">
              {formatDate(outfit.created_at || "")}
            </Text>
          </View>
        </View>
      </View>

      {/* Outfit Title */}
      {outfit.outfit_name && (
        <Text className="text-white text-2xl font-bold mb-4">
          {outfit.outfit_name}
        </Text>
      )}
    </>
  );
}
