import { useUserContext } from "@/features/auth/context/UserContext";
import { ReactionData, ReactionType, useUpdateCommentReactionMutation } from "@/mutations/UpdateCommentReactionMutation";
import { useTheme } from "@/providers/themeContext";
import { Frown, Heart, Laugh, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

interface CommentReactionsProps {
  commentId: string;
  reactions?: ReactionData | null;
}

const reactionConfig = {
  like: { emoji: '❤️', icon: Heart, color: '#ef4444', label: 'Like' },
  haha: { emoji: '😂', icon: Laugh, color: '#f59e0b', label: 'Haha' },
  sad: { emoji: '😢', icon: Frown, color: '#6b7280', label: 'Sad' },
};

export const CommentReactions = ({ commentId, reactions }: CommentReactionsProps) => {
  const { t } = useTranslation();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { userId } = useUserContext();
  const { colors } = useTheme();
  const { mutate: updateReaction, isPending } = useUpdateCommentReactionMutation();

  const handleReactionPress = (reactionType: ReactionType) => {
    if (!userId) {
      Alert.alert(t('commentReactions.alerts.notLoggedIn.title'), t('commentReactions.alerts.notLoggedIn.message'));
      return;
    }

    updateReaction({ commentId, userId, reactionType });
    setShowReactionPicker(false);
  };

  const getUserReaction = (): ReactionType | null => {
    if (!reactions || !userId) return null;

    for (const [reactionType, userIds] of Object.entries(reactions)) {
      if (Array.isArray(userIds) && userIds.includes(userId)) {
        return reactionType as ReactionType;
      }
    }
    return null;
  };

  const userReaction = getUserReaction();

  const getReactionCounts = () => {
    if (!reactions) return {};

    const counts: { [key: string]: number } = {};
    Object.entries(reactions).forEach(([reactionType, userIds]) => {
      if (Array.isArray(userIds) && userIds.length > 0) {
        counts[reactionType] = userIds.length;
      }
    });
    return counts;
  };

  const reactionCounts = getReactionCounts();
  const hasReactions = Object.keys(reactionCounts).length > 0;

  return (
    <View className="flex-row items-center mt-1">
      {hasReactions && (
        <View className="flex-row items-center mr-2">
          {Object.entries(reactionCounts).map(([reactionType, count]) => {
            const config = reactionConfig[reactionType as ReactionType];
            if (!config || count === 0) return null;

            return (
              <Pressable
                key={reactionType}
                onPress={() => handleReactionPress(reactionType as ReactionType)}
                disabled={isPending}
                className="flex-row items-center bg-gray-700/50 rounded-full px-2 py-1 mr-1 active:opacity-70"
              >
                <Text className="text-xs mr-1">{config.emoji}</Text>
                <Text className="text-gray-300 text-xs">{count}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="relative">
        <Pressable
          onPress={() => setShowReactionPicker(!showReactionPicker)}
          disabled={isPending}
          className="flex-row items-center bg-gray-700/30 rounded-full px-2 py-1 active:opacity-70"
        >
          {userReaction ? (
            <>
              <Text className="text-xs mr-1">{reactionConfig[userReaction].emoji}</Text>
              <Text className="text-gray-400 text-xs">{t('commentReactions.reacted')}</Text>
            </>
          ) : (
            <>
              <Plus size={12} color="#6B7280" />
              <Text className="text-gray-400 text-xs ml-1">{t('commentReactions.react')}</Text>
            </>
          )}
        </Pressable>

        {showReactionPicker && (
          <View style={{
            position: 'absolute',
            top: 32,
            left: 0,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 8,
            flexDirection: 'row',
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
          }}>
            {Object.entries(reactionConfig).map(([reactionType, config]) => (
              <Pressable
                key={reactionType}
                onPress={() => handleReactionPress(reactionType as ReactionType)}
                disabled={isPending}
                style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, marginHorizontal: 2 }}
              >
                <Text style={{ fontSize: 22 }}>{config.emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {showReactionPicker && (
        <Pressable
          onPress={() => setShowReactionPicker(false)}
          className="absolute inset-0 w-screen h-screen -z-10"
          style={{ left: -1000, top: -1000, width: 2000, height: 2000 }}
        />
      )}
    </View>
  );
};