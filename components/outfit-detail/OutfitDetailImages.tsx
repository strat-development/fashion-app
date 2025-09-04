import React, { useState } from "react";
import { Image, Text, View, useWindowDimensions, Pressable, Linking } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { OutfitElementData } from "@/types/createOutfitTypes";
import { ExternalLink, Tag, DollarSign } from "lucide-react-native";

interface OutfitDetailImagesProps {
  imageUrls: string[];
  elementsData?: OutfitElementData[];
}

export default function OutfitDetailImages({ imageUrls, elementsData }: OutfitDetailImagesProps) {
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (imageUrls.length === 0) return null;

  const { width, height } = useWindowDimensions();
  const singleH = Math.min(520, Math.max(280, Math.floor(height * 0.55)));
  const multiH = Math.min(450, Math.max(300, Math.floor(height * 0.45)));
  const cardW = width - 32;

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => {
    const elementData = elementsData?.[index];
    
    const handleSitePress = () => {
      if (elementData?.siteUrl) {
        Linking.openURL(elementData.siteUrl).catch(err => 
          console.error('Failed to open URL:', err)
        );
      }
    };

    return (
      <View style={{ width: cardW, alignItems: 'center' }}>
        <View className="relative">
          <Image
            source={{ uri: item }}
            className="rounded-2xl"
            style={{ width: cardW - 8, height: multiH }}
            resizeMode="cover"
          />
          
          {/* Element Info Overlay */}
          {elementData && (
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-2xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Tag size={14} color="#9CA3AF" />
                    <Text className="text-white font-semibold text-sm ml-2">
                      {elementData.type}
                    </Text>
                  </View>
                  
                  {elementData.price !== null && (
                    <View className="flex-row items-center">
                      <DollarSign size={14} color="#10B981" />
                      <Text className="text-green-400 font-medium text-sm ml-1">
                        ${elementData.price.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
                
                {elementData.siteUrl && (
                  <Pressable
                    onPress={handleSitePress}
                    className="bg-purple-600/80 backdrop-blur-sm p-2.5 rounded-full border border-purple-400/30"
                  >
                    <ExternalLink size={16} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="mb-6">
      {imageUrls.length === 1 ? (
        <View className="relative">
          <Image
            source={{ uri: imageUrls[0] }}
            className="w-full rounded-2xl"
            style={{ height: singleH }}
            resizeMode="cover"
          />
          
          {/* Single Image Element Info Overlay */}
          {elementsData?.[0] && (
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-2xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Tag size={16} color="#9CA3AF" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      {elementsData[0].type}
                    </Text>
                  </View>
                  
                  {elementsData[0].price !== null && (
                    <View className="flex-row items-center">
                      <DollarSign size={16} color="#10B981" />
                      <Text className="text-green-400 font-medium text-lg ml-1">
                        ${elementsData[0].price.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
                
                {elementsData[0].siteUrl && (
                  <Pressable
                    onPress={() => {
                      Linking.openURL(elementsData[0].siteUrl).catch(err => 
                        console.error('Failed to open URL:', err)
                      );
                    }}
                    className="bg-purple-600/80 backdrop-blur-sm p-3 rounded-full border border-purple-400/30"
                  >
                    <ExternalLink size={18} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
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
