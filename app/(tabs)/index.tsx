import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShareModal } from "@/components/modals/ShareModal";
import OutfitInteractionButtons from "@/components/outfit-detail/OutfitInteractionButtons";
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
import { useSharedValue } from "react-native-reanimated";
// import { router } from "expo-router";
import OutfitDetailImages from "@/components/outfit-detail/OutfitDetailImages";
import OutfitDetailInfo from "@/components/outfit-detail/OutfitDetailInfo";
import OutfitDetailSections from "@/components/outfit-detail/OutfitDetailSections";
import { Grid, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

interface FeedSectionProps {
    onPress?: (outfit: OutfitData) => void;
}

export default function FeedSection({}: FeedSectionProps) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();
    const [refreshing, setRefreshing] = useState(false);

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
    const [localSavedIdsVersion, setLocalSavedIdsVersion] = useState(0);
    
    const savedOutfitIds = useMemo(() => new Set([
        ...savedOutfits?.map(outfit => outfit.outfit_id) || [],
        ...localSavedOutfitIds
    ]), [savedOutfits, localSavedIdsVersion]);
    
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
    const isFetching = hasActiveFilters ? filteredQuery.isFetching : unfilteredQuery.isFetching;

    const enrichedAllOutfits = useMemo(() => {
        return allOutfits.map(raw => enrichOutfit(raw, savedOutfitIds));
    }, [allOutfits, savedOutfitIds]);

    useEffect(() => {
        const serverSavedIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);
        setLocalSavedOutfitIds(prev => {
            const filtered = [...prev].filter(id => !serverSavedIds.has(id));
            if (filtered.length !== prev.size) {
                setLocalSavedIdsVersion(v => v + 1);
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

    useEffect(() => {
        if (!isFetching && refreshing) {
            setRefreshing(false);
        }
    }, [isFetching, refreshing]);

    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState<OutfitData | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedOutfit, setSelectedOutfit] = useState<any | null>(null);
    const [selectedUserData, setSelectedUserData] = useState<{ nickname?: string | null; user_avatar?: string | null } | undefined>(undefined);
    const [selectedMeta, setSelectedMeta] = useState<{ positive: number; negative: number; isLiked: boolean; isDisliked: boolean; isSaved?: boolean; comments: number } | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [showInlineComments, setShowInlineComments] = useState(false);

    const likeScale = useSharedValue(1);
    const dislikeScale = useSharedValue(1);
    const commentScale = useSharedValue(1);
    const shareScale = useSharedValue(1);
    const saveScale = useSharedValue(1);

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
                setLocalSavedIdsVersion(v => v + 1);
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
                        setLocalSavedIdsVersion(v => v + 1);
                        return newSet;
                    });
                }
            });
        } else {
            setLocalSavedOutfitIds(prev => {
                const newSet = new Set(prev);
                newSet.add(outfitId);
                setLocalSavedIdsVersion(v => v + 1);
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
                        setLocalSavedIdsVersion(v => v + 1);
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
                {t('feedSection.signInMessage')}
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
                        onPress={(o) => {
                            setSelectedOutfit(o);
                            setSelectedUserData(undefined);
                            setSelectedMeta(null);
                            setShowOutfitDetail(true);
                        }}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>
                                {t('feedSection.loadingOutfits')}
                            </Text>
                        </View>
                    ) : (
                        <EmptyState
                            icon={Grid}
                            title={t('feedSection.emptyState.title')}
                            description={t('feedSection.emptyState.description')}
                            actionText={t('feedSection.emptyState.actionText')}
                        />
                    )
                }
                refreshControl={<RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={() => {
                        setRefreshing(true);
                        setPage(1);
                        setHasMore(true);
                        if (hasActiveFilters) {
                            filteredQuery.refetch();
                        } else {
                            unfilteredQuery.refetch();
                        }
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

            {/* Inline outfit detail modal - full screen with interactions */}
            <Modal visible={showOutfitDetail} transparent={false} animationType="slide" onRequestClose={() => setShowOutfitDetail(false)}>
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                    <Pressable
                        onPress={() => setShowOutfitDetail(false)}
                        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.surface}CC`, borderWidth: 1, borderColor: colors.border }}
                    >
                        <X size={20} color={colors.text} />
                    </Pressable>
                    {selectedOutfit && (
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                                <OutfitDetailInfo
                                    outfit={selectedOutfit}
                                    userData={selectedUserData}
                                    tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                                />
                            </View>
                            <View style={{ paddingHorizontal: 16 }}>
                                <OutfitDetailImages
                                    imageUrls={Array.isArray(selectedOutfit.outfit_elements_data)
                                        ? (selectedOutfit.outfit_elements_data as any[])
                                            .map((el: any) => (typeof el === 'string' ? el : el?.imageUrl))
                                            .filter((u: any): u is string => typeof u === 'string' && !!u)
                                        : []}
                                    elementsData={Array.isArray(selectedOutfit.outfit_elements_data)
                                        ? (selectedOutfit.outfit_elements_data as any[]).filter((el: any) => el && typeof el === 'object' && (el as any).imageUrl)
                                        : [] as any}
                                />
                            </View>
                            <OutfitDetailSections
                                description={selectedOutfit.description}
                                tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                            />

                            {/* Interaction buttons */}
                            {selectedMeta && (
                                <OutfitInteractionButtons
                                    isLiked={!!selectedMeta.isLiked}
                                    isDisliked={!!selectedMeta.isDisliked}
                                    isSaved={!!selectedMeta.isSaved}
                                    positiveRatings={selectedMeta.positive}
                                    negativeRatings={selectedMeta.negative}
                                    commentsCount={selectedMeta.comments}
                                    showCommentsButton={false}
                                    onPositiveRate={() => {
                                        // optimistic update
                                        setSelectedMeta(prev => {
                                            if (!prev) return prev as any;
                                            const wasLiked = prev.isLiked;
                                            const wasDisliked = prev.isDisliked;
                                            let positive = prev.positive;
                                            let negative = prev.negative;
                                            if (wasLiked) {
                                                positive = Math.max(0, positive - 1);
                                            } else {
                                                positive = positive + 1;
                                                if (wasDisliked) negative = Math.max(0, negative - 1);
                                            }
                                            return { ...prev, isLiked: !wasLiked, isDisliked: false, positive, negative };
                                        });
                                    }}
                                    onNegativeRate={() => {
                                        setSelectedMeta(prev => {
                                            if (!prev) return prev as any;
                                            const wasLiked = prev.isLiked;
                                            const wasDisliked = prev.isDisliked;
                                            let positive = prev.positive;
                                            let negative = prev.negative;
                                            if (wasDisliked) {
                                                negative = Math.max(0, negative - 1);
                                            } else {
                                                negative = negative + 1;
                                                if (wasLiked) positive = Math.max(0, positive - 1);
                                            }
                                            return { ...prev, isDisliked: !wasDisliked, isLiked: false, positive, negative };
                                        });
                                    }}
                                    onComments={() => setShowInlineComments(true)}
                                    onShare={() => {
                                        setSelectedOutfitForShare(selectedOutfit);
                                        setShowShareModal(true);
                                    }}
                                    onSave={() => {
                                        if (selectedOutfit?.outfit_id) {
                                            handleToggleSave(selectedOutfit.outfit_id);
                                            setSelectedMeta(prev => prev ? { ...prev, isSaved: !prev.isSaved } as any : prev);
                                        }
                                    }}
                                    likeScale={likeScale}
                                    dislikeScale={dislikeScale}
                                    commentScale={commentScale}
                                    shareScale={shareScale}
                                    saveScale={saveScale}
                                />
                            )}
                            {/* Inline comments below interactions */}
                            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                                <CommentSection
                                    isVisible={true}
                                    onClose={() => setShowInlineComments(false)}
                                    outfitId={selectedOutfit?.outfit_id || ''}
                                    outfitTitle={selectedOutfit?.outfit_name || ''}
                                    asInline={true}
                                />
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}