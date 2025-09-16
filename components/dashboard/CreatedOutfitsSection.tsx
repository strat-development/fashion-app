import { useFetchCreatedOutfitsByUser } from "@/fetchers/outfits/fetchCreatedOutfitsByUser";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteOutfitMutation } from "@/mutations/outfits/DeleteOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { DeleteModalOutfit } from "../modals/DeleteOutfitModal";
import { OutfitCreateModal } from "../modals/OutfitCreateModal";
import { ShareModal } from "../modals/ShareModal";
import CommentSection from "../outfits/CommentSection";
import { OutfitCard, OutfitData } from "../outfits/OutfitCard";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import { useTranslation } from 'react-i18next';

interface CreatedOutfitsSectionProps {
    refreshing: boolean;
    profileId: string;
    onPress?: (outfit: OutfitData) => void;
}

export const CreatedOutfitsSection = ({ refreshing, profileId }: CreatedOutfitsSectionProps) => {
    const { t } = useTranslation();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { mutate: unsaveOutfit } = useDeleteOutfitMutation();

    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const { data: fetchedOutfits = [], isLoading } = useFetchCreatedOutfitsByUser(profileId, page, pageSize);
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');

    const savedOutfitIds = useMemo(() => 
        new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []), 
        [savedOutfits?.map(outfit => outfit.outfit_id).join(',')]
    );

    const enrichedAllOutfits = useMemo(() => {
        return allOutfits.map(raw => enrichOutfit(raw, savedOutfitIds));
    }, [allOutfits, savedOutfitIds]);

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
                const enrichedNewOutfits = newOutfits.map(outfit => enrichOutfit(outfit, savedOutfitIds));
                return [...prev, ...enrichedNewOutfits];
            });
        }

        if (fetchedOutfits.length < pageSize) {
            setHasMore(false);
        }
    }, [fetchedOutfits, isLoading, page, savedOutfitIds]);

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
        router.push({
            pathname: "/outfit/[id]",
            params: { id: outfit.outfit_id }
        });
    };

    const handleCommentPress = (outfitId: string) => {
        const enriched = enrichedAllOutfits.find(o => o.outfit_id === outfitId);
        if (!enriched) return;
        setSelectedOutfitForComments(enriched);
        setShowCommentSection(true);
    };

    const handleSharePress = (outfitId: string) => {
        const enriched = enrichedAllOutfits.find(o => o.outfit_id === outfitId);
        if (!enriched) return;
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
        <View style={{ flex: 1 }}>
            <FlatList
                data={enrichedAllOutfits}
                keyExtractor={item => item.outfit_id}
                renderItem={({ item: outfit }) => (
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
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View className="py-16 items-center">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className="text-gray-300 text-base mt-4">{t('createdOutfitsSection.loading')}</Text>
                        </View>
                    ) : (
                        <View className="px-6">
                            {profileId === userId && (
                                <EmptyState
                                    icon={Plus}
                                    title={t('createdOutfitsSection.emptyState.title')}
                                    description={t('createdOutfitsSection.emptyState.description')}
                                    actionText={t('createdOutfitsSection.emptyState.actionText')}
                                    onAction={handleCreateOutfit}
                                />
                            )}

                            {!profileId && (
                                <EmptyState
                                    icon={Plus}
                                    title={t('createdOutfitsSection.emptyState.title')}
                                    description={t('createdOutfitsSection.emptyState.description')}
                                    actionText={t('createdOutfitsSection.emptyState.actionText')}
                                    onAction={handleCreateOutfit}
                                />
                            )}
                        </View>
                    )
                }
                ListHeaderComponent={
                    <View className="flex-row items-center justify-between mb-6 px-6">
                        {profileId === userId && (
                            <View className="flex-row items-center justify-between w-full">
                                <Text className="text-white text-xl font-semibold">{t('createdOutfitsSection.header')}</Text>
                                <Button
                                    onPress={handleCreateOutfit}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-4 py-2"
                                >
                                    <View className="flex-row items-center">
                                        <Plus size={16} color="#FFFFFF" />
                                        <Text className="text-white ml-2 font-medium text-sm">{t('createdOutfitsSection.createButton')}</Text>
                                    </View>
                                </Button>
                            </View>
                        )}
                    </View>
                }
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && hasMore && allOutfits.length > 0 ? (
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
        </View>
    );
};