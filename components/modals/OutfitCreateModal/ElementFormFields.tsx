import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { Camera, Trash2 } from 'lucide-react-native';
import { useTheme, ThemedGradient } from '@/providers/themeContext';
import { Select, SelectBackdrop, SelectContent, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { OutfitElements } from '@/consts/chatFilterConsts';

interface ElementFormFieldsProps {
  elementControl: any;
  elementErrors: any;
  watchElement: any;
  selectedImageName: string | null;
  handleImageSelect: () => void;
  URL_PATTERN: RegExp;
  setElementValue: any;
}

export const ElementFormFields: React.FC<ElementFormFieldsProps> = ({
  elementControl,
  elementErrors,
  watchElement,
  selectedImageName,
  handleImageSelect,
  URL_PATTERN,
  setElementValue
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const imageUrl = watchElement('imageUrl');

  return (
    <>
      {/* Element Type */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.elementType')}
        </Text>
        <Controller
          control={elementControl}
          name="type"
          rules={{ required: t('outfitCreateModal.errors.elementTypeRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('outfitCreateModal.placeholders.elementType')}
              placeholderTextColor={colors.textMuted}
              className="px-4 py-3 rounded-lg text-base"
              style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderWidth: 1, 
                borderColor: elementErrors.type ? colors.error : colors.border, 
                color: colors.text 
              }}
              maxLength={50}
            />
          )}
        />
        {elementErrors.type && (
          <Text className="text-xs mt-1" style={{ color: colors.error }}>
            {elementErrors.type.message}
          </Text>
        )}
      </View>

      {/* Element Category - using Select */}
      <View className="mb-4">
        <Text className="font-medium text-base mb-2" style={{ color: colors.text }}>
          {t('outfitCreateModal.elementCategory')}
        </Text>
        <Text className="text-sm mb-2" style={{ color: colors.textMuted }}>
          {t('outfitCreateModal.selectFromOptions')}
        </Text>
        <View className="flex-row flex-wrap">
          {OutfitElements.map((element) => (
            <Pressable
              key={element.name}
              onPress={() => setElementValue('type', element.name)}
              className="px-3 py-2 mr-2 mb-2 rounded-lg border"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border
              }}
            >
              <Text className="text-sm" style={{ color: colors.text }}>
                {element.name}
              </Text>
            </Pressable>
          ))}
        </View>
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
                source={{ uri: imageUrl?.startsWith('temp://') ? imageUrl.replace('temp://', 'file://') : imageUrl }}
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
              onPress={() => {}}
              className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
              style={{ backgroundColor: colors.error }}
            >
              <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <Trash2 size={16} color={colors.white} />
            </Pressable>
            <View className="mt-2 flex-row items-center justify-center py-1 px-2 rounded-full" 
                  style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.12)' }}>
              <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
              <Text className="text-xs" style={{ color: colors.success }}>
                {t('outfitCreateModal.imageSelected')}
              </Text>
            </View>
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
                  <SelectTrigger variant="outline" size="md">
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