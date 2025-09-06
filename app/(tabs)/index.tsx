import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShareModal } from "@/components/modals/ShareModal";
import CommentSection from "@/components/outfits/CommentSection";
import { FeedFilters, FilterOptions } from "@/components/outfits/FeedFilters";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useFetchFeedOutfits } from "@/fetchers/outfits/fetchFeedOutfits";
import { useFetchFilteredFeedOutfits } from "@/fetchers/outfits/fetchFilteredFeedOutfits";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { OutfitData } from "@/types/createOutfitTypes";
import { enrichOutfit } from "@/utils/enrichOutfit";
import { router } from "expo-router";
import { Grid } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

interface FeedSectionProps {
    refreshing: boolean;
    onPress?: (outfit: OutfitData) => void;
}

export default function FeedSection({ refreshing }: FeedSectionProps) {
    const { colors } = useTheme();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        tags: [],
        elements: []
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

    const [localSavedOutfitIds, setLocalSavedOutfitIds] = useState<Set<string>>(new Set());
    
    const savedOutfitIds = useMemo(() => new Set([
        ...savedOutfits?.map(outfit => outfit.outfit_id) || [],
        ...localSavedOutfitIds
    ]), [savedOutfits, Array.from(localSavedOutfitIds)]);
    
    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 25;

    const hasActiveFilters = debouncedFilters.search.trim() || 
                             debouncedFilters.tags.length > 0 ||
                             debouncedFilters.elements.length > 0;

    const filteredQuery = useFetchFilteredFeedOutfits(page, pageSize, debouncedFilters);
    const unfilteredQuery = useFetchFeedOutfits(page, pageSize);

    const fetchedOutfits = hasActiveFilters ? (filteredQuery.data || []) : (unfilteredQuery.data || []);
    const isLoading = hasActiveFilters ? filteredQuery.isLoading : unfilteredQuery.isLoading;

    const enrichedAllOutfits = useMemo(() => {
        return allOutfits.map(raw => enrichOutfit(raw, savedOutfitIds));
    }, [allOutfits, savedOutfitIds]);

    useEffect(() => {
        const serverSavedIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);
        setLocalSavedOutfitIds(prev => {
            const filtered = [...prev].filter(id => !serverSavedIds.has(id));
            if (filtered.length !== prev.size) {
                return new Set(filtered);
            }
            return prev;
        });
    }, [savedOutfits]);

    const prevFiltersRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const filtersString = JSON.stringify(debouncedFilters);
        if (prevFiltersRef.current && prevFiltersRef.current !== filtersString) {
            setPage(1);
            setAllOutfits([]);
            setHasMore(true);
        }
        prevFiltersRef.current = filtersString;
    }, [debouncedFilters]);

    useEffect(() => {
        if (fetchedOutfits.length > 0) {
            setAllOutfits(prev => {
                if (page === 1) {
                    return fetchedOutfits;
                }
                const existingIds = new Set(prev.map(o => o.outfit_id));
                const newOutfits = fetchedOutfits.filter(o => !existingIds.has(o.outfit_id));
                return [...prev, ...newOutfits];
            });

            if (fetchedOutfits.length < pageSize) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } else if (page === 1 && fetchedOutfits.length === 0 && !isLoading) {
            setAllOutfits([]);
            setHasMore(false);
        }
    }, [fetchedOutfits, page, pageSize, isLoading]);



    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState<OutfitData | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleUnsavePress = (outfit: OutfitData) => {
        handleToggleSave(outfit.outfit_id);
    };

    const handleToggleSave = (outfitId: string) => {
        if (!userId) return;

        const isCurrentlySaved = savedOutfitIds.has(outfitId);
        
        if (isCurrentlySaved) {
            setLocalSavedOutfitIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(outfitId);
                return newSet;
            });

            unsaveOutfit({
                outfitId,
                userId
            }, {
                onError: () => {
                    setLocalSavedOutfitIds(prev => {
                        const newSet = new Set(prev);
                        newSet.add(outfitId);
                        return newSet;
                    });
                }
            });
        } else {
            setLocalSavedOutfitIds(prev => {
                const newSet = new Set(prev);
                newSet.add(outfitId);
                return newSet;
            });

            saveOutfit({
                userId,
                outfitId,
                savedAt: new Date().toISOString(),
            }, {
                onError: () => {
                    setLocalSavedOutfitIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(outfitId);
                        return newSet;
                    });
                }
            });
        }
    };

    const handleCommentPress = (outfitId: string) => {
        setCommentOutfitId(outfitId);
        const enriched = enrichedAllOutfits.find(o => o.outfit_id === outfitId);
        setSelectedOutfitForComments(enriched || null);
        setShowCommentSection(true);
    };

    const handleSharePress = (outfitId: string) => {
        const enriched = enrichedAllOutfits.find(o => o.outfit_id === outfitId);
        if (enriched) {
            setSelectedOutfitForShare(enriched);
            setShowShareModal(true);
        }
    };

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        setSelectedOutfitForShare(null);
    };

    const handleEndReached = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, hasMore]);

    const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({
            search: '',
            tags: [],
            elements: []
        });
    }, []);

    if (!userId) {
        return (
            <Text style={{ color: colors.text }}>
                Please sign in to view your feed
            </Text>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FeedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
            />
            <FlatList style={{ backgroundColor: colors.background }}
                data={enrichedAllOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: outfit }) => (
                    <OutfitCard
                        outfit={outfit}
                        onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                        onComment={handleCommentPress}
                        onUnsave={() => handleUnsavePress(outfit)}
                        onShare={() => handleSharePress(outfit.outfit_id)}
                        onPress={(outfit) => router.push({
                            pathname: "/outfit/[id]",
                            params: { id: outfit.outfit_id }
                        })}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>Loading outfits...</Text>
                        </View>
                    ) : (
                        <EmptyState
                            icon={Grid}
                            title="No outfits yet"
                            description="Create your first outfit or follow others to see their creations"
                            actionText="Create Outfit"
                        />
                    )
                }
                refreshControl={<RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={() => {
                        setPage(1);
                        setAllOutfits([]);
                        setHasMore(true);
                        setDebouncedFilters(filters); // Force immediate filter application on refresh
                    }} 
                />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && hasMore && allOutfits.length > 0 ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingTop: 0, paddingBottom: 80, paddingHorizontal: 0 }}
            />

            <CommentSection
                isVisible={showCommentSection}
                onClose={() => setShowCommentSection(false)}
                outfitId={commentOutfitId || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />

            <ShareModal
                isVisible={showShareModal}
                onClose={handleCloseShareModal}
                outfit={selectedOutfitForShare}
                isAnimated={true}
            />
        </View>
    );
}