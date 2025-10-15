import { Currencies } from "@/consts/userSettings";
import { ThemedGradient, useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { OutfitElementData } from "@/types/createOutfitTypes";
import { ExternalLink, Shirt, Tag } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import { FlatList, Image, Linking, Pressable, Text, View, useWindowDimensions } from "react-native";

const exchangeRateCache: Record<string, number> = {};

interface OutfitElementDataWithCurrency extends OutfitElementData {
  currency: string;
}

interface OutfitDetailImagesProps {
  imageUrls: string[];
  elementsData?: OutfitElementDataWithCurrency[];
}

export default function OutfitDetailImages({ imageUrls, elementsData }: OutfitDetailImagesProps) {
  const { preferredCurrency } = useUserContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [convertedPrices, setConvertedPrices] = useState<(number | null)[]>(
    elementsData ? elementsData.map((el) => (typeof el.price === 'number' ? el.price : null)) : []
  );
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const singleH = Math.min(520, Math.max(280, Math.floor(height * 0.5)));
  const multiH = Math.min(420, Math.max(260, Math.floor(height * 0.4)));
  const cardW = width - 32;

  useEffect(() => {
    const convertPrices = async () => {
      if (!elementsData) {
        console.log("No elementsData provided");

        return;
      }

      const newConvertedPrices = await Promise.all(
        elementsData.map(async (element) => {
          if (typeof element.price !== 'number' || !element.currency || element.currency.toUpperCase() === preferredCurrency.toUpperCase()) {
            return typeof element.price === 'number' ? element.price : null;
          }

          const elementCurrency = element.currency.toUpperCase();
          const preferredCurrencyUpper = preferredCurrency.toUpperCase();

          if (!Currencies.some(c => c.name === elementCurrency) || !Currencies.some(c => c.name === preferredCurrencyUpper)) {
            console.warn(`Invalid currency detected: element.currency=${elementCurrency}, preferredCurrency=${preferredCurrencyUpper}`);

            return element.price;
          }

          const cacheKey = `${elementCurrency}_${preferredCurrencyUpper}`;
          if (exchangeRateCache[cacheKey]) {
            const converted = (element.price as number) * exchangeRateCache[cacheKey];

            return Number(converted.toFixed(2));
          }

          try {
            const fromCurrencyLower = elementCurrency.toLowerCase();
            const toCurrencyLower = preferredCurrencyUpper.toLowerCase();

            const response = await fetch(
              `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrencyLower}.min.json`
            );
            const data = await response.json();
            const rate = data[fromCurrencyLower][toCurrencyLower];

            if (rate) {
              exchangeRateCache[cacheKey] = rate;

              const converted = (element.price as number) * rate;

              return Number(converted.toFixed(2));
            } else {
              console.warn(`Rate not found for ${cacheKey}`);

              return typeof element.price === 'number' ? element.price : null;
            }
          } catch (error) {
            console.error(`Currency conversion error for ${cacheKey}:`, error);

            return typeof element.price === 'number' ? element.price : null;
          }
        })
      );

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
      <View style={{ width: cardW, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 6,
          backgroundColor: colors.surface,
          borderRadius: 24,
          marginVertical: 8,
        }}>
          <Image
            source={{ uri: item }}
            style={{ width: cardW - 8, height: multiH, borderRadius: 24 }}
            resizeMode="cover"
          />

          {/* Element Info Overlay */}
          {elementData && (
            <View style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              padding: 16,
              backgroundColor: 'rgba(0,0,0,0.60)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Shirt size={16} color="#9CA3AF" />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }}>{elementData.type}</Text>
                  </View>
                  {convertedPrice !== null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#4ade80', fontWeight: '600', fontSize: 15, marginLeft: 4 }}>
                        {displaySymbol}{convertedPrice.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
                {elementData.siteUrl && (
                  <Pressable
                    onPress={handleSitePress}
                    style={{ borderRadius: 999, overflow: 'hidden', marginLeft: 8 }}
                  >
                    <ThemedGradient style={{ padding: 12, borderRadius: 999 }}>
                      <ExternalLink size={18} color="#FFFFFF" />
                    </ThemedGradient>
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
    <View style={{ marginBottom: 28 }}>
      {imageUrls.length === 1 ? (
        <View style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 6,
          backgroundColor: colors.surface,
          borderRadius: 24,
          marginVertical: 8,
        }}>
          <Image
            source={{ uri: imageUrls[0] }}
            style={{ width: '100%', height: singleH, borderRadius: 24 }}
            resizeMode="cover"
          />

          {/* Single Image Element Info Overlay */}
          {elementsData?.[0] && (
            <View style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              padding: 18,
              backgroundColor: 'rgba(0,0,0,0.60)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Tag size={18} color="#9CA3AF" />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, marginLeft: 8 }}>{elementsData[0].type}</Text>
                  </View>
                  {convertedPrices[0] !== null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#4ade80', fontWeight: '600', fontSize: 17, marginLeft: 4 }}>
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
                    style={{ borderRadius: 999, overflow: 'hidden', marginLeft: 8 }}
                  >
                    <ThemedGradient style={{ padding: 14, borderRadius: 999 }}>
                      <ExternalLink size={20} color="#FFFFFF" />
                    </ThemedGradient>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={{ position: 'relative', alignItems: 'center' }}>
          <FlatList
            data={imageUrls}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems.length > 0) {
                setCurrentIndex(viewableItems[0].index ?? 0);
              }
            }}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50
            }}
            style={{
              width: cardW,
              overflow: 'visible',
            }}
            contentContainerStyle={{ alignItems: 'center' }}
          />

          {/* Image counter */}
          <View style={{
            position: 'absolute',
            top: 16,
            right: 24,
            backgroundColor: `${colors.background}CC`,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${colors.border}4D`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: 0.5,
            }}>{currentIndex + 1}/{imageUrls.length}</Text>
          </View>

          {/* Custom pagination dots */}
          {imageUrls.length <= 5 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
              {imageUrls.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 4,
                    backgroundColor: currentIndex === index ? '#fff' : 'rgba(255,255,255,0.4)',
                    borderWidth: currentIndex === index ? 1 : 0,
                    borderColor: currentIndex === index ? '#4ade80' : 'transparent',
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}