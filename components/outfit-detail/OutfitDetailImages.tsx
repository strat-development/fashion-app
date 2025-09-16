import { Currencies } from "@/consts/userSettings";
import { useUserContext } from "@/providers/userContext";
import { OutfitElementData } from "@/types/createOutfitTypes";
import { LinearGradient } from "expo-linear-gradient";
import { ExternalLink, Tag } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useTranslation } from "react-i18next";

const exchangeRateCache: Record<string, number> = {};

interface OutfitElementDataWithCurrency extends OutfitElementData {
  currency: string;
}

interface OutfitDetailImagesProps {
  imageUrls: string[];
  elementsData?: OutfitElementDataWithCurrency[];
}

export default function OutfitDetailImages({ imageUrls, elementsData }: OutfitDetailImagesProps) {
  const { t } = useTranslation();
  const { preferredCurrency } = useUserContext();
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [convertedPrices, setConvertedPrices] = useState<(number | null)[]>(elementsData?.map(el => el.price) || []);

  const { width, height } = useWindowDimensions();
  const singleH = Math.min(520, Math.max(280, Math.floor(height * 0.55)));
  const multiH = Math.min(450, Math.max(300, Math.floor(height * 0.45)));
  const cardW = width - 32;

  useEffect(() => {
    const convertPrices = async () => {
      if (!elementsData) {
        console.log("No elementsData provided");
        return;
      }

      console.log("Preferred currency:", preferredCurrency);
      console.log("Elements data:", JSON.stringify(elementsData));

      const newConvertedPrices = await Promise.all(
        elementsData.map(async (element, index) => {
          if (!element.price || !element.currency || element.currency.toUpperCase() === preferredCurrency.toUpperCase()) {
            console.log(`No conversion needed for ${element.type} (index ${index}): price=${element.price}, currency=${element.currency}, preferred=${preferredCurrency}`);
            return element.price;
          }

          const elementCurrency = element.currency.toUpperCase();
          const preferredCurrencyUpper = preferredCurrency.toUpperCase();

          if (!Currencies.some(c => c.name === elementCurrency) || !Currencies.some(c => c.name === preferredCurrencyUpper)) {
            console.warn(`Invalid currency detected: element.currency=${elementCurrency}, preferredCurrency=${preferredCurrencyUpper}`);
            
            return element.price;
          }

          const cacheKey = `${elementCurrency}_${preferredCurrencyUpper}`;
          if (exchangeRateCache[cacheKey]) {
            const converted = element.price * exchangeRateCache[cacheKey];

            console.log(`Cache hit for ${cacheKey}: rate=${exchangeRateCache[cacheKey]}, original=${element.price}, converted=${converted}`);

            return Number(converted.toFixed(2));
          }

          try {
            const fromCurrencyLower = elementCurrency.toLowerCase();
            const toCurrencyLower = preferredCurrencyUpper.toLowerCase();

            console.log(`Fetching conversion rate: ${elementCurrency} to ${preferredCurrencyUpper}`);

            const response = await fetch(
              `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrencyLower}.min.json`
            );
            const data = await response.json();
            const rate = data[fromCurrencyLower][toCurrencyLower];

            if (rate) {
              exchangeRateCache[cacheKey] = rate;

              const converted = element.price * rate;

              console.log(`Conversion success: ${cacheKey}, rate=${rate}, converted=${converted}`);

              return Number(converted.toFixed(2));
            } else {
              console.warn(`Rate not found for ${cacheKey}`);

              return element.price;
            }
          } catch (error) {
            console.error(`Currency conversion error for ${cacheKey}:`, error);

            return element.price;
          }
        })
      );

      console.log("Converted prices:", newConvertedPrices);
      setConvertedPrices(newConvertedPrices);
    };

    convertPrices();
  }, [elementsData, preferredCurrency]);

  if (imageUrls.length === 0) return null;

  const displaySymbol = Currencies.find(c => c.name === preferredCurrency)?.symbol || preferredCurrency;

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => {
    const elementData = elementsData?.[index];
    const convertedPrice = convertedPrices[index];

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

                  {convertedPrice !== null && (
                    <View className="flex-row items-center">
                      <Text className="text-green-400 font-medium text-sm ml-1">
                        {displaySymbol}{convertedPrice.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                {elementData.siteUrl && (
                  <Pressable
                    onPress={handleSitePress}
                    style={{ borderRadius: 999, overflow: 'hidden' }}
                  >
                    <LinearGradient
                      colors={['#7e22ce', '#db2777']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 10, borderRadius: 999 }}
                    >
                      <ExternalLink size={16} color="#FFFFFF" />
                    </LinearGradient>
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

                  {convertedPrices[0] !== null && (
                    <View className="flex-row items-center">
                      <Text className="text-green-400 font-medium text-lg ml-1">
                        {displaySymbol}{convertedPrices[0].toFixed(2)}
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
                    style={{ borderRadius: 999, overflow: 'hidden' }}
                  >
                    <LinearGradient
                      colors={['#7e22ce', '#db2777']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 12, borderRadius: 999 }}
                    >
                      <ExternalLink size={18} color="#FFFFFF" />
                    </LinearGradient>
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
                  className={`w-2 h-2 rounded-full mx-1 ${currentIndex === index ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}