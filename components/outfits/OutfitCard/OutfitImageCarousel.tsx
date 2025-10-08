import { useTheme } from "@/providers/themeContext";
import { useState } from "react";
import { Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useTranslation } from "react-i18next";
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
  const progress = useSharedValue<number>(0);
  const [isInteracting, setIsInteracting] = useState(false);

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
      <Carousel
        width={screenWidth}
        height={384}
        data={imageUrls}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
          if (Math.abs(absoluteProgress % 1) > 0.1) {
            setIsInteracting(true);
          } else {
            setTimeout(() => setIsInteracting(false), 200);
          }
        }}
        renderItem={({ item, index }) => (
          <TapGestureHandler
            numberOfTaps={1}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) {
                onPress?.(outfit);
              }
            }}
          >
            <View>
              <Image
                source={{ uri: item }}
                className="w-full h-96"
                style={{ width: screenWidth, height: 384 }}
                resizeMode="cover"
              />
            </View>
          </TapGestureHandler>
        )}
        mode="parallax"
        loop={false}
        enabled={imageUrls.length > 1}
        modeConfig={{
          parallaxScrollingScale: 1.0,
          parallaxScrollingOffset: 0,
          parallaxAdjacentItemScale: 1.0,
        }}
        style={{ 
          width: screenWidth,
          overflow: 'hidden'
        }}
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
          color: colors.text,
          fontSize: 12,
          fontWeight: '500'
        }}>{Math.round(progress.value) + 1}/{imageUrls.length}</Text>
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
                backgroundColor: Math.round(progress.value) === index ? colors.white : `${colors.white}66`
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};