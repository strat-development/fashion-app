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
    <View className="mb-6">
      <Text className="text-white text-lg font-semibold mb-3">{title}</Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => {
          const isSelected = (filters[filterKey] as string[]).includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => toggleArrayFilter(filterKey, item.name)}
              className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                isSelected 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500' 
                  : 'bg-gray-900 border-gray-700'
              }`}
            >
              <View className="flex-row items-center">
                {isColor && (
                  <View 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.hex }}
                  />
                )}
                <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
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
    <View className="bg-black border-b border-gray-600">
      {/* Search Bar with Filter Button */}
      <View className="px-4 py-4">
        <View className="flex-row items-center space-x-3">
          <View 
            style={{ backgroundColor: '#1f1f1fcc' }}
            className="flex-1 flex-row items-center rounded-full px-4 py-3 border border-gray-600"
          >
            <Search size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search outfits..."
              placeholderTextColor="#6B7280"
              value={filters.search}
              onChangeText={(text) => updateFilter('search', text)}
              className="flex-1 text-white text-base ml-3"
            />
            {filters.search.length > 0 && (
              <TouchableOpacity onPress={() => updateFilter('search', '')}>
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-full ${
              hasActiveFilters() || showFilters
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500'
                : 'border border-gray-600'
            }`}
            style={
              !(hasActiveFilters() || showFilters) 
                ? { backgroundColor: '#1f1f1fcc' }
                : undefined
            }
          >
            <Filter size={18} color={hasActiveFilters() || showFilters ? "#FFFFFF" : "#9CA3AF"} />
            {hasActiveFilters() && (
              <View className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-3 h-3 border-2 border-black" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Filters */}
      {showFilters && (
        <View className="px-4 pb-6 border-t border-gray-800">
          <ScrollView 
            className="max-h-80"
            showsVerticalScrollIndicator={false}
          >
            <View className="pt-6">
              {renderFilterSection('Style Tags', OutfitStylesTags, 'tags')}
              {renderFilterSection('Elements', OutfitElements, 'elements')}
              
              {/* Clear Filters Button */}
              {hasActiveFilters() && (
                <TouchableOpacity
                  onPress={() => {
                    onClearFilters();
                    setShowFilters(false);
                  }}
                  className="bg-gray-900 border border-gray-700 rounded-full py-3 px-6 mt-2"
                >
                  <Text className="text-gray-300 text-center text-base font-medium">
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
