import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShareModal } from "@/components/modals/ShareModal";
import CommentSection from "@/components/outfits/CommentSection";
import { FeedFilters, FilterOptions } from "@/components/outfits/FeedFilters";
import { OutfitCard, OutfitData } from "@/components/outfits/OutfitCard";
import { useUserContext } from "@/features/auth/context/UserContext";
import { useFetchFeedOutfits } from "@/fetchers/outfits/fetchFeedOutfits";
import { useFetchFilteredFeedOutfits } from "@/fetchers/outfits/fetchFilteredFeedOutfits";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { enrichOutfit } from "@/utils/enrichOutfit";
import { useRouter } from "expo-router";
import { Grid } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

export default function FeedScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { userId } = useUserContext();
    const router = useRouter();

    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({ search: '', tags: [], elements: [] });
    const [debouncedFilters, setDebouncedFilters] = useState<FilterOptions>(filters);
    const debounceTimeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => setDebouncedFilters(filters), 300);
        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [filters]);

    const [localSavedOutfitIds, setLocalSavedOutfitIds] = useState<Set<string>>(new Set());


    const savedOutfitIds = useMemo(() => new Set([
        ...savedOutfits?.map(outfit => outfit.outfit_id) || [],
        ...localSavedOutfitIds
    ]), [savedOutfits, localSavedOutfitIds]);

    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const hasActiveFilters = debouncedFilters.search.trim() || debouncedFilters.tags.length > 0 || debouncedFilters.elements.length > 0;

    const filteredQuery = useFetchFilteredFeedOutfits(page, pageSize, debouncedFilters);
    const unfilteredQuery = useFetchFeedOutfits(page, pageSize);

    const { data: fetchedOutfits, isLoading, isFetching } = hasActiveFilters ? filteredQuery : unfilteredQuery;

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
        if (fetchedOutfits && fetchedOutfits.length > 0) {
            setAllOutfits(prev => page === 1 ? fetchedOutfits : [...prev, ...fetchedOutfits.filter(o => !prev.some(p => p.outfit_id === o.outfit_id))]);
            setHasMore(fetchedOutfits.length === pageSize);
        } else if (!isLoading && !isFetching) {
            setHasMore(false);
        }
    }, [fetchedOutfits, page, pageSize, isLoading, isFetching]);

    useEffect(() => {
        if (!isFetching && refreshing) setRefreshing(false);
    }, [isFetching, refreshing]);

    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState<OutfitData | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleToggleSave = (outfitId: string) => {
        if (!userId) return;
        const isCurrentlySaved = savedOutfitIds.has(outfitId);
        const optimisticAction = () => {
            setLocalSavedOutfitIds(prev => {
                const newSet = new Set(prev);
                isCurrentlySaved ? newSet.delete(outfitId) : newSet.add(outfitId);
                return newSet;
            });
        };
        const revertAction = () => {
            setLocalSavedOutfitIds(prev => {
                const newSet = new Set(prev);
                isCurrentlySaved ? newSet.add(outfitId) : newSet.delete(outfitId);
                return newSet;
            });
        };

        optimisticAction();

        if (isCurrentlySaved) {
            unsaveOutfit({ outfitId, userId }, { onError: revertAction });
        } else {
            saveOutfit({ userId, outfitId, savedAt: new Date().toISOString() }, { onError: revertAction });
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

    const handleOutfitPress = (outfit: OutfitData) => {
        router.push(`/outfit/${outfit.outfit_id}`);
    };

    const handleEndReached = useCallback(() => {
        if (!isLoading && hasMore) setPage(prev => prev + 1);
    }, [isLoading, hasMore]);

    const handleFiltersChange = useCallback((newFilters: FilterOptions) => setFilters(newFilters), []);
    const handleClearFilters = useCallback(() => setFilters({ search: '', tags: [], elements: [] }), []);

    if (!userId) {
        return <Text style={{ color: colors.text }}>{t('feedSection.signInMessage')}</Text>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FeedFilters filters={filters} onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />
            <FlatList
                data={enrichedAllOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: outfit }) => (
                    <OutfitCard
                        outfit={outfit}
                        onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                        onComment={handleCommentPress}
                        onUnsave={() => handleToggleSave(outfit.outfit_id)} // Corrected to use toggle save
                        onShare={() => handleSharePress(outfit.outfit_id)}
                        onPress={() => handleOutfitPress(outfit)}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>{t('feedSection.loadingOutfits')}</Text>
                        </View>
                    ) : (
                        <EmptyState icon={Grid} title={t('feedSection.emptyState.title')} description={t('feedSection.emptyState.description')} />
                    )
                }
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setPage(1); setAllOutfits([]); setHasMore(true); hasActiveFilters ? filteredQuery.refetch() : unfilteredQuery.refetch(); }} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator style={{ marginVertical: 16 }} size="large" color={colors.accent} /> : null}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
            <CommentSection isVisible={showCommentSection} onClose={() => setShowCommentSection(false)} outfitId={commentOutfitId || ''} outfitTitle={selectedOutfitForComments?.outfit_name || ''} />
            <ShareModal isVisible={showShareModal} onClose={() => setShowShareModal(false)} outfit={selectedOutfitForShare} isAnimated={true} />
        </View>
    );
}
