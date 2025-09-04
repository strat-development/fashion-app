import { ShareModal } from "@/components/modals/ShareModal";
import OutfitDetailHeader from "@/components/outfit-detail/OutfitDetailHeader";
import OutfitDetailImages from "@/components/outfit-detail/OutfitDetailImages";
import OutfitDetailInfo from "@/components/outfit-detail/OutfitDetailInfo";
import OutfitDetailSections from "@/components/outfit-detail/OutfitDetailSections";
import OutfitInteractionButtons from "@/components/outfit-detail/OutfitInteractionButtons";
import CommentSection from "@/components/outfits/CommentSection";
import { useFetchComments } from "@/fetchers/fetchComments";
import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { supabase } from "@/lib/supabase";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Database } from "@/types/supabase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OutfitDetailData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

export default function OutfitDetail() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <OutfitDetailContent />
    </>
  );
}

function OutfitDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const insets = useSafeAreaInsets();
  
  const [outfit, setOutfit] = useState<OutfitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
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
  setShowShareModal(true);
  };

  const handleComments = () => {
    commentScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );
    setShowComments(true);
  };

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

  const imageUrls = Array.isArray(outfit.outfit_elements_data)
    ? (outfit.outfit_elements_data as any[])
      .map((el) => (typeof el === "string" ? el : el?.imageUrl))
      .filter((u): u is string => typeof u === "string" && !!u)
    : [];

  const elementsData = Array.isArray(outfit.outfit_elements_data)
    ? (outfit.outfit_elements_data as any[])
      .filter((el) => el && typeof el === "object" && el.imageUrl)
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
        <OutfitDetailHeader />

        {/* Main Content */}
        <View className="px-4">
          <OutfitDetailInfo 
            outfit={outfit}
            userData={userData}
            tags={tags}
          />

          <OutfitDetailImages 
            imageUrls={imageUrls} 
            elementsData={elementsData}
          />
          
          <OutfitDetailSections 
            description={outfit.description}
            tags={tags}
          />

          <OutfitInteractionButtons
            isLiked={isLiked}
            isDisliked={isDisliked}
            positiveRatings={ratingStats?.positiveRatings || 0}
            negativeRatings={negativeRatings}
            commentsCount={outfit.comments}
            onPositiveRate={handlePositiveRate}
            onNegativeRate={handleNegativeRate}
            onComments={handleComments}
            onShare={handleShare}
            likeScale={likeScale}
            dislikeScale={dislikeScale}
            commentScale={commentScale}
            shareScale={shareScale}
          />
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <CommentSection
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        outfitId={id || ''}
        outfitTitle={outfit.outfit_name || 'Outfit'}
      />

      <ShareModal
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        outfit={outfit as any}
        isAnimated={true}
      />
    </>
  );
}
