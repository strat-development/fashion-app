import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { useTheme } from '@/providers/themeContext';
import { BlurView } from 'expo-blur';
import { Filter, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface FilterOptions {
  search: string;
  tags: string[];
  elements: string[];
}

interface FeedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export const FeedFilters = ({
  filters,
  onFiltersChange,
  onClearFilters
}: FeedFiltersProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const hexToRgba = (hex: string, alpha: number) => {
    let cleanHex = hex.replace('#', '');
    
    if (cleanHex.length === 4) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('')
        .slice(0, 6);
    } else if (cleanHex.length === 8) {
      cleanHex = cleanHex.slice(0, 6);
    } else if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }

    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const hasActiveFilters = () => {
    return filters.search.length > 0 ||
      filters.tags.length > 0 ||
      filters.elements.length > 0;
  };

  const renderFilterSection = (title: string, items: any[], filterKey: keyof FilterOptions, isColor = false) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12
      }}>{title}</Text>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}>
        {items.map((item) => {
          const isSelected = (filters[filterKey] as string[]).includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => toggleArrayFilter(filterKey, item.name)}
              style={{
                marginRight: 8,
                marginBottom: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isSelected ? colors.accent : colors.border,
                backgroundColor: isSelected
                  ? hexToRgba(colors.accent, 0.15)
                  : hexToRgba(colors.surface, 0.6),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isColor && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      marginRight: 8,
                      backgroundColor: item.hex
                    }}
                  />
                )}
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isSelected ? colors.text : colors.textSecondary
                }}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <>
      {/* Top Search + Filter Bar */}
      <View
        style={{
          position: 'relative',
          backgroundColor: isDark ? 'transparent' : colors.surface,
          borderBottomWidth: 0,
        }}
      >
        <BlurView
          intensity={70}
          tint={isDark ? 'dark' : 'light'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 72,
            zIndex: -1,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        />

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          gap: 12,
        }}>
          {/* Search Field */}
          <View
            style={{
              backgroundColor: 'transparent',
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 100,
              paddingHorizontal: 16,
              height: 44,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              placeholder={t('feedFilters.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={filters.search}
              onChangeText={(text) => updateFilter('search', text)}
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 16,
                marginLeft: 8,
              }}
            />
            {filters.search.length > 0 && (
              <TouchableOpacity onPress={() => updateFilter('search', '')}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              backgroundColor: hasActiveFilters() || showFilters ? colors.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: hasActiveFilters() ? 0.1 : 0,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              borderWidth: hasActiveFilters() || showFilters ? 0 : 1,
              borderColor: hasActiveFilters() || showFilters ? 'transparent' : colors.border,
            }}
          >
            <Filter 
            size={18} 
            color={hasActiveFilters() || showFilters ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Overlay */}
      {showFilters && (
        <View
          style={{
            position: 'absolute',
            top: 72,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: hexToRgba(colors.background, 0.9),
            zIndex: 50,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
          }}
        >
          <ScrollView
            className='backdrop-blur-2xl'
            style={{ padding: 16 }}
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {renderFilterSection(t('feedFilters.sections.styleTags'), OutfitStylesTags, 'tags')}
            {renderFilterSection(t('feedFilters.sections.elements'), OutfitElements, 'elements')}

            {hasActiveFilters() && (
              <TouchableOpacity
                onPress={() => {
                  onClearFilters();
                  setShowFilters(false);
                }}
                style={{
                  alignSelf: 'center',
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  marginTop: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text style={{
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500'
                }}>
                  {t('feedFilters.clearFilters')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}
    </>
  );
};
