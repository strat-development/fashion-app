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
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

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

  const [optimisticLiked, setOptimisticLiked] = useState(isPositiveRated);
  const [optimisticDisliked, setOptimisticDisliked] = useState(isNegativeRated);
  const [optimisticSaved, setOptimisticSaved] = useState(outfit.isSaved);
  
  const { width: screenWidth } = useWindowDimensions();
  const progress = useSharedValue<number>(0);
  const [isInteracting, setIsInteracting] = useState(false);

  React.useEffect(() => {
    setOptimisticLiked(isPositiveRated);
    setOptimisticDisliked(isNegativeRated);
  }, [isPositiveRated, isNegativeRated]);

  React.useEffect(() => {
    setOptimisticSaved(outfit.isSaved);
  }, [outfit.isSaved]);

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
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    if (newLiked) {
      setOptimisticDisliked(false); 
      trigger(setLikeSparkle);
      pop(likeScale);
    }
    if (newLiked) {
      rateOutfit({ topRated: true });
    } else {
      unrateOutfit();
    }
  };

  const handleNegativeRate = () => {
    const newDisliked = !optimisticDisliked;
    setOptimisticDisliked(newDisliked);
    if (newDisliked) {
      setOptimisticLiked(false); 
      trigger(setDislikeSparkle);
      pop(dislikeScale);
    }
    if (newDisliked) {
      rateOutfit({ topRated: false });
    } else {
      unrateOutfit();
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

  const renderCarouselItem = ({ item }: { item: string }) => (
    <TapGestureHandler
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.END && !isInteracting) {
          onPress?.(outfit);
        }
      }}
    >
      <View>
        <Image
          source={{ uri: item }}
          className="rounded-xl"
          style={{ width: screenWidth - 64, height: 320 }}
          resizeMode="cover"
        />
      </View>
    </TapGestureHandler>
  );

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

      {/* Images */}
      <View className="relative mb-3 overflow-hidden rounded-xl">
        {imageUrls.length === 1 ? (
          <Pressable onPress={() => onPress?.(outfit)}>
            <Image source={{ uri: imageUrls[0] || "" }} className="w-full h-80 rounded-xl" resizeMode="cover" />
          </Pressable>
        ) : imageUrls.length > 1 ? (
          <View className="relative">
            <Carousel
              width={screenWidth - 64}
              height={320}
              data={imageUrls}
              onProgressChange={(_, absoluteProgress) => {
                progress.value = absoluteProgress;
                if (Math.abs(absoluteProgress % 1) > 0.1) {
                  setIsInteracting(true);
                } else {
                  setTimeout(() => setIsInteracting(false), 200);
                }
              }}
              renderItem={renderCarouselItem}
              mode="parallax"
              loop={false}
              enabled={imageUrls.length > 1}
              modeConfig={{
                parallaxScrollingScale: 0.98,
                parallaxScrollingOffset: 5,
                parallaxAdjacentItemScale: 0.95,
              }}
              style={{ 
                width: screenWidth - 64,
                overflow: 'hidden'
              }}
            />
            {/* Photo count indicator */}
            <View className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-400/30 z-20">
              <Text className="text-white text-xs font-medium">{Math.round(progress.value) + 1}/{imageUrls.length}</Text>
            </View>
            {/* Custom pagination dots */}
            {imageUrls.length <= 5 && (
              <View className="flex-row justify-center mt-2 z-20">
                {imageUrls.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full mx-1 ${
                      Math.round(progress.value) === index ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="w-full h-80 rounded-xl bg-gray-700 items-center justify-center">
            <Text className="text-gray-400">No images</Text>
          </View>
        )}
      </View>

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
          {/* Combined Rating Element - More Compact */}
          <View className="bg-gray-800/20 border border-gray-600/20 rounded-lg px-2 py-1.5">
            <View className="flex-row items-center gap-1 mb-1.5">
              <Pressable
                onPress={handlePositiveRate}
                onPressIn={() => springDown(likeScale, 0.9)}
                onPressOut={() => springUp(likeScale)}
                className={`relative flex-row items-center px-1.5 py-0.5 rounded-full border ${optimisticLiked ? "bg-purple-600/20 border-purple-500/30" : "bg-gray-700/30 border-gray-600/40"}`}
              >
                <Animated.View
                  style={likeStyle}
                  className="relative"
                >
                  <ThumbsUp
                    size={16}
                    color={optimisticLiked ? "#D8B4FE" : "#9CA3AF"}
                    fill={optimisticLiked ? "#D8B4FE" : "transparent"}
                  />
                  <SparkleBurst show={likeSparkle} color="#D8B4FE" />
                </Animated.View>
              </Pressable>
              <Pressable
                onPress={handleNegativeRate}
                onPressIn={() => springDown(dislikeScale, 0.9)}
                onPressOut={() => springUp(dislikeScale)}
                className={`relative flex-row items-center px-1.5 py-0.5 rounded-full border ${optimisticDisliked ? "bg-gray-700/30 border-gray-600/50" : "bg-gray-700/30 border-gray-600/40"}`}
              >
                <Animated.View
                  style={dislikeStyle}
                  className="relative"
                >
                  <ThumbsDown
                    size={16}
                    color={optimisticDisliked ? "#6B7280" : "#9CA3AF"}
                    fill={optimisticDisliked ? "#6B7280" : "transparent"}
                  />
                  <SparkleBurst show={dislikeSparkle} color="#6B7280" />
                </Animated.View>
              </Pressable>
            </View>
            
            {/* Compact visual percentage line */}
            <View className="h-0.5 bg-gray-700/40 rounded-full overflow-hidden" style={{ width: '100%' }}>
              <View 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"
                style={{ width: `${ratingStats?.positivePercentage || 0}%` }}
              />
            </View>
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
              const newSaved = !optimisticSaved;
              setOptimisticSaved(newSaved);
              if (newSaved) {
                onToggleSave?.(outfit.outfit_id);
                setSaveSparkle(true);
                setTimeout(() => setSaveSparkle(false), 550);
                pop(saveScale);
              } else {
                onUnsave?.(outfit.outfit_id);
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
                color={optimisticSaved ? "#EC4899" : "#9CA3AF"}
                fill={optimisticSaved ? "#EC4899" : "transparent"}
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