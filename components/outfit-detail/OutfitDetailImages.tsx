import React, { useState } from "react";
import { Image, Text, View, useWindowDimensions, ScrollView } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

interface OutfitDetailImagesProps {
  imageUrls: string[];
}

export default function OutfitDetailImages({ imageUrls }: OutfitDetailImagesProps) {
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (imageUrls.length === 0) return null;

  const { width, height } = useWindowDimensions();
  const singleH = Math.min(520, Math.max(280, Math.floor(height * 0.55)));
  const multiH = Math.min(450, Math.max(300, Math.floor(height * 0.45)));
  const cardW = width - 32; // Account for px-4 padding (16px each side)

  const renderCarouselItem = ({ item }: { item: string }) => (
    <View style={{ width: cardW, alignItems: 'center' }}>
      <Image
        source={{ uri: item }}
        className="rounded-2xl"
        style={{ width: cardW - 8, height: multiH }}
        resizeMode="cover"
      />
    </View>
  );

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
        <View className="relative">
          <Carousel
            width={cardW}
            height={multiH}
            data={imageUrls}
            onProgressChange={(_, absoluteProgress) => {
              progress.value = absoluteProgress;
              setCurrentIndex(Math.round(absoluteProgress));
            }}
            renderItem={renderCarouselItem}
            loop={false}
            enabled={imageUrls.length > 1}
            pagingEnabled={true}
            style={{ 
              width: cardW,
              alignItems: 'center',
              overflow: 'hidden'
            }}
          />
          
          {/* Image counter */}
          <View className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-400/30">
            <Text className="text-white text-xs font-medium">{currentIndex + 1}/{imageUrls.length}</Text>
          </View>
          
          {/* Custom pagination dots */}
          {imageUrls.length <= 5 && (
            <View className="flex-row justify-center mt-2">
              {imageUrls.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    currentIndex === index ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
