import SparkleBurst from "@/components/ui/SparkleBurst";
import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { formatDate } from "@/helpers/helpers";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useTheme, ThemedGradient } from "@/providers/themeContext";
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
  const { colors } = useTheme();
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
  

  const calculateOptimisticPercentage = () => {
    if (!ratingStats) return 0;
    
    const basePositive = ratingStats.positiveRatings || 0;
    const baseTotal = ratingStats.totalRatings || 0;
    
    let positiveChange = 0;
    let totalChange = 0;
    
    if (!isRated && optimisticLiked) {
      positiveChange = 1;
      totalChange = 1;
    }
    else if (!isRated && optimisticDisliked) {
      totalChange = 1;
    }
    else if (isPositiveRated && optimisticDisliked) {
      positiveChange = -1;
    }
    else if (isNegativeRated && optimisticLiked) {
      positiveChange = 1;
    }
    else if (isPositiveRated && !optimisticLiked && !optimisticDisliked) {
      positiveChange = -1;
      totalChange = -1;
    }
    else if (isNegativeRated && !optimisticLiked && !optimisticDisliked) {
      totalChange = -1;
    }
    
    const newPositive = Math.max(0, basePositive + positiveChange);
    const newTotal = Math.max(1, baseTotal + totalChange);
    
    return Math.round((newPositive / newTotal) * 100);
  };
  
  const optimisticPercentage = calculateOptimisticPercentage();
  
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

  return (
    <View style={{ backgroundColor: colors.background, marginBottom: 16 }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {userData?.user_avatar ? (
            <View style={{
              width: 32,
              height: 32,
              backgroundColor: colors.surfaceVariant,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Image 
                source={{ uri: userData.user_avatar }} 
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
              />
            </View>
          ) : (
            <View style={{
              width: 32,
              height: 32,
              backgroundColor: colors.accent,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <User size={16} color={colors.white} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Link
              href={{
                pathname: "/userProfile/[id]",
                params: { id: outfit.created_by ?? "" },
              }}
              asChild
            >
              <Pressable>
                <Text style={{ 
                  color: colors.text, 
                  fontWeight: '600' 
                }}>
                  {userData?.nickname || 'Anonymous'}
                </Text>
              </Pressable>
            </Link>
            <Text style={{ 
              color: colors.textSecondary, 
              fontSize: 12 
            }}>{formatDate(outfit.created_at || "")}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {outfit.created_by === userId && (
            <ThemedGradient
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: `${colors.accent}4D`
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 12, 
                fontWeight: '500' 
              }}>Your creation</Text>
            </ThemedGradient>
          )}

          {isDeleteVisible && (
            <Pressable
              style={{
                backgroundColor: `${colors.error}33`,
                borderWidth: 1,
                borderColor: `${colors.error}4D`,
                padding: 8,
                borderRadius: 999
              }}
              onPress={() => onDelete?.(outfit.outfit_id)}
            >
              <Delete size={16} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Images - Full Width */}
      <View style={{ position: 'relative', overflow: 'hidden' }}>
        {imageUrls.length === 1 ? (
          <Pressable onPress={() => onPress?.(outfit)}>
            <Image source={{ uri: imageUrls[0] || "" }} className="w-full h-96" resizeMode="cover" />
          </Pressable>
        ) : imageUrls.length > 1 ? (
          <View className="relative">
            <Carousel
              width={screenWidth}
              height={384}
              data={imageUrls}
              onProgressChange={(_, absoluteProgress) => {
                progress.value = absoluteProgress;
                if (Math.abs(absoluteProgress % 1) > 0.1) {
                  setIsInteracting(true);
                } else {
                  setTimeout(() => setIsInteracting(false), 200);
                }
              }}
              renderItem={({ item, index }) => (
                <TapGestureHandler
                  numberOfTaps={1}
                  onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.ACTIVE) {
                      onPress?.(outfit);
                    }
                  }}
                >
                  <View>
                    <Image
                      source={{ uri: item || "" }}
                      className="w-full h-96"
                      style={{ width: screenWidth, height: 384 }}
                      resizeMode="cover"
                    />
                  </View>
                </TapGestureHandler>
              )}
              mode="parallax"
              loop={false}
              enabled={imageUrls.length > 1}
              modeConfig={{
                parallaxScrollingScale: 1.0,
                parallaxScrollingOffset: 0,
                parallaxAdjacentItemScale: 1.0,
              }}
              style={{ 
                width: screenWidth,
                overflow: 'hidden'
              }}
            />
            {/* Photo count indicator */}
            <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: `${colors.background}B3`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${colors.border}4D`
            }}>
              <Text style={{
                color: colors.text,
                fontSize: 12,
                fontWeight: '500'
              }}>{Math.round(progress.value) + 1}/{imageUrls.length}</Text>
            </View>
            {/* Custom pagination dots */}
            {imageUrls.length <= 5 && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 12,
                width: '100%'
              }}>
                {imageUrls.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      marginHorizontal: 4,
                      backgroundColor: Math.round(progress.value) === index ? colors.white : `${colors.white}66`
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={{
            width: '100%',
            height: 384,
            backgroundColor: colors.surfaceVariant,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: colors.textSecondary }}>No images</Text>
          </View>
        )}
      </View>

      {/* Title, Tags and Actions */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        {/* Title and Tags */}
        <Text style={{
          color: colors.text,
          fontWeight: '600',
          fontSize: 18,
          marginBottom: 8
        }}>{outfit.outfit_name || "Untitled Outfit"}</Text>
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
                }}>{tag as any}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Actions */}
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
            {/* Combined Rating Element - More Compact */}
            <View style={{ 
              backgroundColor: colors.surface, 
              borderWidth: 1, 
              borderColor: colors.border, 
              borderRadius: 8, 
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
                    backgroundColor: optimisticLiked ? 'transparent' : `${colors.surfaceVariant}80`,
                    borderColor: optimisticLiked ? 'transparent' : `${colors.border}80`,
                    overflow: 'hidden'
                  }}
                >
                  <ThemedGradient
                    active={optimisticLiked}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <Animated.View
                    style={likeStyle}
                  >
                    <ThumbsUp
                      size={16}
                      color={optimisticLiked ? 'white' : colors.textSecondary}
                      fill={optimisticLiked ? 'white' : "transparent"}
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
                  backgroundColor: optimisticDisliked ? `${colors.textSecondary}40` : `${colors.surfaceVariant}80`,
                  borderColor: optimisticDisliked ? `${colors.textSecondary}80` : `${colors.border}80`
                }}
              >
                <Animated.View
                  style={dislikeStyle}
                >
                  <ThumbsDown
                    size={16}
                    color={optimisticDisliked ? colors.textSecondary : colors.textMuted}
                    fill={optimisticDisliked ? colors.textSecondary : "transparent"}
                  />
                  <SparkleBurst show={dislikeSparkle} color={colors.textSecondary} />
                </Animated.View>
              </Pressable>
            </View>
            
            {/* Compact visual percentage line */}
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
          {/* Comment Section */}
          <Pressable
            onPress={() => {
              onComment?.(outfit.outfit_id);
            }}
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
            <Animated.View
              style={[commentStyle, { flexDirection: 'row', alignItems: 'center' }]}
            >
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={{
                color: colors.textSecondary,
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '500'
              }}>{outfit.comments}</Text>
            </Animated.View>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
            <Animated.View
              style={saveStyle}
            >
              <Bookmark
                size={16}
                color={optimisticSaved ? '#ec4899' : colors.textSecondary}
                fill={optimisticSaved ? '#ec4899' : "transparent"}
              />
              <SparkleBurst show={saveSparkle} color="#ec4899" size={32} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => onShare?.(outfit.outfit_id)}
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
            <Animated.View
              style={shareStyle}
            >
              <Share size={16} color={colors.textSecondary} />
            </Animated.View>
          </Pressable>
        </View>
      </View>
      </View>
    </View>
  );
};