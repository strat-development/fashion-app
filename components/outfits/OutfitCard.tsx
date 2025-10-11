import { ShareModal } from "@/components/modals/ShareModal";
import OutfitDetailImages from "@/components/outfit-detail/OutfitDetailImages";
import OutfitDetailInfo from "@/components/outfit-detail/OutfitDetailInfo";
import OutfitDetailSections from "@/components/outfit-detail/OutfitDetailSections";
import OutfitInteractionButtons from "@/components/outfit-detail/OutfitInteractionButtons";
import CommentSection from "@/components/outfits/CommentSection";
import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { Database } from "@/types/supabase";
import { UserData } from "@/types/userProfileTypes";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { OutfitFooter, OutfitHeader, OutfitImageCarousel } from "./OutfitCard/index";

export type OutfitData = Database["public"]["Tables"]["created-outfits"]["Row"] & {
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

export type OutfitCardMeta = {
  positive: number;
  negative: number;
  isLiked: boolean;
  isDisliked: boolean;
  isSaved?: boolean;
  comments: number;
};

export type OutfitCardPressExtras = {
  userData?: Pick<UserData, "nickname" | "user_avatar">;
  meta: OutfitCardMeta;
};

interface OutfitCardProps {
  outfit: OutfitData;
  userName?: string;
  onToggleSave?: (outfitId: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onPress?: (outfit: OutfitData, extras: OutfitCardPressExtras) => void;
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

  useEffect(() => {
    setOptimisticLiked(isPositiveRated);
    setOptimisticDisliked(isNegativeRated);
  }, [isPositiveRated, isNegativeRated]);

  useEffect(() => {
    setOptimisticSaved(outfit.isSaved);
  }, [outfit.isSaved]);

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

  const handlePositiveRate = () => {
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    if (newLiked) {
      setOptimisticDisliked(false);
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
    }
    if (newDisliked) {
      rateOutfit({ topRated: false });
    } else {
      unrateOutfit();
    }
  };

  const handleSave = () => {
    const newSaved = !optimisticSaved;
    setOptimisticSaved(newSaved);
    if (newSaved) {
      onToggleSave?.(outfit.outfit_id);
    } else {
      onUnsave?.(outfit.outfit_id);
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

  // Inline detail modal state and animations
  const [showDetail, setShowDetail] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);
  const commentScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  const buildPressExtras = (): OutfitCardPressExtras => {
    const positiveRatings = ratingStats?.positiveRatings ?? 0;
    const totalRatings = ratingStats?.totalRatings ?? 0;
    const negativeRatings = Math.max(0, totalRatings - positiveRatings);

    return {
      userData: userData
        ? {
            nickname: userData.nickname,
            user_avatar: userData.user_avatar,
          }
        : undefined,
      meta: {
        positive: positiveRatings,
        negative: negativeRatings,
        isLiked: !!optimisticLiked,
        isDisliked: !!optimisticDisliked,
        isSaved: !!optimisticSaved,
        comments: outfit.comments ?? 0,
      },
    };
  };

  const handleImagePress = () => {
    if (onPress) {
      onPress(outfit, buildPressExtras());
    } else {
      setShowDetail(true);
    }
  };

  return (
    <View style={{ backgroundColor: colors.background, marginBottom: 16 }}>
      <OutfitHeader
        userData={userData}
        createdAt={outfit.created_at || ""}
        createdBy={outfit.created_by || ""}
        currentUserId={userId || undefined}
        isDeleteVisible={isDeleteVisible}
        onDelete={onDelete}
        outfitId={outfit.outfit_id}
      />

      <OutfitImageCarousel
        imageUrls={imageUrls}
        onPress={handleImagePress}
        outfit={outfit}
      />

      <OutfitFooter
        outfitName={outfit.outfit_name || ""}
        tags={tags.map(tag => String(tag))}
        isPositiveRated={!!optimisticLiked}
        isNegativeRated={!!optimisticDisliked}
        isSaved={!!optimisticSaved}
        commentsCount={outfit.comments}
        optimisticPercentage={calculateOptimisticPercentage()}
        onPositiveRate={handlePositiveRate}
        onNegativeRate={handleNegativeRate}
        onComment={() => {
          const extras = buildPressExtras();
          if (onComment) {
            onComment(outfit.outfit_id);
          } else if (onPress) {
            onPress(outfit, extras);
          } else {
            setShowDetail(true);
          }
        }}
        onShare={() => setShowShareModal(true)}
        onToggleSave={handleSave}
      />

      {/* Inline Outfit Detail Modal */}
      {!onPress && (
        <Modal visible={showDetail} transparent={false} animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Pressable
            onPress={() => setShowDetail(false)}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.surface}`, borderWidth: 1, borderColor: colors.border }}
          >
            <X size={20} color={colors.text} />
          </Pressable>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <OutfitDetailInfo
                outfit={outfit}
                userData={userData as any}
                tags={Array.isArray(outfit.outfit_tags) ? outfit.outfit_tags : (outfit.outfit_tags ? [outfit.outfit_tags] : [])}
              />
            </View>
            <View style={{ paddingHorizontal: 16 }}>
              <OutfitDetailImages
                imageUrls={imageUrls}
                elementsData={Array.isArray(outfit.outfit_elements_data)
                  ? (outfit.outfit_elements_data as any[]).filter((el) => el && typeof el === 'object' && (el as any).imageUrl)
                  : [] as any}
              />
            </View>
            <OutfitDetailSections
              description={outfit.description}
              tags={Array.isArray(outfit.outfit_tags) ? outfit.outfit_tags : (outfit.outfit_tags ? [outfit.outfit_tags] : [])}
            />

            <OutfitInteractionButtons
              isLiked={!!optimisticLiked}
              isDisliked={!!optimisticDisliked}
              isSaved={!!optimisticSaved}
              positiveRatings={ratingStats?.positiveRatings || 0}
              negativeRatings={(ratingStats?.totalRatings || 0) - (ratingStats?.positiveRatings || 0)}
              commentsCount={outfit.comments}
              onPositiveRate={handlePositiveRate}
              onNegativeRate={handleNegativeRate}
              onComments={() => {}}
              onShare={() => setShowShareModal(true)}
              onSave={handleSave}
              likeScale={likeScale}
              dislikeScale={dislikeScale}
              commentScale={commentScale}
              shareScale={shareScale}
              saveScale={saveScale}
              showCommentsButton={false}
            />

            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <CommentSection
                isVisible={true}
                onClose={() => {}}
                outfitId={outfit.outfit_id}
                outfitTitle={outfit.outfit_name || ''}
                asInline
              />
            </View>
          </ScrollView>
        </View>
        </Modal>
      )}

      <ShareModal isVisible={showShareModal} onClose={() => setShowShareModal(false)} outfit={outfit} isAnimated />
    </View>
  );
};