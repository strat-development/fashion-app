import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { FilterSection, UnifiedFilterBar } from '@/components/ui/UnifiedFilterBar';
import { Currencies, OutfitColors, OutfitElements, OutfitFit, OutfitGender, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { useTheme } from '@/providers/themeContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';

interface AIChatFiltersProps {
  outfitGender: string[];
  setOutfitGender: React.Dispatch<React.SetStateAction<string[]>>;
  outfitTag: string[];
  setOutfitTag: React.Dispatch<React.SetStateAction<string[]>>;
  outfitFit: string[];
  setOutfitFit: React.Dispatch<React.SetStateAction<string[]>>;
  outfitColor: string[];
  setOutfitColor: React.Dispatch<React.SetStateAction<string[]>>;
  outfitElement: string[];
  setOutfitElement: React.Dispatch<React.SetStateAction<string[]>>;
  lowestPrice: number;
  setLowestPrice: (n: number) => void;
  highestPrice: number;
  setHighestPrice: (n: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AIChatFilters = ({
  outfitGender,
  setOutfitGender,
  outfitTag,
  setOutfitTag,
  outfitFit,
  setOutfitFit,
  outfitColor,
  setOutfitColor,
  outfitElement,
  setOutfitElement,
  lowestPrice,
  setLowestPrice,
  highestPrice,
  setHighestPrice,
  currency,
  setCurrency,
  isOpen,
  onToggle,
}: AIChatFiltersProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const toggleArrayFilter = (filterKey: string, value: string) => {
    const filterSetters: Record<string, React.Dispatch<React.SetStateAction<string[]>>> = {
      gender: setOutfitGender,
      tags: setOutfitTag,
      fit: setOutfitFit,
      colors: setOutfitColor,
      elements: setOutfitElement,
    };

    const setter = filterSetters[filterKey];
    if (setter) {
      setter((prev) => 
        prev.includes(value) 
          ? prev.filter((item) => item !== value) 
          : [...prev, value]
      );
    }
  };

  const clearAllFilters = () => {
    setOutfitGender(['']);
    setOutfitTag(['']);
    setOutfitFit(['']);
    setOutfitColor(['']);
    setOutfitElement(['']);
    setLowestPrice(0);
    setHighestPrice(0);
    setCurrency('');
  };

  const hasActiveFilters = () => {
    return (
      outfitGender.some(g => g !== '') ||
      outfitTag.some(t => t !== '') ||
      outfitFit.some(f => f !== '') ||
      outfitColor.some(c => c !== '') ||
      outfitElement.some(e => e !== '') ||
      lowestPrice > 0 ||
      highestPrice > 0 ||
      currency !== ''
    );
  };

  const filterSections: FilterSection[] = useMemo(() => [
    {
      title: t('chatSection.selectGender'),
      items: OutfitGender.map(g => ({ ...g, name: t(`chatSection.genders.${g.name.toLowerCase()}`) })),
      filterKey: 'gender',
    },
    {
      title: t('chatSection.selectOutfitStyles'),
      items: OutfitStylesTags,
      filterKey: 'tags',
    },
    {
      title: t('chatSection.selectFit'),
      items: OutfitFit,
      filterKey: 'fit',
    },
    {
      title: t('chatSection.selectColors'),
      items: OutfitColors,
      filterKey: 'colors',
      isColor: true,
    },
    {
      title: t('chatSection.selectElements'),
      items: OutfitElements,
      filterKey: 'elements',
    },
  ], [t]);

  const selectedFilters = useMemo(() => ({
    gender: outfitGender.filter(g => g !== ''),
    tags: outfitTag.filter(t => t !== ''),
    fit: outfitFit.filter(f => f !== ''),
    colors: outfitColor.filter(c => c !== ''),
    elements: outfitElement.filter(e => e !== ''),
  }), [outfitGender, outfitTag, outfitFit, outfitColor, outfitElement]);

  const customFilterContent = (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12
      }}>{t('chatSection.priceRange')}</Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('chatSection.from')}</Text>
          <TextInput
            value={lowestPrice > 0 ? `${lowestPrice}` : ''}
            onChangeText={(text) => setLowestPrice(Number(text) || 0)}
            placeholder={t('chatSection.placeholders.lowestPrice')}
            placeholderTextColor={colors.textMuted}
            keyboardType='numeric'
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 8, 
              backgroundColor: colors.surface, 
              borderWidth: 1, 
              borderColor: colors.border, 
              color: colors.text, 
              borderRadius: 8,
              fontSize: 14
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('chatSection.to')}</Text>
          <TextInput
            value={highestPrice > 0 ? `${highestPrice}` : ''}
            onChangeText={(text) => setHighestPrice(Number(text) || 0)}
            placeholder={t('chatSection.placeholders.highestPrice')}
            placeholderTextColor={colors.textMuted}
            keyboardType='numeric'
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 8, 
              backgroundColor: colors.surface, 
              borderWidth: 1, 
              borderColor: colors.border, 
              color: colors.text, 
              borderRadius: 8,
              fontSize: 14
            }}
          />
        </View>
      </View>

      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('chatSection.currency')}</Text>
      <Select selectedValue={currency} onValueChange={(value: string) => setCurrency(value)}>
        <SelectTrigger className='rounded-lg h-10' style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
          <SelectInput 
            placeholder={t('chatSection.placeholders.currency')} 
            value={currency} 
            style={{ color: colors.text, fontSize: 14 }} 
          />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, overflow: 'hidden' }}>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {Currencies.map((currencyItem: any) => (
              <SelectItem 
                key={currencyItem.name} 
                value={currencyItem.name} 
                label={t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}
                </Text>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </View>
  );

  return (
    <UnifiedFilterBar
      showSearch={false}
      showTopBar={false}
      isOpen={isOpen}
      onToggle={onToggle}
      filterSections={filterSections}
      selectedFilters={selectedFilters}
      onFilterToggle={toggleArrayFilter}
      onClearFilters={clearAllFilters}
      customFilterContent={customFilterContent}
      hasActiveFilters={hasActiveFilters}
      t={t}
    />
  );
};
