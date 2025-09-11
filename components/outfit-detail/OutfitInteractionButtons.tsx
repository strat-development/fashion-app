import { SparkleBurst } from "@/components/ui/SparkleBurst";
import { Bookmark, MessageCircle, Share, ThumbsDown, ThumbsUp } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, withSequence, withSpring } from "react-native-reanimated";

interface OutfitInteractionButtonsProps {
  isLiked: boolean;
  isDisliked: boolean;
  isSaved?: boolean;
  positiveRatings: number;
  negativeRatings: number;
  commentsCount: number;
  onPositiveRate: () => void;
  onNegativeRate: () => void;
  onComments: () => void;
  onShare: () => void;
  onSave?: () => void;
  likeScale: SharedValue<number>;
  dislikeScale: SharedValue<number>;
  commentScale: SharedValue<number>;
  shareScale: SharedValue<number>;
  saveScale?: SharedValue<number>;
}

export default function OutfitInteractionButtons({
  isLiked,
  isDisliked,
  isSaved = false,
  positiveRatings,
  negativeRatings,
  commentsCount,
  onPositiveRate,
  onNegativeRate,
  onComments,
  onShare,
  onSave,
  likeScale,
  dislikeScale,
  commentScale,
  shareScale,
  saveScale,
}: OutfitInteractionButtonsProps) {
  const [likeSparkle, setLikeSparkle] = useState(false);
  const [dislikeSparkle, setDislikeSparkle] = useState(false);
  const [saveSparkle, setSaveSparkle] = useState(false);

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

  const saveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale?.value || 1 }],
  }));

  const springDown = (sv: SharedValue<number>, to = 0.9) => (sv.value = withSpring(to, { damping: 14, stiffness: 220 }));
  const springUp = (sv: SharedValue<number>) => (sv.value = withSpring(1, { damping: 14, stiffness: 220 }));

  const pop = (sv: SharedValue<number>) => {
    sv.value = withSequence(
      withSpring(1.15, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
  };

  const trigger = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 550);
  };

  const handlePositiveRate = () => {
    onPositiveRate();
    if (!isLiked) {
      trigger(setLikeSparkle);
      pop(likeScale);
    }
  };

  const handleNegativeRate = () => {
    onNegativeRate();
    if (!isDisliked) {
      trigger(setDislikeSparkle);
      pop(dislikeScale);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      if (!isSaved) {
        trigger(setSaveSparkle);
        pop(saveScale || { value: 1 } as SharedValue<number>);
      }
    }
  };

  const totalRatings = positiveRatings + negativeRatings;
  const percentage = totalRatings > 0 ? (positiveRatings / totalRatings) * 100 : 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 }}>
        {/* Combined Rating Element */}
        <View style={{ paddingHorizontal: 8, paddingVertical: 6
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <Pressable
              onPress={handlePositiveRate}
              onPressIn={() => springDown(likeScale, 0.9)}
              onPressOut={() => springUp(likeScale)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                borderWidth: 1,
                backgroundColor: isLiked ? '#7e22ce20' : '#374151',
                borderColor: isLiked ? '#7e22ce80' : '#4b5563'
              }}
            >
              <Animated.View style={[likeStyle, { position: 'relative' }]}>
                <ThumbsUp
                  size={16}
                  color={isLiked ? "#EC4899" : "#9CA3AF"}
                  fill={isLiked ? "#EC4899" : "transparent"}
                />
                <SparkleBurst show={likeSparkle} color="#EC4899" />
              </Animated.View>
            </Pressable>
            <Pressable
              onPress={handleNegativeRate}
              onPressIn={() => springDown(dislikeScale, 0.9)}
              onPressOut={() => springUp(dislikeScale)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                borderWidth: 1,
                backgroundColor: isDisliked ? '#4b556340' : '#374151',
                borderColor: isDisliked ? '#4b556380' : '#4b5563'
              }}
            >
              <Animated.View style={[dislikeStyle, { position: 'relative' }]}>
                <ThumbsDown
                  size={16}
                  color={isDisliked ? "#9CA3AF" : "#6B7280"}
                  fill={isDisliked ? "#9CA3AF" : "transparent"}
                />
                <SparkleBurst show={dislikeSparkle} color="#9CA3AF" />
              </Animated.View>
            </Pressable>
          </View>

          {/* Compact visual percentage line */}
          <View style={{ height: 2, backgroundColor: '#374151', borderRadius: 999, overflow: 'hidden', width: '100%' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: '#7e22ce',
                borderRadius: 999,
                width: `${percentage}%`
              }}
            />
          </View>
        </View>

        {/* Comment Section */}
        <Pressable
          onPress={onComments}
          onPressIn={() => springDown(commentScale, 0.94)}
          onPressOut={() => springUp(commentScale)}
          style={{
            backgroundColor: '#1f1f1fcc',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            marginLeft: 12
          }}
        >
          <Animated.View style={[commentStyle, { flexDirection: 'row', alignItems: 'center' }]}>
            <MessageCircle size={16} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginLeft: 8, fontSize: 14, fontWeight: '500' }}>{commentsCount}</Text>
          </Animated.View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Bookmark Button */}
        {onSave && (
          <Pressable
            onPress={handleSave}
            onPressIn={() => springDown(saveScale || { value: 1 } as SharedValue<number>, 0.94)}
            onPressOut={() => springUp(saveScale || { value: 1 } as SharedValue<number>)}
            style={{
              backgroundColor: '#1f1f1fcc',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#2a2a2a'
            }}
          >
            <Animated.View style={[saveStyle, { position: 'relative' }]}>
              <Bookmark
                size={16}
                color={isSaved ? "#EC4899" : "#9CA3AF"}
                fill={isSaved ? "#EC4899" : "transparent"}
              />
              <SparkleBurst show={saveSparkle} color="#EC4899" />
            </Animated.View>
          </Pressable>
        )}

        <Pressable
          onPress={onShare}
          onPressIn={() => springDown(shareScale, 0.94)}
          onPressOut={() => springUp(shareScale)}
          style={{
            backgroundColor: '#1f1f1fcc',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#2a2a2a'
          }}
        >
          <Animated.View style={shareStyle}>
            <Share size={16} color="#9CA3AF" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
