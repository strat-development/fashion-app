import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/providers/themeContext';

interface OutfitFormFieldsProps {
  control: any;
  errors: any;
  outfitName: string;
  description: string;
}

export const OutfitFormFields: React.FC<OutfitFormFieldsProps> = ({
  control,
  errors,
  outfitName,
  description
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      {/* Title Field */}
      <View className="mb-6">
        <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>
          {t('outfitCreateModal.name')}
        </Text>
        <Controller
          control={control}
          name="outfit_name"
          rules={{ required: t('outfitCreateModal.errors.nameRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('outfitCreateModal.placeholders.name')}
              placeholderTextColor={colors.textMuted}
              className={`px-4 py-3 rounded-lg text-base`}
              style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderWidth: 1, 
                borderColor: errors.outfit_name ? colors.error : colors.border, 
                color: colors.text 
              }}
              maxLength={50}
            />
          )}
        />
        <View className="flex-row items-center justify-between mt-1">
          {errors.outfit_name ? (
            <Text className="text-xs" style={{ color: colors.error }}>
              {errors.outfit_name.message}
            </Text>
          ) : (
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {outfitName?.length || 0} / 50
            </Text>
          )}
        </View>
      </View>

      {/* Description Field */}
      <View className="mb-6">
        <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>
          {t('outfitCreateModal.description')}
        </Text>
        <Controller
          control={control}
          name="description"
          rules={{ required: t('outfitCreateModal.errors.descriptionRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('outfitCreateModal.placeholders.description')}
              placeholderTextColor={colors.textMuted}
              className={`px-4 py-3 rounded-lg text-base`}
              style={{ 
                backgroundColor: colors.surfaceVariant, 
                borderWidth: 1, 
                borderColor: errors.description ? colors.error : colors.border, 
                color: colors.text 
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          )}
        />
        <View className="flex-row items-center justify-between mt-1">
          {errors.description ? (
            <Text className="text-xs" style={{ color: colors.error }}>
              {errors.description.message}
            </Text>
          ) : (
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {description?.length || 0}
            </Text>
          )}
        </View>
      </View>
    </>
  );
};