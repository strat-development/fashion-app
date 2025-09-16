import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { Filter, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from "react-i18next";

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

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

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
        fontSize: 18, 
        fontWeight: '600', 
        marginBottom: 12 
      }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                backgroundColor: isSelected ? 'transparent' : colors.surface,
                borderColor: isSelected ? 'transparent' : colors.border,
                overflow: 'hidden'
              }}
            >
              {isSelected && (
                <ThemedGradient
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              )}
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
                  color: isSelected ? colors.white : colors.textSecondary
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
    <View style={{ 
      backgroundColor: colors.background, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border 
    }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View 
            style={{
              backgroundColor: colors.surface,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: colors.border
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
                marginLeft: 12
              }}
            />
            {filters.search.length > 0 && (
              <TouchableOpacity onPress={() => updateFilter('search', '')}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              padding: 12,
              borderRadius: 999,
              backgroundColor: (hasActiveFilters() || showFilters) ? 'transparent' : colors.surface,
              borderWidth: 1,
              borderColor: (hasActiveFilters() || showFilters) ? 'transparent' : colors.border,
              overflow: 'hidden'
            }}
          >
            {(hasActiveFilters() || showFilters) && (
              <ThemedGradient
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
            <View style={{ zIndex: 1 }}>
              <Filter size={18} color={(hasActiveFilters() || showFilters) ? colors.white : colors.textSecondary} />
            </View>
            {hasActiveFilters() && (
              <ThemedGradient
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  borderRadius: 6,
                  width: 12,
                  height: 12,
                  borderWidth: 2,
                  borderColor: colors.background
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={{ 
          paddingHorizontal: 16, 
          paddingBottom: 24, 
          borderTopWidth: 1, 
          borderTopColor: colors.border 
        }}>
          <ScrollView 
            style={{ maxHeight: 320 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingTop: 24 }}>
              {renderFilterSection(t('feedFilters.sections.styleTags'), OutfitStylesTags, 'tags')}
              {renderFilterSection(t('feedFilters.sections.elements'), OutfitElements, 'elements')}
              
              {hasActiveFilters() && (
                <TouchableOpacity
                  onPress={() => {
                    onClearFilters();
                    setShowFilters(false);
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 999,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    marginTop: 8
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
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};