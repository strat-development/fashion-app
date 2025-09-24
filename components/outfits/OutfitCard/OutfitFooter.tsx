import SparkleBurst from "@/components/ui/SparkleBurst";
import { ThemedGradient, useTheme } from "@/providers/themeContext";
import { Bookmark, MessageCircle, Share, ThumbsDown, ThumbsUp } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";

interface OutfitFooterProps {
  outfitName: string;
  tags: string[];
  isPositiveRated: boolean;
  isNegativeRated: boolean;
  isSaved: boolean;
  commentsCount: number;
  optimisticPercentage: number;
  onPositiveRate: () => void;
  onNegativeRate: () => void;
  onComment: () => void;
  onShare: () => void;
  onToggleSave: () => void;
}

export const OutfitFooter = ({
  outfitName,
  tags,
  isPositiveRated,
  isNegativeRated,
  isSaved,
  commentsCount,
  optimisticPercentage,
  onPositiveRate,
  onNegativeRate,
  onComment,
  onShare,
  onToggleSave,
}: OutfitFooterProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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

  const springDown = (sv: any, to = 0.9) => (sv.value = withSpring(to, { damping: 14, stiffness: 220 }));
  const springUp = (sv: any) => (sv.value = withSpring(1, { damping: 14, stiffness: 220 }));
  const pop = (sv: any) => (sv.value = withSequence(withSpring(1.08, { damping: 14, stiffness: 220 }), withSpring(1, { damping: 14, stiffness: 220 })));

  const handlePositiveRate = () => {
    onPositiveRate();
    trigger(setLikeSparkle);
    pop(likeScale);
  };

  const handleNegativeRate = () => {
    onNegativeRate();
    trigger(setDislikeSparkle);
    pop(dislikeScale);
  };

  const handleSave = () => {
    onToggleSave();
    if (!isSaved) {
      trigger(setSaveSparkle);
      pop(saveScale);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <Text style={{
        color: colors.text,
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 8
      }}>{outfitName || t('outfitDetail.defaultOutfitName')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {tags.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                marginRight: 8,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{
                color: colors.textSecondary,
                fontSize: 12
              }}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        gap: 12
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexShrink: 1,
          minWidth: 0
        }}>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 6
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginBottom: 6
            }}>
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
                  backgroundColor: isPositiveRated ? 'transparent' : `${colors.surfaceVariant}80`,
                  borderColor: isPositiveRated ? 'transparent' : `${colors.border}80`,
                  overflow: 'hidden'
                }}
              >
                <ThemedGradient
                  active={isPositiveRated}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <Animated.View style={likeStyle}>
                  <ThumbsUp
                    size={16}
                    color={isPositiveRated ? 'white' : colors.textSecondary}
                    fill={isPositiveRated ? 'white' : "transparent"}
                  />
                  <SparkleBurst show={likeSparkle} color="#ec4899" size={32} />
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
                  backgroundColor: isNegativeRated ? `${colors.textSecondary}40` : `${colors.surfaceVariant}80`,
                  borderColor: isNegativeRated ? `${colors.textSecondary}80` : `${colors.border}80`
                }}
              >
                <Animated.View style={dislikeStyle}>
                  <ThumbsDown
                    size={16}
                    color={isNegativeRated ? colors.textSecondary : colors.textMuted}
                    fill={isNegativeRated ? colors.textSecondary : "transparent"}
                  />
                  <SparkleBurst show={dislikeSparkle} color={colors.textSecondary} />
                </Animated.View>
              </Pressable>
            </View>

            <View style={{
              height: 2,
              backgroundColor: `${colors.border}66`,
              borderRadius: 999,
              overflow: 'hidden',
              width: '100%'
            }}>
              <ThemedGradient
                style={{
                  height: '100%',
                  borderRadius: 999,
                  width: `${optimisticPercentage}%`
                }}
              />
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Pressable
            onPress={handleSave}
            onPressIn={() => springDown(saveScale, 0.9)}
            onPressOut={() => springUp(saveScale)}
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
            <Animated.View style={saveStyle}>
              <Bookmark
                size={16}
                color={isSaved ? '#ec4899' : colors.textSecondary}
                fill={isSaved ? '#ec4899' : "transparent"}
              />
              <SparkleBurst show={saveSparkle} color="#ec4899" size={32} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={onComment}
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
              borderColor: colors.border
            }}
          >
            <Animated.View
              style={[commentStyle, { flexDirection: 'row', alignItems: 'center' }]}
            >
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={{
                color: colors.textSecondary,
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '500'
              }}>{ commentsCount }</Text>
            </Animated.View>
          </Pressable>

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
    </View>
  );
};