import { FilterOptions } from '@/components/outfits/FeedFilters';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useFeedFilters() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    tags: [],
    elements: [],
  });

  const [debouncedFilters, setDebouncedFilters] = useState<FilterOptions>(filters);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      tags: [],
      elements: [],
    });
  }, []);

  return {
    filters,
    debouncedFilters,
    handleFiltersChange,
    handleClearFilters,
    setDebouncedFilters
  };
}
