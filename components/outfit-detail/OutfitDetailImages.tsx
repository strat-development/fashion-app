import React from "react";
import { Image, ScrollView, View, useWindowDimensions } from "react-native";

interface OutfitDetailImagesProps {
  imageUrls: string[];
}

export default function OutfitDetailImages({ imageUrls }: OutfitDetailImagesProps) {
  if (imageUrls.length === 0) return null;

  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;
  const isTall = height > 780;
  const singleH = Math.min(520, Math.max(280, Math.floor(height * (isTall ? 0.46 : 0.42))));
  const multiH = Math.min(500, Math.max(260, Math.floor(height * 0.44)));
  const cardW = Math.floor(Math.min(320, Math.max(240, width * 0.75)));

  return (
    <View className="mb-6">
      {imageUrls.length === 1 ? (
        <Image
          source={{ uri: imageUrls[0] }}
          className="w-full rounded-2xl"
          style={{ height: singleH }}
          resizeMode="cover"
        />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-2"
          contentContainerStyle={{ paddingRight: 8, paddingLeft: 2 }}
        >
          {imageUrls.map((url, index) => (
            <View key={index} className="mr-2">
              <Image
                source={{ uri: url }}
                className="rounded-2xl"
                style={{ width: cardW, height: multiH }}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
