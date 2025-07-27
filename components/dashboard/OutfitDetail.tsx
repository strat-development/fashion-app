import { useFetchUser } from '@/fetchers/fetchUserByCreatedBy';
import { Bookmark, Heart, MessageCircle, Send, Share, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OutfitData } from './OutfitCard';

interface Comment {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface OutfitDetailProps {
  outfit: OutfitData;
  isVisible: boolean;
  onClose: () => void;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
}

const mockComments: Comment[] = [
  {
    id: 1,
    user: "style_maven",
    text: "Absolutely love this combination! Where did you get that jacket?",
    timestamp: "2h ago",
    likes: 12,
    isLiked: false
  },
  {
    id: 2,
    user: "fashion_forward",
    text: "This is giving me major inspiration for my weekend look! 🔥",
    timestamp: "4h ago",
    likes: 8,
    isLiked: true
  },
  {
    id: 3,
    user: "trendsetter_joe",
    text: "The color coordination is perfect! Great style sense.",
    timestamp: "6h ago",
    likes: 15,
    isLiked: false
  }
];

export const OutfitDetail: React.FC<OutfitDetailProps> = ({
  outfit,
  isVisible,
  onClose,
  onToggleLike,
  onToggleSave
}) => {
  const { data: userData } = useFetchUser(outfit.created_by || '');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        user: "You",
        text: newComment,
        timestamp: "now",
        likes: 0,
        isLiked: false
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const toggleCommentLike = (commentId: number) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        }
        : comment
    ));
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
            <View className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mr-3">
              <User size={16} color="white" />
            </View>
            <View>
              <Text className="text-white font-semibold">{userData?.full_name || 'Anonymous'}</Text>
              <Text className="text-white/60 text-sm">{outfit.created_at}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* Image */}
          <View className="relative">
            <Image
              source={{ uri: outfit.outfit_elements_data || "" }}
              className="w-full h-96"
              resizeMode="cover"
            />
            <View className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-2">
              <Pressable onPress={() => onToggleSave(outfit.comments)}>
                <Bookmark
                  size={20}
                  color={outfit.isSaved ? "#FFD700" : "white"}
                  fill={outfit.isSaved ? "#FFD700" : "transparent"}
                />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <View className="p-4">
            {/* Title and Tags */}
            <Text className="text-white font-bold text-2xl mb-3">{outfit.outfit_name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                {Array.isArray(outfit.outfit_tags) &&
                  outfit.outfit_tags.map((tag, index) => (
                    <View key={index} className="mr-2">
                      <Text className="text-white font-medium text-sm">{tag}</Text>
                    </View>
                  ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="flex-row items-center justify-between mb-6 pb-4 border-b border-white/10">
              <View className="flex-row items-center space-x-6">
                <Pressable
                  onPress={() => onToggleLike(outfit.id)}
                  className="flex-row items-center"
                >
                  <Heart
                    size={28}
                    color={outfit.isLiked ? "#FF4458" : "white"}
                    fill={outfit.isLiked ? "#FF4458" : "transparent"}
                  />
                  <Text className="text-white ml-2 font-medium text-lg">{outfit.likes}</Text>
                </Pressable>

                <View className="flex-row items-center">
                  <MessageCircle size={28} color="white" />
                  <Text className="text-white ml-2 font-medium text-lg">{comments.length}</Text>
                </View>
              </View>

              <Pressable className="flex-row items-center bg-white/10 px-4 py-2 rounded-full">
                <Share size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Share</Text>
              </Pressable>
            </View>

            {/* Comments Section */}
            <Text className="text-white font-bold text-xl mb-4">Comments</Text>

            {/* Add Comment */}
            <View className="flex-row items-center mb-6">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="flex-1 bg-white/10 text-white px-4 py-3 rounded-full mr-3"
                multiline
              />
              <Pressable
                onPress={handleAddComment}
                className="bg-blue-600 p-3 rounded-full"
              >
                <Send size={20} color="white" />
              </Pressable>
            </View>

            {/* Comments List */}
            {comments.map((comment) => (
              <View key={comment.id} className="mb-4 p-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mr-2">
                      <User size={12} color="white" />
                    </View>
                    <Text className="text-white font-semibold">{comment.user}</Text>
                    <Text className="text-white/60 text-sm ml-2">{comment.timestamp}</Text>
                  </View>

                  <Pressable
                    onPress={() => toggleCommentLike(comment.id)}
                    className="flex-row items-center"
                  >
                    <Heart
                      size={16}
                      color={comment.isLiked ? "#FF4458" : "white"}
                      fill={comment.isLiked ? "#FF4458" : "transparent"}
                    />
                    <Text className="text-white/80 ml-1 text-sm">{comment.likes}</Text>
                  </Pressable>
                </View>
                <Text className="text-white/90">{comment.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
