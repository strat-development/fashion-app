import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { useUserContext } from "@/providers/userContext";
import { Bookmark, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { ShareModal } from "../modals/ShareModal";
import OutfitDetailImages from "../outfit-detail/OutfitDetailImages";
import OutfitDetailInfo from "../outfit-detail/OutfitDetailInfo";
import OutfitDetailSections from "../outfit-detail/OutfitDetailSections";
import CommentSection from "../outfits/CommentSection";
import { OutfitCard, OutfitData } from "../outfits/OutfitCard";
import { EmptyState } from "./EmptyState";


interface SavedOutfitsSectionProps {
    refreshing: boolean;
    profileId: string;
    onPress?: (outfit: OutfitData) => void;
}

export const SavedOutfitsSection = ({ refreshing, profileId }: SavedOutfitsSectionProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { userId } = useUserContext();
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const { data: savedOutfits = [], isLoading } = useFetchSavedOutfits(profileId, page, pageSize);

    const savedOutfitIds = useMemo(() => 
        new Set(savedOutfits.map(outfit => outfit.outfit_id)), 
        [savedOutfits]
    );

    useEffect(() => {
        if (isLoading) return;

        if (savedOutfits.length === 0 && page === 1) {
            setAllOutfits([]);
            setHasMore(false);
            return;
        }

        if (savedOutfits.length > 0) {
            setAllOutfits(prev => {
                const existingIds = new Set(prev.map(o => o.outfit_id));
                const newOutfits = savedOutfits.filter(o => !existingIds.has(o.outfit_id));
                const enrichedNewOutfits = newOutfits.map(outfit => enrichOutfit(outfit, savedOutfitIds));
                return [...prev, ...enrichedNewOutfits];
            });
        }

        if (savedOutfits.length < pageSize) {
            setHasMore(false);
        }
    }, [savedOutfits, isLoading, page, savedOutfitIds]);

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);



    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState<OutfitData | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const enrichedAllOutfits = useMemo(() => {
        return allOutfits.map(raw => enrichOutfit(raw, savedOutfitIds));
    }, [allOutfits, savedOutfitIds]);

    const handleUnsavePress = (outfit: OutfitData) => {
        if (!userId) return;
        unsaveOutfit({
            outfitId: outfit.outfit_id || "",
            userId: userId
        }, {
            onSuccess: () => {
                setAllOutfits(prev => prev.filter(o => o.outfit_id !== outfit.outfit_id));
            }
        });
    };

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
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
                        onComment={handleCommentPress}
                        onPress={() => handleOutfitPress(outfit)}
                        onUnsave={() => handleUnsavePress(outfit)}
                        onShare={() => handleSharePress(outfit.outfit_id)}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View className="py-16 items-center">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className="text-gray-300 text-base mt-4">{t('savedOutfitsSection.loading')}</Text>
                        </View>
                    ) : (
                        <View className="px-6">
                            <EmptyState
                                icon={Bookmark}
                                title={t('savedOutfitsSection.emptyState.title')}
                                description={t('savedOutfitsSection.emptyState.description')}
                            />
                        </View>
                    )
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

            {/* Inline outfit detail modal - full screen with close icon */}
            <Modal visible={!!selectedOutfit} transparent={false} animationType="slide" onRequestClose={() => setSelectedOutfit(null)}>
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                    <Pressable
                        onPress={() => setSelectedOutfit(null)}
                        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.surface}CC`, borderWidth: 1, borderColor: colors.border }}
                    >
                        <X size={20} color={colors.text} />
                    </Pressable>
                    {selectedOutfit && (
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                                    <OutfitDetailInfo
                                        outfit={selectedOutfit}
                                        userData={undefined}
                                        tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                                    />
                            </View>
                            <View style={{ paddingHorizontal: 16 }}>
                                <OutfitDetailImages
                                    imageUrls={Array.isArray(selectedOutfit.outfit_elements_data)
                                        ? (selectedOutfit.outfit_elements_data as any[])
                                            .map((el) => (typeof el === 'string' ? el : el?.imageUrl))
                                            .filter((u): u is string => typeof u === 'string' && !!u)
                                        : []}
                                    elementsData={Array.isArray(selectedOutfit.outfit_elements_data)
                                        ? (selectedOutfit.outfit_elements_data as any[]).filter((el) => el && typeof el === 'object' && (el as any).imageUrl)
                                        : [] as any}
                                />
                            </View>
                            <OutfitDetailSections
                                description={selectedOutfit.description}
                                tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                            />
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}