import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { Filter, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
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

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
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
    <View className="mb-4">
      <Text className="text-white text-base font-semibold mb-2">{title}</Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => {
          const isSelected = (filters[filterKey] as string[]).includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => toggleArrayFilter(filterKey, item.name)}
              className={`mr-2 mb-2 px-2.5 py-1.5 rounded-full border ${
                isSelected 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-white/30'
              }`}
            >
              <View className="flex-row items-center">
                {isColor && (
                  <View 
                    className="w-2.5 h-2.5 rounded-full mr-1.5"
                    style={{ backgroundColor: item.hex }}
                  />
                )}
                <Text className={`text-xs ${isSelected ? 'text-black' : 'text-white'}`}>
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
    <View className="bg-black/40 backdrop-blur-sm border-b border-white/10">
      {/* Search Bar with Filter Button */}
      <View className="px-4 py-3">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-white/10 rounded-lg px-3 py-2.5 border border-white/20">
            <Search size={18} color="white" />
            <TextInput
              placeholder="Search outfits..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={filters.search}
              onChangeText={(text) => updateFilter('search', text)}
              className="flex-1 text-white text-sm ml-3"
            />
            {filters.search.length > 0 && (
              <TouchableOpacity onPress={() => updateFilter('search', '')}>
                <X size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Compact Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg border ${
              hasActiveFilters() || showFilters
                ? 'bg-white/20 border-white/40'
                : 'bg-white/10 border-white/20'
            }`}
          >
            <Filter size={18} color="white" />
            {hasActiveFilters() && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Filters */}
      {showFilters && (
        <View className="px-4 pb-3 border-t border-white/10">
          <ScrollView 
            className="max-h-80"
            showsVerticalScrollIndicator={false}
          >
            <View className="pt-3">
              {renderFilterSection('Style Tags', OutfitStylesTags, 'tags')}
              {renderFilterSection('Elements', OutfitElements, 'elements')}
              
              {/* Clear Filters Button */}
              {hasActiveFilters() && (
                <TouchableOpacity
                  onPress={() => {
                    onClearFilters();
                    setShowFilters(false);
                  }}
                  className="bg-red-500/20 border border-red-500/40 rounded-lg py-2.5 px-3 mt-3"
                >
                  <Text className="text-red-400 text-center text-sm font-medium">
                    Clear All Filters
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
