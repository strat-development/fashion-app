import { useFetchCreatedOutfitsByUser } from "@/fetchers/outfits/fetchCreatedOutfitsByUser";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteOutfitMutation } from "@/mutations/outfits/DeleteOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { DeleteModalOutfit } from "../modals/DeleteOutfitModal";
import { OutfitCreateModal } from "../modals/OutfitCreateModal";
import { ShareModal } from "../modals/ShareModal";
import CommentSection from "../outfits/CommentSection";
import { OutfitCard, OutfitData } from "../outfits/OutfitCard";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";

interface CreatedOutfitsSectionProps {
    refreshing: boolean;
    profileId: string;
    onPress?: (outfit: OutfitData) => void;
}

export const CreatedOutfitsSection = ({ refreshing, profileId }: CreatedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { mutate: unsaveOutfit } = useDeleteOutfitMutation();

    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const { data: fetchedOutfits = [], isLoading } = useFetchCreatedOutfitsByUser(profileId, page, pageSize);
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');

    const savedOutfitIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);

    useEffect(() => {
        if (isLoading) return;

        if (fetchedOutfits.length === 0 && page === 1) {
            setAllOutfits([]);
            setHasMore(false);
            return;
        }

        if (fetchedOutfits.length > 0) {
            setAllOutfits(prev => {
                const existingIds = new Set(prev.map(o => o.outfit_id));
                const newOutfits = fetchedOutfits.filter(o => !existingIds.has(o.outfit_id));
                return [...prev, ...newOutfits];
            });
        }

        if (fetchedOutfits.length < pageSize) {
            setHasMore(false);
        }
    }, [fetchedOutfits, isLoading, page]);

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState<OutfitData | null>(null);
    const [outfitToDelete, setOutfitToDelete] = useState<OutfitData | null>(null);

    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showOutfitCreate, setShowOutfitCreate] = useState(false);
    const [showDeleteOutfit, setShowDeleteOutfit] = useState(false);

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({
            outfitId: outfit.outfit_id || "",
            userId: userId || ""
        }, {
            onSuccess: () => {
                savedOutfitIds.delete(outfit.outfit_id);
            }
        });
    };

    const handleCreateOutfit = () => {
        setShowOutfitCreate(true);
    };

    const handleDeletePress = (outfitId: string) => {
        const outfit = allOutfits.find(o => o.outfit_id === outfitId);
        if (outfit) {
            setOutfitToDelete(outfit);
            setShowDeleteOutfit(true);
        }
    };

    const handleDeleteSuccess = () => {
        setAllOutfits(prev => prev.filter(o => o.outfit_id !== outfitToDelete?.outfit_id));
        setOutfitToDelete(null);
        setShowDeleteOutfit(false);
    };

    const handleCloseOutfitCreate = () => {
        setShowOutfitCreate(false);
    };

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
    };

    const handleCommentPress = (outfitId: string) => {
        const raw = allOutfits.find(o => o.outfit_id === outfitId);
        if (!raw) return;
        const enriched = enrichOutfit(raw, savedOutfitIds);
        setSelectedOutfitForComments(enriched);
        setShowCommentSection(true);
    };

    const handleSharePress = (outfitId: string) => {
        const raw = allOutfits.find(o => o.outfit_id === outfitId);
        if (!raw) return;
        const enriched = enrichOutfit(raw, savedOutfitIds);
        setSelectedOutfitForShare(enriched);
        setShowShareModal(true);
    };

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
    };

    const handleToggleSave = (outfitId: string) => {
        if (!userId) return;
        saveOutfit({
            userId,
            outfitId,
            savedAt: new Date().toISOString(),
        }, {
            onSuccess: () => {
                savedOutfitIds.add(outfitId);
            }
        });
    };

    const handleEndReached = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, hasMore]);

    const onRefresh = useCallback(() => {
        setPage(1);
        setAllOutfits([]);
        setHasMore(true);
    }, []);

    return (
        <>
            <FlatList
                data={allOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: raw }) => {
                    const outfit = enrichOutfit(raw, savedOutfitIds);
                    return (
                        <OutfitCard
                            key={outfit.outfit_id}
                            outfit={outfit}
                            onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                            onComment={handleCommentPress}
                            onPress={() => handleOutfitPress(outfit)}
                            onDelete={() => handleDeletePress(outfit.outfit_id)}
                            onUnsave={() => handleUnsavePress(outfit)}
                            onShare={() => handleSharePress(outfit.outfit_id)}
                            isDeleteVisible={profileId === userId}
                        />
                    );
                }}
                ListEmptyComponent={
                    <>
                        {profileId === userId && (
                            <EmptyState
                                icon={Plus}
                                title="No outfits created yet"
                                description="Start creating your first outfit!"
                                actionText="Create Outfit"
                                onAction={handleCreateOutfit}
                            />
                        )}

                        {!profileId && (
                            <EmptyState
                                icon={Plus}
                                title="No outfits created yet"
                                description="Start creating your first outfit!"
                                actionText="Create Outfit"
                                onAction={handleCreateOutfit}
                            />
                        )}
                    </>
                }
                ListHeaderComponent={
                    <View className="flex-row items-center justify-between mb-6">
                        {profileId === userId && (
                            <>
                                <Text className="text-white text-xl font-semibold">Your Creations</Text>
                                <Button
                                    onPress={handleCreateOutfit}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-4 py-2"
                                >
                                    <View className="flex-row items-center">
                                        <Plus size={16} color="#FFFFFF" />
                                        <Text className="text-white ml-2 font-medium text-sm">Create</Text>
                                    </View>
                                </Button>
                            </>
                        )}
                    </View>
                }
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && hasMore ? (
                        <View className="py-4">
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 80 }}
            />

            <OutfitCreateModal
                isVisible={showOutfitCreate}
                onClose={handleCloseOutfitCreate}
            />

            {outfitToDelete && (
                <DeleteModalOutfit
                    isVisible={showDeleteOutfit}
                    onClose={() => setShowDeleteOutfit(false)}
                    isAnimated={true}
                    outfitId={outfitToDelete.outfit_id}
                    userId={userId || undefined}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            <CommentSection
                isVisible={showCommentSection}
                onClose={() => setShowCommentSection(false)}
                outfitId={selectedOutfitForComments?.outfit_id || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />

            <ShareModal
                isVisible={showShareModal}
                onClose={() => setShowShareModal(false)}
                outfit={selectedOutfitForShare}
                isAnimated={true}
            />
        </>
    );
};