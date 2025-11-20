import { ReportPostModal } from "@/components/modals/ReportPostModal";
import { ShareModal } from "@/components/modals/ShareModal";
import OutfitDetailHeader from "@/components/outfit-detail/OutfitDetailHeader";
import OutfitDetailImages from "@/components/outfit-detail/OutfitDetailImages";
import OutfitDetailInfo from "@/components/outfit-detail/OutfitDetailInfo";
import OutfitDetailSections from "@/components/outfit-detail/OutfitDetailSections";
import OutfitInteractionButtons from "@/components/outfit-detail/OutfitInteractionButtons";
import CommentSection from "@/components/outfits/CommentSection";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useFetchUser } from "@/features/auth/api/fetchUser";
import { useUserContext } from "@/features/auth/context/UserContext";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { supabase } from "@/lib/supabase";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { ThemedGradient, useTheme } from "@/providers/themeContext";
import { Database } from "@/types/supabase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
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
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [outfit, setOutfit] = useState<OutfitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: userData } = useFetchUser(outfit?.created_by || "");
  const { data: ratingStats } = useFetchRatingStats(id || "");
  const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');

  const { mutate: rateOutfit } = useRateOutfitMutation({
    outfitId: id || "",
    userId: userId || "",
    outfitCreatorId: outfit?.created_by || "",
  });

  const { mutate: unrateOutfit } = useUnrateOutfitMutation({
    outfitId: id || "",
    userId: userId || "",
  });

  const { mutate: saveOutfit } = useSaveOutfitMutation();
  const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();
  const isSaved = useMemo(() => {
    return savedOutfits?.some(saved => saved.outfit_id === id) || false;
  }, [savedOutfits, id]);
  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const commentScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  useEffect(() => {
    const fetchOutfit = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('created-outfits')
          .select(`
            *,
            comments(count)
          `)
          .eq('outfit_id', id)
          .single();

        if (error) {
          setError('Oops! This outfit no longer exists.');
          setOutfit(null);
        } else if (data) {
          setOutfit({
            ...data,
            comments: data.comments?.[0]?.count || 0,
            likes: ratingStats?.positiveRatings || 0,
            isLiked: ratingStats?.data?.some((rating) => rating.rated_by === userId && rating.top_rated === true),
          });
          setError(null);
        } else {
          setError('Oops! This outfit no longer exists.');
          setOutfit(null);
        }
      } catch (error) {
        console.error('Error fetching outfit:', error);
        setError('Oops! Something went wrong.');
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [id, ratingStats, userId]);

  const handlePositiveRate = () => {
    likeScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );

    const currentUserRating = ratingStats?.data?.find((rating) => rating.rated_by === userId);
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

  const handleSave = () => {
    saveScale.value = withSequence(
      withSpring(1.2, { damping: 14, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 })
    );

    if (!userId || !id) return;

    if (isSaved) {
      unsaveOutfit({ outfitId: id, userId });
    } else {
      saveOutfit({ userId, outfitId: id, savedAt: new Date().toISOString() });
    }
  };

  if (loading) {
    return <FullScreenLoader message={t('outfitDetail.loading')} />;
  }

  if (error || !outfit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
          {error || t('outfitDetail.notFound')}
        </Text>
        <Pressable onPress={() => router.back()} style={{ borderRadius: 999, overflow: 'hidden' }}>
          <ThemedGradient style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 }}>
            <Text style={{ color: colors.white, fontWeight: '600', fontSize: 16 }}>{t('outfitDetail.goBack')}</Text>
          </ThemedGradient>
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} translucent={false} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <OutfitDetailHeader
            canReport={!!outfit && userId !== outfit.created_by}
            onReport={() => setShowReportModal(true)}
          />

          <View style={{ paddingHorizontal: 16 }}>
            <OutfitDetailInfo
              outfit={outfit}
              userData={userData}
              tags={tags}
            />

            <OutfitDetailImages
              imageUrls={imageUrls}
              elementsData={elementsData}
            />
          </View>

          <OutfitDetailSections
            description={outfit.description}
            tags={tags}
          />

          <OutfitInteractionButtons
            isLiked={isLiked}
            isDisliked={isDisliked}
            isSaved={isSaved}
            positiveRatings={ratingStats?.positiveRatings || 0}
            negativeRatings={negativeRatings}
            commentsCount={outfit.comments}
            onPositiveRate={handlePositiveRate}
            onNegativeRate={handleNegativeRate}
            onComments={handleComments}
            onShare={handleShare}
            onSave={handleSave}
            likeScale={likeScale}
            dislikeScale={dislikeScale}
            commentScale={commentScale}
            shareScale={shareScale}
            saveScale={saveScale}
          />
        </ScrollView>
      </View>

      <CommentSection
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        outfitId={id || ''}
        outfitTitle={outfit.outfit_name || t('outfitDetail.defaultOutfitName')}
      />

      <ShareModal
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        outfit={outfit as any}
        isAnimated={true}
      />

      <ReportPostModal
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={id || ''}
        postTitle={outfit?.outfit_name || ''}
        postOwnerId={outfit?.created_by || ''}
      />
    </>
  );
}