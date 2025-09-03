import React from "react";
import { Image, ScrollView, View } from "react-native";

interface OutfitDetailImagesProps {
  imageUrls: string[];
}

export default function OutfitDetailImages({ imageUrls }: OutfitDetailImagesProps) {
  if (imageUrls.length === 0) return null;

  return (
    <View className="mb-6">
      {imageUrls.length === 1 ? (
        <Image
          source={{ uri: imageUrls[0] }}
          className="w-full h-96 rounded-2xl"
          resizeMode="cover"
        />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-2"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {imageUrls.map((url, index) => (
            <View key={index} className="mr-3">
              <Image
                source={{ uri: url }}
                className="w-72 h-96 rounded-2xl"
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
