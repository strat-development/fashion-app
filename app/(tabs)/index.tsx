import { EmptyState } from "@/components/dashboard/EmptyState";
import { OutfitDetail } from "@/components/modals/OutfitDetailModal";
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
import { useCallback, useEffect, useState } from "react";
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
    const savedOutfitIds = new Set([
        ...savedOutfits?.map(outfit => outfit.outfit_id) || [],
        ...localSavedOutfitIds
    ]);
    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 25;

    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits(page, pageSize);

    useEffect(() => {
        const serverSavedIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);
        setLocalSavedOutfitIds(prev => {
            const filtered = new Set([...prev].filter(id => !serverSavedIds.has(id)));
            return filtered;
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



    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);

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

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
    };

    const handleCommentPress = (outfitId: string) => {
        setCommentOutfitId(outfitId);
        const raw = allOutfits.find(o => o.outfit_id === outfitId);
        if (raw) {
            const enriched = enrichOutfit(raw, savedOutfitIds);
            setSelectedOutfitForComments(enriched);
        } else {
            setSelectedOutfitForComments(null);
        }
        setShowCommentSection(true);
    };

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
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
        <>
            <FlatList className="bg-gradient-to-t from-gray-900 to-gray-0"
                data={allOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: raw }) => {
                    const outfit = enrichOutfit(raw, savedOutfitIds);
                    return (
                        <OutfitCard
                            outfit={outfit}
                            onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                            onComment={handleCommentPress}
                            onPress={() => handleOutfitPress(outfit)}
                            onUnsave={() => handleUnsavePress(outfit)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <EmptyState
                        icon={Grid}
                        title="No outfits yet"
                        description="Create your first outfit or follow others to see their creations"
                        actionText="Create Outfit"
                    />
                }
                refreshControl={<RefreshControl refreshing={refreshing} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && hasMore ? (
                        <View className="py-4">
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 80, paddingHorizontal: 16 }}
            />

            {selectedOutfit && (
                <OutfitDetail
                    outfit={{
                        ...selectedOutfit,
                        isSaved: savedOutfitIds.has(selectedOutfit.outfit_id),
                        likes: 0,
                        comments: 0,
                    }}
                    isVisible={showOutfitDetail}
                    onClose={handleCloseOutfitDetail}
                />
            )}

            <CommentSection
                isVisible={showCommentSection}
                onClose={() => setShowCommentSection(false)}
                outfitId={commentOutfitId || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />
        </>
    );
}