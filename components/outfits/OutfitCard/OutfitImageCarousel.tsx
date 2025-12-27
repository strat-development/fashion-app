import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/providers/themeContext";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { OutfitData } from "../OutfitCard";

interface OutfitImageCarouselProps {
  imageUrls: string[];
  onPress?: (outfit: OutfitData) => void;
  outfit: OutfitData;
}

export const OutfitImageCarousel = ({ imageUrls, onPress, outfit }: OutfitImageCarouselProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  if (imageUrls.length === 0) {
    return (
      <View style={{
        width: '100%',
        height: 384,
        backgroundColor: colors.surfaceVariant,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{ color: colors.textSecondary }}>{t('outfitDetail.images.noImages')}</Text>
      </View>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <Pressable onPress={() => onPress?.(outfit)}>
        <Image source={{ uri: imageUrls[0] }} className="w-full h-96" resizeMode="cover" />
      </Pressable>
    );
  }

  return (
    <View className="relative">
      <FlatList
        ref={flatListRef}
        data={imageUrls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPress?.(outfit)} style={{ width: screenWidth, height: 384 }}>
            <Image
              source={{ uri: item }}
              className="w-full h-96"
              style={{ width: screenWidth, height: 384 }}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />
      
      <View style={{
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: `${colors.background}B3`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${colors.border}4D`
      }}>
        <Text style={{
        }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 12, color: colors.text }}>
            {currentIndex + 1}/{imageUrls.length}
          </ThemedText>
        </Text>
      </View>
      {imageUrls.length <= 5 && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          position: 'absolute',
          bottom: 12,
          width: '100%'
        }}>
          {imageUrls.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: currentIndex === index ? colors.white : `${colors.white}66`
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};