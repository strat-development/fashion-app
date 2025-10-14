import { UnifiedFilterBar } from '@/components/ui/UnifiedFilterBar';
import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import React, { useMemo } from 'react';
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

export const FeedFilters = ({
  filters,
  onFiltersChange,
  onClearFilters
}: FeedFiltersProps) => {
  const { t } = useTranslation();

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (filterKey: string, value: string) => {
    const key = filterKey as keyof FilterOptions;
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

  const filterSections = useMemo(() => [
    {
      title: t('feedFilters.sections.styleTags'),
      items: OutfitStylesTags,
      filterKey: 'tags',
    },
    {
      title: t('feedFilters.sections.elements'),
      items: OutfitElements,
      filterKey: 'elements',
    },
  ], [t]);

  const selectedFilters = useMemo(() => ({
    tags: filters.tags,
    elements: filters.elements,
  }), [filters.tags, filters.elements]);

  return (
    <UnifiedFilterBar
      searchValue={filters.search}
      onSearchChange={(text) => updateFilter('search', text)}
      searchPlaceholder={t('feedFilters.searchPlaceholder')}
      showSearch={true}
      filterSections={filterSections}
      selectedFilters={selectedFilters}
      onFilterToggle={toggleArrayFilter}
      onClearFilters={onClearFilters}
      hasActiveFilters={hasActiveFilters}
      t={t}
    />
  );
};
