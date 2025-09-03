import { formatDate } from "@/helpers/helpers";
import { Database } from "@/types/supabase";
import { Json } from "@/types/supabase";
import { Calendar, Tag, User } from "lucide-react-native";
import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";

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
  const { width } = useWindowDimensions();
  const scale = Math.min(1.25, Math.max(0.85, width / 390));
  const titleSize = Math.round(22 * scale);
  const nameSize = Math.round(16 * scale);
  const metaSize = Math.max(12, Math.round(13 * scale));

  return (
    <>
      {/* Header Card */}
      <View className="bg-gray-800/40 rounded-2xl p-4 mb-4 border border-white/5">
        {/* Creator Info */}
        <View className="flex-row items-center mb-3">
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
            <Text className="text-white font-semibold" style={{ fontSize: nameSize }}>
              {userData?.nickname || "Anonymous"}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Calendar size={14} color="#9CA3AF" />
              <Text className="text-gray-400 ml-1" style={{ fontSize: metaSize }}>
                {formatDate(outfit.created_at || "")}
              </Text>
            </View>
          </View>
        </View>

        {/* Outfit Title */}
        {outfit.outfit_name && (
          <Text
            className="text-white font-bold tracking-tight"
            style={{ fontSize: titleSize, lineHeight: titleSize + 6 }}
          >
            {outfit.outfit_name}
          </Text>
        )}

      </View>
    </>
  );
}
