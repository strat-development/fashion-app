import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShareModal } from "@/components/modals/ShareModal";
import CommentSection from "@/components/outfits/CommentSection";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useFetchFeedOutfits } from "@/fetchers/outfits/fetchFeedOutfits";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { OutfitData } from "@/types/createOutfitTypes";
import { enrichOutfit } from "@/utils/enrichOutfit";
import { Grid } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

interface FeedSectionProps {
    refreshing: boolean;
    onPress?: (outfit: OutfitData) => void;
}

export default function FeedSection({ refreshing }: FeedSectionProps) {
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [localSavedOutfitIds, setLocalSavedOutfitIds] = useState<Set<string>>(new Set());
    
    const savedOutfitIds = useMemo(() => new Set([
        ...savedOutfits?.map(outfit => outfit.outfit_id) || [],
        ...localSavedOutfitIds
    ]), [savedOutfits, Array.from(localSavedOutfitIds)]);
    
    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 25;

    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits(page, pageSize);

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

    useEffect(() => {
        if (fetchedOutfits.length > 0 && hasMore) {
            setAllOutfits(prev => {
                const existingIds = new Set(prev.map(o => o.outfit_id));
                const newOutfits = fetchedOutfits.filter(o => !existingIds.has(o.outfit_id));
                return [...prev, ...newOutfits];
            });

            if (fetchedOutfits.length < pageSize) {
                setHasMore(false);
            }
        }
    }, [fetchedOutfits]);



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

    if (!userId) {
        return (
            <Text className="text-white">
                Please sign in to view your feed
            </Text>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList className="bg-gradient-to-t from-gray-900 to-gray-0"
                data={enrichedAllOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: outfit }) => (
                    <OutfitCard
                        outfit={outfit}
                        onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                        onComment={handleCommentPress}
                        onUnsave={() => handleUnsavePress(outfit)}
                        onShare={() => handleSharePress(outfit.outfit_id)}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View className="py-16 items-center">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className="text-gray-300 text-base mt-4">Loading outfits...</Text>
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
                refreshControl={<RefreshControl refreshing={refreshing} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && hasMore && allOutfits.length > 0 ? (
                        <View className="py-4">
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 80, paddingHorizontal: 16 }}
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