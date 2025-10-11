import { SparkleBurst } from "@/components/ui/SparkleBurst";
import { useTheme } from "@/providers/themeContext";
import { Bookmark, MessageCircle, Share, ThumbsDown, ThumbsUp } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  showCommentsButton?: boolean;
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
  showCommentsButton = true,
}: OutfitInteractionButtonsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
    transform: [{ scale: saveScale?.value ?? 1 }],
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
              backgroundColor: isLiked ? `${colors.accent}20` : colors.surfaceVariant,
              borderColor: isLiked ? `${colors.accent}80` : colors.border
            }}
            >
              <Animated.View style={[likeStyle, { position: 'relative' }]}>
                <ThumbsUp
                  size={16}
                color={isLiked ? colors.accent : colors.textSecondary}
                fill={isLiked ? colors.accent : "transparent"}
                />
              <SparkleBurst 
              show={likeSparkle} color={colors.accent} size={16} />
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
              backgroundColor: isDisliked ? `${colors.textSecondary}30` : colors.surfaceVariant,
              borderColor: isDisliked ? `${colors.textSecondary}80` : colors.border
            }}
            >
              <Animated.View style={[dislikeStyle, { position: 'relative' }]}>
                <ThumbsDown
                  size={16}
                color={isDisliked ? colors.textSecondary : colors.textMuted}
                fill={isDisliked ? colors.textSecondary : "transparent"}
                />
              <SparkleBurst show={dislikeSparkle} color={colors.textSecondary} size={16} />
              </Animated.View>
            </Pressable>
          </View>

          {/* Compact visual percentage line */}
          <View style={{ height: 2, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: colors.accent,
                borderRadius: 999,
                width: `${percentage}%`
              }}
            />
          </View>
        </View>

        {/* Comment Section */}
        {showCommentsButton && (
          <Pressable
            onPress={onComments}
            onPressIn={() => springDown(commentScale, 0.94)}
            onPressOut={() => springUp(commentScale)}
            style={{
              backgroundColor: colors.surface,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              marginLeft: 12
            }}
          >
            <Animated.View style={[commentStyle, { flexDirection: 'row', alignItems: 'center' }]}>
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>
                { commentsCount }
              </Text>
            </Animated.View>
          </Pressable>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Bookmark Button */}
        {onSave && (
          <Pressable
            onPress={handleSave}
            onPressIn={() => springDown(saveScale || { value: 1 } as SharedValue<number>, 0.94)}
            onPressOut={() => springUp(saveScale || { value: 1 } as SharedValue<number>)}
            style={{
              backgroundColor: colors.surface,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Animated.View style={[saveStyle, { position: 'relative' }]}>
              <Bookmark
                size={16}
                color={isSaved ? "#EC4899" : "#9CA3AF"}
                fill={isSaved ? "#EC4899" : "transparent"}
              />
              <SparkleBurst show={saveSparkle} color="#EC4899" size={16} />
            </Animated.View>
          </Pressable>
        )}

        <Pressable
          onPress={onShare}
          onPressIn={() => springDown(shareScale, 0.94)}
          onPressOut={() => springUp(shareScale)}
          style={{
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Animated.View style={shareStyle}>
            <Share size={16} color={colors.textSecondary} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}