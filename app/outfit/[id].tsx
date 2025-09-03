import CommentSection from "@/components/outfits/CommentSection";
import { useFetchComments } from "@/fetchers/fetchComments";
import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { formatDate } from "@/helpers/helpers";
import { supabase } from "@/lib/supabase";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Database } from "@/types/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, MessageCircle, Share, Tag, ThumbsDown, ThumbsUp, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OutfitDetailData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

export default function OutfitDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const insets = useSafeAreaInsets();
  
  const [outfit, setOutfit] = useState<OutfitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  
  const { data: userData } = useFetchUser(outfit?.created_by || "");
  const { data: ratingStats } = useFetchRatingStats(id || "");
  const { data: comments = [] } = useFetchComments(id || "");
  
  const { mutate: rateOutfit } = useRateOutfitMutation({
    outfitId: id || "",
    userId: userId || "",
    outfitCreatorId: outfit?.created_by || "",
  });
  
  const { mutate: unrateOutfit } = useUnrateOutfitMutation({
    outfitId: id || "",
    userId: userId || "",
  });

  // Animation values
  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const commentScale = useSharedValue(1);

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

  // Fetch outfit data
  useEffect(() => {
    const fetchOutfit = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('created-outfits')
          .select(`
            *,
            comments(count)
          `)
          .eq('outfit_id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setOutfit({
            ...data,
            comments: data.comments?.[0]?.count || 0,
            likes: ratingStats?.positiveRatings || 0,
            isLiked: ratingStats?.data?.some(rating => rating.rated_by === userId && rating.top_rated === true),
          });
        }
      } catch (error) {
        console.error('Error fetching outfit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [id, ratingStats]);

  const handlePositiveRate = () => {
    likeScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    
    const currentUserRating = ratingStats?.data?.find(rating => rating.rated_by === userId);
    if (currentUserRating?.top_rated === true) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: true });
    }
  };

  const handleNegativeRate = () => {
    dislikeScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    
    const currentUserRating = ratingStats?.data?.find(rating => rating.rated_by === userId);
    if (currentUserRating?.top_rated === false) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: false });
    }
  };

  const handleShare = () => {
    shareScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    // Add share functionality here
  };

  const handleComments = () => {
    commentScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    setShowComments(true);
  };

  const springDown = (sv: any, to = 0.9) => (sv.value = withSpring(to, { damping: 14, stiffness: 220 }));
  const springUp = (sv: any) => (sv.value = withSpring(1, { damping: 14, stiffness: 220 }));

  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading outfit...</Text>
      </View>
    );
  }

  if (!outfit) {
    return (
      <View className="flex-1 bg-gradient-to-b from-black to-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Outfit not found</Text>
        <Pressable 
          onPress={() => router.back()}
          className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const tags = Array.isArray(outfit.outfit_tags) 
    ? outfit.outfit_tags 
    : typeof outfit.outfit_tags === "string"
    ? [outfit.outfit_tags]
    : [];

  const currentUserRating = ratingStats?.data?.find(rating => rating.rated_by === userId);
  const isLiked = currentUserRating?.top_rated === true;
  const isDisliked = currentUserRating?.top_rated === false;
  const negativeRatings = ratingStats?.totalRatings ? ratingStats.totalRatings - ratingStats.positiveRatings : 0;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1 bg-gradient-to-b from-black to-gray-900"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View 
          className="flex-row items-center justify-between px-4 py-2"
          style={{ paddingTop: insets.top + 10 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-800/80 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="#ffffff" />
          </Pressable>
          
          <Text className="text-white text-lg font-semibold">Outfit Details</Text>
          
          <View className="w-10" />
        </View>

        {/* Main Content */}
        <View className="px-4">
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

          {/* Outfit Image - Note: This field doesn't exist in current schema */}
          {/* You may need to add outfit_image field to your database or use outfit_elements_data */}
          
          {/* Description */}
          {outfit.description && (
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-2">Description</Text>
              <Text className="text-gray-300 text-base leading-relaxed">
                {outfit.description}
              </Text>
            </View>
          )}

          {/* Price - Note: This field doesn't exist in current schema */}
          {/* You may need to add outfit_price field to your database */}

          {/* Tags */}
          {tags.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Tag size={18} color="#A855F7" />
                <Text className="text-white text-lg font-semibold ml-2">Tags</Text>
              </View>
              <View className="flex-row flex-wrap">
                {tags.map((tag, index) => (
                  <View 
                    key={index}
                    className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 mr-2 mb-2"
                  >
                    <Text className="text-purple-300 text-sm">{String(tag)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Interaction Buttons */}
          <View className="flex-row items-center justify-around py-6 bg-gray-800/30 rounded-2xl mb-6">
            {/* Like Button */}
            <Pressable
              onPress={handlePositiveRate}
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
                <Text className="text-gray-300 mt-1 text-sm">
                  {ratingStats?.positiveRatings || 0}
                </Text>
              </Animated.View>
            </Pressable>

            {/* Dislike Button */}
            <Pressable
              onPress={handleNegativeRate}
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
                <Text className="text-gray-300 mt-1 text-sm">
                  {negativeRatings}
                </Text>
              </Animated.View>
            </Pressable>

            {/* Comments Button */}
            <Pressable
              onPress={handleComments}
              onPressIn={() => springDown(commentScale, 0.9)}
              onPressOut={() => springUp(commentScale)}
            >
              <Animated.View 
                style={commentStyle}
                className="items-center"
              >
                <MessageCircle size={24} color="#9CA3AF" />
                <Text className="text-gray-300 mt-1 text-sm">
                  {outfit.comments}
                </Text>
              </Animated.View>
            </Pressable>

            {/* Share Button */}
            <Pressable
              onPress={handleShare}
              onPressIn={() => springDown(shareScale, 0.9)}
              onPressOut={() => springUp(shareScale)}
            >
              <Animated.View 
                style={shareStyle}
                className="items-center"
              >
                <Share size={24} color="#9CA3AF" />
                <Text className="text-gray-300 mt-1 text-sm">Share</Text>
              </Animated.View>
            </Pressable>
          </View>

          {/* Comments Preview */}
          {comments.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                Recent Comments ({comments.length})
              </Text>
              {comments.slice(0, 3).map((comment) => (
                <View key={comment.id} className="bg-gray-800/50 rounded-xl p-4 mb-3">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-2">
                      <User size={14} color="#FFFFFF" />
                    </View>
                    <Text className="text-white font-medium">
                      {comment.user_info?.nickname || 'Anonymous'}
                    </Text>
                    <Text className="text-gray-400 text-xs ml-auto">
                      {formatDate(comment.created_at || "")}
                    </Text>
                  </View>
                  <Text className="text-gray-300">
                    {comment.comment_content}
                  </Text>
                </View>
              ))}
              
              {comments.length > 3 && (
                <Pressable
                  onPress={() => setShowComments(true)}
                  className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 items-center"
                >
                  <Text className="text-purple-300 font-medium">
                    View all {comments.length} comments
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <CommentSection
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        outfitId={id || ''}
        outfitTitle={outfit.outfit_name || 'Outfit'}
      />
    </>
  );
}
