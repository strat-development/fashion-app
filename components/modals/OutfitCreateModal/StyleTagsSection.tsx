import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/providers/themeContext';
import { OutfitStylesTags } from '@/consts/chatFilterConsts';

interface StyleTagsSectionProps {
  outfitTags: string[];
  toggleTag: (tag: string) => void;
  errors: any;
}

export const StyleTagsSection: React.FC<StyleTagsSectionProps> = ({
  outfitTags,
  toggleTag,
  errors
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="mb-6">
      <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>
        {t('outfitCreateModal.styleTags')}
      </Text>
      <View className="flex-row flex-wrap">
        {OutfitStylesTags.map((style) => {
          const selected = outfitTags.includes(style.name);
          return (
            <Pressable
              key={style.name}
              onPress={() => toggleTag(style.name)}
              className={`px-3 py-1.5 rounded-full mr-2 mb-2 border`}
              style={{
                backgroundColor: selected ? 'rgba(168,85,247,0.50)' : 'rgba(0, 0, 0, .02)',
                borderColor: selected ? '#A855F7' : colors.borderVariant,
              }}
            >
              <Text className="text-xs" style={{ color: selected ? colors.white : colors.textMuted }}>
                {style.name}
              </Text>
            </Pressable>
          );
        })}
        {errors.outfit_tags && (
          <Text className="text-xs w-full" style={{ color: colors.error }}>
            {t('outfitCreateModal.errors.styleTagsRequired')}
          </Text>
        )}
      </View>
    </View>
  );
};