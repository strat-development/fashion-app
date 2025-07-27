import { useFetchCreatedOutfits } from "@/fetchers/fetchCreatedOutfits";
import { useFetchUser } from "@/fetchers/fetchUserByCreatedBy";
import { Database } from "@/types/supabase";
import { Bookmark, Heart, MessageCircle, Share, User } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export type OutfitData = Database['public']['Tables']['created-outfits']['Row'] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

interface OutfitCardProps {
  outfit: OutfitData;
  userName?: string;
  onToggleLike?: (id: string) => void;
  onToggleSave?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onPress?: (outfit: OutfitData) => void;
}

export const OutfitCard = ({
  outfit,
  onToggleLike,
  onToggleSave,
  onComment,
  onShare,
  onPress
}: OutfitCardProps) => {
  const { data: userData } = useFetchUser(outfit.created_by || '');

  useFetchCreatedOutfits(outfit.created_by || '');

  const tags = Array.isArray(outfit.outfit_tags)
    ? outfit.outfit_tags
    : typeof outfit.outfit_tags === 'string'
      ? [outfit.outfit_tags]
      : [];

  return (
    <View className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-gray-700/30">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-3">
            <User size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-white font-medium text-sm">{userData?.full_name || 'Anonymous'}</Text>
            <Text className="text-gray-400 text-xs">{outfit.created_at}</Text>
          </View>
        </View>
        {outfit.created_by === "You" && (
          <View className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-3 py-1 rounded-full border border-purple-500/30">
            <Text className="text-purple-300 text-xs font-medium">Your creation</Text>
          </View>
        )}
      </View>

      {/* Image */}
      <Pressable onPress={() => onPress?.(outfit)}>
        <View className="relative mb-3">
          <Image
            // source={{ uri: outfit.outfit_elements_data[0].image_url }}
            className="w-full h-80 rounded-xl"
            resizeMode="cover"
          />
        </View>
      </Pressable>

      {/* Title and Tags */}
      <Text className="text-white font-semibold text-lg mb-2">{outfit.outfit_name || 'Untitled Outfit'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row">
          {tags.map((tag, index) => (
            <View key={index} className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 px-3 py-1 rounded-full mr-2 border border-gray-600/30">
              <Text className="text-gray-200 text-xs">{tag as any}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-row items-center space-x-4">
          <Pressable
            // onPress={() => onToggleLike(outfit.outfit_id)}
            className="flex-row items-center"
          >
            <Heart
              size={20}
              color={outfit.isLiked ? "#EC4899" : "#9CA3AF"}
              fill={outfit.isLiked ? "#EC4899" : "transparent"}
            />
            <Text className="text-gray-300 ml-1 text-sm">{outfit.likes}</Text>
          </Pressable>

          <Pressable
            onPress={() => onComment?.(outfit.outfit_id)}
            className="flex-row items-center"
          >
            <MessageCircle size={20} color="#9CA3AF" />
            <Text className="text-gray-300 ml-1 text-sm">{outfit.comments}</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center space-x-3">
          <Pressable
            // onPress={() => onToggleSave(outfit.outfit_id)}
            className="flex-row items-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 px-3 py-1 rounded-full border border-gray-600/30"
          >
            <Bookmark
              size={14}
              color={outfit.isSaved ? "#EC4899" : "#9CA3AF"}
              fill={outfit.isSaved ? "#EC4899" : "transparent"}
            />
            <Text className="text-gray-300 ml-1 text-xs">
              {outfit.isSaved ? "Saved" : "Save"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onShare?.(outfit.outfit_id)}
            className="flex-row items-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 px-3 py-1 rounded-full border border-gray-600/30"
          >
            <Share size={14} color="#9CA3AF" />
            <Text className="text-gray-300 ml-1 text-xs">Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};