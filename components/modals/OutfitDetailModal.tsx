import { useFetchUser } from '@/fetchers/fetchUser';
import { useFetchSavedOutfits } from '@/fetchers/outfits/fetchSavedOutfits';
import { useFetchRatingStats } from '@/fetchers/outfits/fetchRatedOutfits';
import { useFetchComments, CommentData } from '@/fetchers/fetchComments';
import { formatDate } from '@/helpers/helpers';
import { useDeleteSavedOutfitMutation } from '@/mutations/outfits/DeleteSavedOutfitMutation';
import { useSaveOutfitMutation } from '@/mutations/outfits/SaveOutfitMutation';
import { useRateOutfitMutation } from '@/mutations/outfits/RateOutfitMutation';
import { useUnrateOutfitMutation } from '@/mutations/outfits/UnrateOutfitMutation';
import { useCreateCommentMutation } from '@/mutations/CreateCommentMutation';
import { useUserContext } from '@/providers/userContext';
import { Link } from 'expo-router';
import { Bookmark, Heart, MessageCircle, Send, Share, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Share as RNShare, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OutfitData } from '../outfits/OutfitCard';
import { CommentItem } from '../outfits/CommentItem';

interface OutfitDetailProps {
  outfit: OutfitData;
  isVisible: boolean;
  onClose: () => void;
}

export const OutfitDetail = ({
  outfit,
  isVisible,
  onClose
}: OutfitDetailProps) => {
  const { userId } = useUserContext();
  const { data: userData } = useFetchUser(outfit.created_by || '');
  const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
  const { data: ratingStats } = useFetchRatingStats(outfit.outfit_id || '');
  const { data: comments = [], isLoading: isCommentsLoading } = useFetchComments(outfit.outfit_id);
  const { mutate: saveOutfit } = useSaveOutfitMutation();
  const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();
  const { mutate: rateOutfit } = useRateOutfitMutation({
    outfitId: outfit.outfit_id || "",
    userId: userId || "",
  });
  const { mutate: unrateOutfit } = useUnrateOutfitMutation({
    outfitId: outfit.outfit_id || "",
    userId: userId || "",
  });
  const { mutateAsync: createComment, isPending: isCommentPending } = useCreateCommentMutation({
    outfitId: outfit.outfit_id,
    userId: userId ?? ''
  });

  const [newComment, setNewComment] = useState('');

  const savedOutfitIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);
  const isSaved = savedOutfitIds.has(outfit.outfit_id);
  const userRating = ratingStats?.data?.find((el) => el.rated_by === userId);
  const isPositiveRated = userRating?.top_rated === true;
  const isNegativeRated = userRating?.top_rated === false;
  const isRated = !!userRating && (isPositiveRated || isNegativeRated);

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

  const handlePositiveRate = () => {
    if (isPositiveRated) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: true });
    }
  };

  const handleNegativeRate = () => {
    if (isNegativeRated) {
      unrateOutfit();
    } else {
      rateOutfit({ topRated: false });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://fashion-app.com/outfit/${outfit.outfit_id}`;
      const shareText = `Check out this amazing outfit: "${outfit.outfit_name}" on Fashion App!`;
      
      const result = await RNShare.share({
        message: `${shareText}\n\n${shareUrl}`,
        url: shareUrl,
        title: outfit.outfit_name || 'Fashion Outfit',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share this outfit');
    }
  };

  const handleToggleSave = () => {
    if (!userId) return;
    if (isSaved) {
      unsaveOutfit({ outfitId: outfit.outfit_id || "", userId });
    } else {
      saveOutfit({
        userId,
        outfitId: outfit.outfit_id || "",
        savedAt: new Date().toISOString(),
      });
    }
  };

  const handleAddComment = async () => {
    if (!userId) {
      Alert.alert('Not logged in', 'You must be logged in to comment.');
      return;
    }
    if (!newComment.trim()) return;
    try {
      await createComment(newComment);
      setNewComment('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add comment');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <View className="flex-row items-center">
            {userData?.user_avatar ? (
              <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center mr-3">
                <Image source={{ uri: userData.user_avatar }} className="w-full h-full rounded-full" />
              </View>
            ) : (
              <View className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mr-3">
                <User size={16} color="white" />
              </View>
            )}
            <View>
              <Link href={{
                pathname: "/userProfile/[id]",
                params: { id: outfit.created_by ?? '' },
              }} className="text-white font-semibold">
                {userData?.nickname || 'Anonymous'}
              </Link>
              <Text className="text-white/60 text-sm">{formatDate(outfit.created_at)}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* Images */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row items-center justify-center p-4">
              {imageUrls.length > 0 ? (
                imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    className="aspect-square w-96 object-cover rounded-xl"
                    resizeMode="cover"
                  />
                ))
              ) : (
                <View className="w-80 h-96 bg-gray-700 rounded-xl items-center justify-center">
                  <Text className="text-white/60">No images available</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Content */}
          <View className="p-4">
            {/* Title and Tags */}
            <Text className="text-white font-bold text-2xl mb-2">{outfit.outfit_name || "Untitled Outfit"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 px-3 py-1 rounded-full mr-2 border border-gray-600/30"
                  >
                    <Text className="text-gray-200 text-xs">{tag as any}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="flex-row items-center justify-between mb-6 pb-4 border-b border-white/10">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center gap-1">
                  <Pressable
                    onPress={handlePositiveRate}
                    className={`flex-row items-center px-2 py-1 rounded-full border ${isPositiveRated ? "bg-green-500/20 border-green-500/50" : "bg-gray-800/50 border-gray-600/30"}`}
                  >
                    <Heart
                      size={28}
                      color={isPositiveRated ? "#22C55E" : "white"}
                      fill={isPositiveRated ? "#22C55E" : "transparent"}
                    />
                  </Pressable>
                  <Pressable
                    onPress={handleNegativeRate}
                    className={`flex-row items-center px-2 py-1 rounded-full border ${isNegativeRated ? "bg-red-500/20 border-red-500/50" : "bg-gray-800/50 border-gray-600/30"}`}
                  >
                    <Heart
                      size={28}
                      color={isNegativeRated ? "#EF4444" : "white"}
                      fill={isNegativeRated ? "#EF4444" : "transparent"}
                    />
                  </Pressable>
                  <Text className="text-white text-sm">{ratingStats?.positivePercentage || 0}%</Text>
                </View>
                <View className="flex-row items-center">
                  <MessageCircle size={28} color="white" />
                  <Text className="text-white ml-2 font-medium text-lg">{comments.length}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={handleToggleSave}
                  className="flex-row items-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 px-3 py-1 rounded-full border border-gray-600/30"
                >
                  <Bookmark
                    size={20}
                    color={isSaved ? "#EC4899" : "white"}
                    fill={isSaved ? "#EC4899" : "transparent"}
                  />
                </Pressable>
                <Pressable
                  onPress={handleShare}
                  className="flex-row items-center bg-gradient-to-r from-gray-800/70 to-gray-700/50 px-3 py-1 rounded-full border border-gray-600/30"
                >
                  <Share size={20} color="white" />
                  <Text className="text-white ml-2 font-medium">Share</Text>
                </Pressable>
              </View>
            </View>

            {/* Rating Feedback */}
            {isRated && (
              <Text className="text-white/60 text-sm mb-4">
                You have {isPositiveRated ? "liked" : "disliked"} this outfit.
              </Text>
            )}

            {/* Add Comment */}
            <View className="flex-row items-center mb-6">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment…"
                placeholderTextColor="#9CA3AF"
                className="flex-1 bg-gray-800/70 border border-gray-700/50 text-white px-4 py-3 rounded-full mr-3"
                multiline
              />
              <Pressable
                onPress={handleAddComment}
                disabled={isCommentPending || !newComment.trim()}
                className="bg-blue-600 p-3 rounded-full"
              >
                <Send size={20} color="white" />
              </Pressable>
            </View>

            {/* Comments List */}
            {isCommentsLoading && (
              <Text className="text-gray-400 text-center mt-4">Loading…</Text>
            )}

            {!isCommentsLoading && comments.length === 0 && (
              <Text className="text-gray-400 text-center mt-4">No comments yet. Be the first!</Text>
            )}

            {!isCommentsLoading && comments.map((comment: CommentData) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                parentCommentId={undefined}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};