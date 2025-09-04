import { ReactionData, ReactionType, useUpdateCommentReactionMutation } from "@/mutations/UpdateCommentReactionMutation";
import { useUserContext } from "@/providers/userContext";
import { Frown, Heart, Laugh, Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

interface CommentReactionsProps {
  commentId: string;
  reactions?: ReactionData | null;
}

const reactionConfig = {
  like: { emoji: '❤️', icon: Heart, color: '#ef4444', label: 'Like' },
  haha: { emoji: '😂', icon: Laugh, color: '#f59e0b', label: 'Haha' },
  sad: { emoji: '😢', icon: Frown, color: '#3b82f6', label: 'Sad' },
};

export const CommentReactions = ({ commentId, reactions }: CommentReactionsProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { userId } = useUserContext();
  const { mutate: updateReaction, isPending } = useUpdateCommentReactionMutation();

  // Debug logging
  console.log('CommentReactions render:', { commentId, reactions, userId });

  const handleReactionPress = (reactionType: ReactionType) => {
    if (!userId) {
      Alert.alert('Not logged in', 'You must be logged in to react to comments.');
      return;
    }

    updateReaction({ commentId, userId, reactionType });
    setShowReactionPicker(false);
  };

  // Get current user's reaction
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

  // Count total reactions
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
      {/* Display existing reactions with counts */}
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

      {/* Reaction picker */}
      <View className="relative">
        <Pressable
          onPress={() => setShowReactionPicker(!showReactionPicker)}
          disabled={isPending}
          className="flex-row items-center bg-gray-700/30 rounded-full px-2 py-1 active:opacity-70"
        >
          {userReaction ? (
            <>
              <Text className="text-xs mr-1">{reactionConfig[userReaction].emoji}</Text>
              <Text className="text-gray-400 text-xs">Reacted</Text>
            </>
          ) : (
            <>
              <Plus size={12} color="#6B7280" />
              <Text className="text-gray-400 text-xs ml-1">React</Text>
            </>
          )}
        </Pressable>

        {/* Reaction options dropdown */}
        {showReactionPicker && (
          <View className="absolute top-8 left-0 bg-gray-800 border border-gray-600 rounded-lg p-2 flex-row space-x-1 z-10 shadow-lg">
            {Object.entries(reactionConfig).map(([reactionType, config]) => (
              <Pressable
                key={reactionType}
                onPress={() => handleReactionPress(reactionType as ReactionType)}
                disabled={isPending}
                className="items-center justify-center w-10 h-10 rounded-lg active:bg-gray-700"
              >
                <Text className="text-lg">{config.emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Overlay to close picker when clicking outside */}
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
