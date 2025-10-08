import { Select, SelectBackdrop, SelectContent, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { OutfitElements } from '@/consts/chatFilterConsts';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { Camera, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

interface ElementFormFieldsProps {
  elementControl: any;
  elementErrors: any;
  watchElement: any;
  selectedImageName: string | null;
  handleImageSelect: () => void;
  URL_PATTERN: RegExp;
  setElementValue: any;
  imagePreviewUri?: string;
  onRemoveSelectedImage?: () => void;
}

export const ElementFormFields: React.FC<ElementFormFieldsProps> = ({
  elementControl,
  elementErrors,
  watchElement,
  selectedImageName,
  handleImageSelect,
  URL_PATTERN,
  imagePreviewUri,
  onRemoveSelectedImage
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const imageUrl = watchElement('imageUrl');

  return (
    <>
      {/* Element Type - Select */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.elementType')}
        </Text>
        <Controller
          control={elementControl}
          name="type"
          rules={{ required: t('outfitCreateModal.errors.elementTypeRequired') }}
          render={({ field: { onChange, value } }) => (
            <Select onValueChange={onChange} selectedValue={value}>
              <SelectTrigger variant="outline" size="xl" style={{ borderColor: elementErrors.type ? colors.error : colors.border }}>
                <SelectInput placeholder={t('outfitCreateModal.placeholders.elementType') as string} style={{ color: colors.text }} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  {OutfitElements.map((element) => (
                    <SelectItem key={element.name} label={element.name} value={element.name} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
        />
        {elementErrors.type && (
          <Text className="text-xs mt-1" style={{ color: colors.error }}>
            {elementErrors.type.message}
          </Text>
        )}
      </View>

      {/* Image Upload */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.elementImage')}
        </Text>
        {selectedImageName ? (
          <View className="border rounded-lg p-3 flex-row items-center justify-between" style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border }}>
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: imagePreviewUri || (imageUrl?.startsWith('temp://') ? imageUrl.replace('temp://', 'file://') : imageUrl) }}
                className="w-12 h-12 rounded-lg mr-3"
                style={{ backgroundColor: colors.surfaceVariant }}
              />
              <View className="flex-1">
                <Text className="text-sm font-medium" style={{ color: colors.text }}>
                  {selectedImageName}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  {t('outfitCreateModal.imageReady')}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onRemoveSelectedImage}
              className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
              style={{ backgroundColor: colors.error }}>
              <Trash2 size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleImageSelect}
            className="border-2 border-dashed rounded-lg p-6 items-center justify-center"
            style={{ borderColor: colors.borderVariant, backgroundColor: colors.surfaceVariant }}
          >
            <Camera size={32} color={colors.textMuted} />
            <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>
              {t('outfitCreateModal.tapToSelectImage')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Price */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.price')}
        </Text>
        <View className="flex-row space-x-2">
          <View className="flex-1">
            <Controller
              control={elementControl}
              name="price"
              rules={{
                required: t('outfitCreateModal.errors.priceRequired'),
                min: { value: 0, message: t('outfitCreateModal.errors.priceMin') }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || null)}
                  onBlur={onBlur}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-lg text-base"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: elementErrors.price ? colors.error : colors.border,
                    color: colors.text
                  }}
                />
              )}
            />
          </View>
          <View className="w-20">
            <Controller
              control={elementControl}
              name="currency"
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger
                    variant="outline"
                    size="xl"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <SelectInput style={{ color: colors.text, textAlign: 'center' }} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectItem label="USD" value="USD" />
                      <SelectItem label="EUR" value="EUR" />
                      <SelectItem label="GBP" value="GBP" />
                      <SelectItem label="PLN" value="PLN" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
          </View>
        </View>
        {elementErrors.price && (
          <Text className="text-xs mt-1" style={{ color: colors.error }}>
            {elementErrors.price.message}
          </Text>
        )}
      </View>

      {/* Shop URL */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.shopUrl')} ({t('outfitCreateModal.optional')})
        </Text>
        <Controller
          control={elementControl}
          name="siteUrl"
          rules={{
            pattern: {
              value: URL_PATTERN,
              message: t('outfitCreateModal.errors.invalidUrl')
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('outfitCreateModal.placeholders.shopUrl')}
              placeholderTextColor={colors.textMuted}
              className="px-4 py-3 rounded-lg text-base"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: elementErrors.siteUrl ? colors.error : colors.border,
                color: colors.text
              }}
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
        />
        {elementErrors.siteUrl && (
          <Text className="text-xs mt-1" style={{ color: colors.error }}>
            {elementErrors.siteUrl.message}
          </Text>
        )}
      </View>
    </>
  );
};