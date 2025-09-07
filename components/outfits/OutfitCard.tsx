import { useFetchUser } from "@/fetchers/fetchUser";
import { useFetchRatingStats } from "@/fetchers/outfits/fetchRatedOutfits";
import { useRateOutfitMutation } from "@/mutations/outfits/RateOutfitMutation";
import { useUnrateOutfitMutation } from "@/mutations/outfits/UnrateOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { Database } from "@/types/supabase";
import React, { useState } from "react";
import { View } from "react-native";
import { OutfitFooter, OutfitHeader, OutfitImageCarousel } from "./OutfitCard/index";

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

  React.useEffect(() => {
    setOptimisticLiked(isPositiveRated);
    setOptimisticDisliked(isNegativeRated);
  }, [isPositiveRated, isNegativeRated]);

  React.useEffect(() => {
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
        onPress={onPress}
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
        onComment={() => onComment?.(outfit.outfit_id)}
        onShare={() => onShare?.(outfit.outfit_id)}
        onToggleSave={handleSave}
      />
    </View>
  );
};