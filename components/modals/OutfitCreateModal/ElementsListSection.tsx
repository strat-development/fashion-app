import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { OutfitElementData } from '@/types/createOutfitTypes';
import { Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

interface ElementsListSectionProps {
  outfitElements: OutfitElementData[];
  calculateTotalPrice: (elements: OutfitElementData[]) => number;
  removeImage: (index: number) => void;
  setElementModalVisible: (visible: boolean) => void;
}

export const ElementsListSection: React.FC<ElementsListSectionProps> = ({
  outfitElements,
  calculateTotalPrice,
  removeImage,
  setElementModalVisible
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="font-medium text-base" style={{ color: colors.text }}>
            {/* {t('outfitCreateModal.elements')}
             */}
             Add outfit element
          </Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            {outfitElements.length === 0 
              ? t('outfitCreateModal.elementCount.zero')
              : outfitElements.length === 1 
                ? outfitElements.length + t('outfitCreateModal.elementCount.one')
                : outfitElements.length + t('outfitCreateModal.elementCount.other')
            }
          </Text>
          <Text className={`text-sm ${outfitElements.length === 0 ? 'hidden' : ''}`} style={{ color: colors.textMuted }}>
            {t('outfitCreateModal.totalPrice')} {calculateTotalPrice(outfitElements).toFixed(2)}
          </Text>
        </View>
      </View>

      {outfitElements.length > 0 && (
        <View className="space-y-3 mb-4">
          {outfitElements.map((element, index) => (
            <View key={index} className="flex-row items-center p-3 rounded-lg border" style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border }}>
              <Image
                source={{
                  uri: element.imageUrl?.startsWith('temp://')
                    ? ((element as any)._localUri as string) || element.imageUrl.replace('temp://', 'file://')
                    : element.imageUrl,
                }}
                className="w-12 h-12 rounded-lg mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              />
              <View className="flex-1">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>
                  {element.type}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  {element.price?.toFixed(2)} {element.currency}
                </Text>
              </View>
              <Pressable
                onPress={() => removeImage(index)}
                className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: colors.error }}
              >
                <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                <Trash2 size={16} color={colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => 
          {
            setElementModalVisible(true)}
          }
        className="flex-row items-center justify-center p-4 rounded-lg border-2 border-dashed"
        style={{ borderColor: colors.borderVariant, backgroundColor: 'transparent' }}
      >
        <Plus size={20} color={colors.textMuted} />
        <Text className="ml-2 font-medium" style={{ color: colors.textMuted }}>
          {t('outfitCreateModal.addElement')}
        </Text>
      </Pressable>
    </View>
  );
};