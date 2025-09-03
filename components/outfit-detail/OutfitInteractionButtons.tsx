import React from "react";
import { MessageCircle, Share, ThumbsDown, ThumbsUp } from "lucide-react-native";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, withSequence, withSpring } from "react-native-reanimated";

interface OutfitInteractionButtonsProps {
  isLiked: boolean;
  isDisliked: boolean;
  positiveRatings: number;
  negativeRatings: number;
  commentsCount: number;
  onPositiveRate: () => void;
  onNegativeRate: () => void;
  onComments: () => void;
  onShare: () => void;
  likeScale: SharedValue<number>;
  dislikeScale: SharedValue<number>;
  commentScale: SharedValue<number>;
  shareScale: SharedValue<number>;
}

export default function OutfitInteractionButtons({
  isLiked,
  isDisliked,
  positiveRatings,
  negativeRatings,
  commentsCount,
  onPositiveRate,
  onNegativeRate,
  onComments,
  onShare,
  likeScale,
  dislikeScale,
  commentScale,
  shareScale,
}: OutfitInteractionButtonsProps) {
  const { width } = useWindowDimensions();
  const padY = width < 360 ? 12 : 18;
  const radius = width < 360 ? 14 : 20;
  const labelSize = width < 360 ? 12 : 13;
  
  const likeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));
  
  const dislikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dislikeScale.value }],
  }));
  
  const shareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));
  
  const commentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commentScale.value }],
  }));

  const springDown = (sv: SharedValue<number>, to = 0.9) => (sv.value = withSpring(to, { damping: 14, stiffness: 220 }));
  const springUp = (sv: SharedValue<number>) => (sv.value = withSpring(1, { damping: 14, stiffness: 220 }));

  return (
    <View className="flex-row items-center justify-around bg-gray-800/30 mb-6" style={{ paddingVertical: padY, borderRadius: radius }}>
      {/* Like Button */}
      <Pressable
        onPress={onPositiveRate}
        onPressIn={() => springDown(likeScale, 0.9)}
        onPressOut={() => springUp(likeScale)}
      >
        <Animated.View 
          style={likeStyle}
          className="items-center"
        >
          <ThumbsUp 
            size={24} 
            color={isLiked ? "#10B981" : "#9CA3AF"} 
            fill={isLiked ? "#10B981" : "transparent"}
          />
          <Text className="text-gray-300 mt-1" style={{ fontSize: labelSize }}>
            {positiveRatings}
          </Text>
        </Animated.View>
      </Pressable>

      {/* Dislike Button */}
      <Pressable
        onPress={onNegativeRate}
        onPressIn={() => springDown(dislikeScale, 0.9)}
        onPressOut={() => springUp(dislikeScale)}
      >
        <Animated.View 
          style={dislikeStyle}
          className="items-center"
        >
          <ThumbsDown 
            size={24} 
            color={isDisliked ? "#EF4444" : "#9CA3AF"} 
            fill={isDisliked ? "#EF4444" : "transparent"}
          />
          <Text className="text-gray-300 mt-1" style={{ fontSize: labelSize }}>
            {negativeRatings}
          </Text>
        </Animated.View>
      </Pressable>

      {/* Comments Button */}
      <Pressable
        onPress={onComments}
        onPressIn={() => springDown(commentScale, 0.9)}
        onPressOut={() => springUp(commentScale)}
      >
        <Animated.View 
          style={commentStyle}
          className="items-center"
        >
          <MessageCircle size={24} color="#9CA3AF" />
          <Text className="text-gray-300 mt-1" style={{ fontSize: labelSize }}>
            {commentsCount}
          </Text>
        </Animated.View>
      </Pressable>

      {/* Share Button */}
      <Pressable
        onPress={onShare}
        onPressIn={() => springDown(shareScale, 0.9)}
        onPressOut={() => springUp(shareScale)}
      >
        <Animated.View 
          style={shareStyle}
          className="items-center"
        >
          <Share size={24} color="#9CA3AF" />
          <Text className="text-gray-300 mt-1" style={{ fontSize: labelSize }}>Share</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}
