import { useUserContext } from "@/features/auth/context/UserContext";
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useTheme } from "@/providers/themeContext";
import { useRouter } from "expo-router";
import { Bookmark } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { ShareModal } from "../modals/ShareModal";
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
    const router = useRouter();
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
        router.push(`/outfit/${outfit.outfit_id}`);
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


        </View>
    );
}