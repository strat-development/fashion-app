import { Bookmark, Heart, MessageCircle, Share, User } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export interface OutfitData {
  id: number;
  title: string;
  image: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  creator: string;
  createdAt: string;
  tags: string[];
}

interface OutfitCardProps {
  outfit: OutfitData;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
  onComment?: (id: number) => void;
  onShare?: (id: number) => void;
  onPress?: (outfit: OutfitData) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onToggleLike,
  onToggleSave,
  onComment,
  onShare,
  onPress
}) => {
  return (
    <View className="bg-black/20 backdrop-blur-xl rounded-3xl p-4 mb-6 border border-white/10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full items-center justify-center mr-3">
            <User size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-semibold text-base">{outfit.creator}</Text>
            <Text className="text-white/60 text-sm">{outfit.createdAt}</Text>
          </View>
        </View>
        {outfit.creator === "You" && (
          <View className="bg-blue-500/20 px-3 py-1 rounded-full">
            <Text className="text-blue-300 text-xs font-medium">Your creation</Text>
          </View>
        )}
      </View>

      {/* Image */}
      <Pressable onPress={() => onPress?.(outfit)}>
        <View className="relative mb-4">
          <Image 
            source={{ uri: outfit.image }} 
            className="w-full h-96 rounded-2xl"
            resizeMode="cover"
          />
          <View className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-2">
            <Pressable onPress={() => onToggleSave(outfit.id)}>
              <Bookmark 
                size={20} 
                color={outfit.isSaved ? "#FFD700" : "white"} 
                fill={outfit.isSaved ? "#FFD700" : "transparent"}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {/* Title and Tags */}
      <Text className="text-white font-bold text-xl mb-2">{outfit.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row">
          {outfit.tags.map((tag, index) => (
            <View key={index} className="bg-white/10 px-3 py-1 rounded-full mr-2">
              <Text className="text-white/80 text-sm">{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-6">
          <Pressable 
            onPress={() => onToggleLike(outfit.id)}
            className="flex-row items-center"
          >
            <Heart 
              size={24} 
              color={outfit.isLiked ? "#FF4458" : "white"} 
              fill={outfit.isLiked ? "#FF4458" : "transparent"}
            />
            <Text className="text-white ml-2 font-medium">{outfit.likes}</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => onComment?.(outfit.id)}
            className="flex-row items-center"
          >
            <MessageCircle size={24} color="white" />
            <Text className="text-white ml-2 font-medium">{outfit.comments}</Text>
          </Pressable>
        </View>

        <Pressable 
          onPress={() => onShare?.(outfit.id)}
          className="flex-row items-center bg-white/10 px-4 py-2 rounded-full"
        >
          <Share size={18} color="white" />
          <Text className="text-white ml-2 font-medium">Share</Text>
        </Pressable>
      </View>
    </View>
  );
};
