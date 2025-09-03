import SparkleBurst from "@/components/ui/SparkleBurst";
import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { formatDate } from "@/helpers/helpers";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Database } from "@/types/supabase";
import { Link } from "expo-router";
import { Bookmark, Delete, MessageCircle, Share, ThumbsDown, ThumbsUp, User } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";

export type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

interface OutfitCardProps {
  outfit: OutfitData;
  userName?: string;
  onToggleSave?: (outfitId: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onPress?: (outfit: OutfitData) => void;
  onDelete?: (outfitId: string) => void;
  onUnsave?: (outfitId: string) => void;
  isDeleteVisible?: boolean;
}

export const OutfitCard = ({
  outfit,
  onToggleSave,
  onComment,
  onShare,
  onPress,
  onDelete,
  isDeleteVisible,
  onUnsave,
}: OutfitCardProps) => {
  const { userId } = useUserContext();
  const { data: userData } = useFetchUser(outfit.created_by || "");
  const { data: ratingStats } = useFetchRatingStats(outfit.outfit_id || "");
  const { mutate: rateOutfit } = useRateOutfitMutation({
    outfitId: outfit.outfit_id || "",
    userId: userId || "",
    outfitCreatorId: outfit.created_by || "",
  });
  const { mutate: unrateOutfit } = useUnrateOutfitMutation({
    outfitId: outfit.outfit_id || "",
    userId: userId || "",
    outfitCreatorId: outfit.created_by || "",
  });

  const userRating = ratingStats?.data?.find((el) => el.rated_by === userId);
  const isPositiveRated = userRating?.top_rated === true;
  const isNegativeRated = userRating?.top_rated === false;
  const isRated = !!userRating && (isPositiveRated || isNegativeRated);

  const [likeSparkle, setLikeSparkle] = useState(false);
  const [dislikeSparkle, setDislikeSparkle] = useState(false);
  const [saveSparkle, setSaveSparkle] = useState(false);
  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);
  const saveScale = useSharedValue(1);
  const commentScale = useSharedValue(1);
  const shareScale = useSharedValue(1);

  const scaleStyle = (sv: any) => useAnimatedStyle(() => ({ transform: [{ scale: sv.value }] }));
  const likeStyle = scaleStyle(likeScale);
  const dislikeStyle = scaleStyle(dislikeScale);
  const saveStyle = scaleStyle(saveScale);
  const commentStyle = scaleStyle(commentScale);
  const shareStyle = scaleStyle(shareScale);

  const trigger = (fn: React.Dispatch<React.SetStateAction<boolean>>) => {
    fn(true);
    setTimeout(() => fn(false), 550);
  };

  // Helpers for button press feedback
  const springDown = (sv: any, to = 0.9) => (sv.value = withSpring(to, { damping: 14, stiffness: 220 }));
  const springUp = (sv: any) => (sv.value = withSpring(1, { damping: 14, stiffness: 220 }));
  const pop = (sv: any) => (sv.value = withSequence(withSpring(1.08, { damping: 14, stiffness: 220 }), withSpring(1, { damping: 14, stiffness: 220 })));

  const handlePositiveRate = () => {
    if (isPositiveRated) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: true });
      trigger(setLikeSparkle);
  pop(likeScale);
    }
  };

  const handleNegativeRate = () => {
    if (isNegativeRated) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: false });
      trigger(setDislikeSparkle);
  pop(dislikeScale);
    }
  };

  const imageUrls = Array.isArray(outfit.outfit_elements_data)
    ? (outfit.outfit_elements_data as any[])
      .map((el) => (typeof el === "string" ? el : el?.imageUrl))
      .filter((u): u is string => typeof u === "string" && !!u)
    : [];

  const tags = Array.isArray(outfit.outfit_tags)
    ? outfit.outfit_tags
    : typeof outfit.outfit_tags === "string"
      ? [outfit.outfit_tags]
      : [];

  return (
    <View className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-gray-700/30">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {userData?.user_avatar ? (
            <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center mr-3">
              <Image source={{ uri: userData.user_avatar }} className="w-full h-full rounded-full" />
            </View>
          ) : (
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-3">
              <User size={16} color="#FFFFFF" />
            </View>
          )}
          <View className="flex-1">
            <Link
              href={{
                pathname: "/userProfile/[id]",
                params: { id: outfit.created_by ?? "" },
              }}
              className="text-white font-semibold"
            >
              {userData?.nickname || 'Anonymous'}
            </Link>
            <Text className="text-gray-400 text-xs">{formatDate(outfit.created_at || "")}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {outfit.created_by === userId && (
            <View className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-3 py-1 rounded-full border border-purple-500/30">
              <Text className="text-purple-300 text-xs font-medium">Your creation</Text>
            </View>
          )}

          {isDeleteVisible && (
            <Pressable
              className="bg-red-600/20 border border-red-600/30 p-2 rounded-full"
              onPress={() => onDelete?.(outfit.outfit_id)}
            >
              <Delete size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Image */}
      <Pressable onPress={() => onPress?.(outfit)}>
        <View className="relative mb-3">
          <Image source={{ uri: imageUrls[0] || "" }} className="w-full h-80 rounded-xl" resizeMode="cover" />
        </View>
      </Pressable>

      {/* Title and Tags */}
      <Text className="text-white font-semibold text-lg mb-2">{outfit.outfit_name || "Untitled Outfit"}</Text>
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
      <View className="flex-row items-center justify-between pt-2 gap-3">
        <View className="flex-row items-center flex-shrink min-w-0">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={handlePositiveRate}
              onPressIn={() => springDown(likeScale, 0.9)}
              onPressOut={() => springUp(likeScale)}
              className={`relative flex-row items-center px-2 py-1 rounded-full border ${isPositiveRated ? "bg-green-500/20 border-green-500/50" : "bg-gray-800/50 border-gray-600/30"}`}
            >
              <Animated.View
                style={likeStyle}
                className="relative"
              >
                <ThumbsUp
                  size={18}
                  color={isPositiveRated ? "#22C55E" : "#9CA3AF"}
                  fill={isPositiveRated ? "#22C55E" : "transparent"}
                />
                <SparkleBurst show={likeSparkle} color="#22C55E" />
              </Animated.View>
            </Pressable>
            <Pressable
              onPress={handleNegativeRate}
              onPressIn={() => springDown(dislikeScale, 0.9)}
              onPressOut={() => springUp(dislikeScale)}
              className={`relative flex-row items-center px-2 py-1 rounded-full border ${isNegativeRated ? "bg-red-500/20 border-red-500/50" : "bg-gray-800/50 border-gray-600/30"}`}
            >
              <Animated.View
                style={dislikeStyle}
                className="relative"
              >
                <ThumbsDown
                  size={18}
                  color={isNegativeRated ? "#EF4444" : "#9CA3AF"}
                  fill={isNegativeRated ? "#EF4444" : "transparent"}
                />
                <SparkleBurst show={dislikeSparkle} color="#EF4444" />
              </Animated.View>
            </Pressable>
            <Text className="text-gray-300 text-sm">{ratingStats?.positivePercentage || 0}%</Text>
          </View>
          <Pressable
            onPress={() => {
              onComment?.(outfit.outfit_id);
            }}
            onPressIn={() => springDown(commentScale, 0.94)}
            onPressOut={() => springUp(commentScale)}
            className="flex-row items-center ml-3"
          >
            <Animated.View
              style={commentStyle}
              className="flex-row items-center"
            >
              <MessageCircle size={18} color="#9CA3AF" />
              <Text className="text-gray-300 ml-1 text-sm">{outfit.comments}</Text>
            </Animated.View>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 flex-shrink-0">
      <Pressable
            onPress={() => {
              if (outfit.isSaved) {
                onUnsave?.(outfit.outfit_id);
              } else {
                onToggleSave?.(outfit.outfit_id);
                setSaveSparkle(true);
                setTimeout(() => setSaveSparkle(false), 550);
        pop(saveScale);
              }
            }}
      onPressIn={() => springDown(saveScale, 0.9)}
      onPressOut={() => springUp(saveScale)}
            className="relative flex-row items-center justify-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 p-2 rounded-full border border-gray-600/30"
          >
            <Animated.View
              style={saveStyle}
              className="relative"
            >
              <Bookmark
                size={16}
                color={outfit.isSaved ? "#EC4899" : "#9CA3AF"}
                fill={outfit.isSaved ? "#EC4899" : "transparent"}
              />
              <SparkleBurst show={saveSparkle} color="#EC4899" />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => onShare?.(outfit.outfit_id)}
            onPressIn={() => springDown(shareScale, 0.94)}
            onPressOut={() => springUp(shareScale)}
            className="flex-row items-center justify-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 p-2 rounded-full border border-gray-600/30"
          >
            <Animated.View
              style={shareStyle}
            >
              <Share size={16} color="#9CA3AF" />
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};