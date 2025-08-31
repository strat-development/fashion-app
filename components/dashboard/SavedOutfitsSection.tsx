import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Bookmark } from "lucide-react-native";
import { useState, useCallback, useEffect } from "react";
import { RefreshControl, View, ActivityIndicator, FlatList } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { OutfitDetail } from "../modals/OutfitDetailModal";
import CommentSection from "../outfits/CommentSection";
import { OutfitCard, OutfitData } from "../outfits/OutfitCard";
import { EmptyState } from "./EmptyState";

interface SavedOutfitsSectionProps {
    refreshing: boolean;
    onPress?: (outfit: OutfitData) => void;
}

export const SavedOutfitsSection = ({ refreshing }: SavedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [page, setPage] = useState(1);
    const [allOutfits, setAllOutfits] = useState<OutfitData[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const { data: savedOutfits = [], isLoading } = useFetchSavedOutfits(userId || '', page, pageSize);

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
                return [...prev, ...newOutfits];
            });
        }

        if (savedOutfits.length < pageSize) {
            setHasMore(false);
        }
    }, [savedOutfits, isLoading, page]);

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);

    const savedOutfitIds = new Set(allOutfits.map(outfit => outfit.outfit_id));

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({ outfitId: outfit.outfit_id || "" }, {
            onSuccess: () => {
                setAllOutfits(prev => prev.filter(o => o.outfit_id !== outfit.outfit_id));
            }
        });
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

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
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
                            onComment={handleCommentPress}
                            onPress={() => handleOutfitPress(outfit)}
                            onUnsave={() => handleUnsavePress(outfit)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <EmptyState
                        icon={Bookmark}
                        title="No saved outfits yet"
                        description="Start saving outfits you love!"
                    />
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

            {selectedOutfit && (
                <OutfitDetail
                    outfit={{
                        ...selectedOutfit,
                        isSaved: savedOutfitIds.has(selectedOutfit.outfit_id),
                    }}
                    isVisible={showOutfitDetail}
                    onClose={handleCloseOutfitDetail}
                />
            )}

            <CommentSection
                isVisible={showCommentSection}
                onClose={() => setShowCommentSection(false)}
                outfitId={selectedOutfitForComments?.outfit_id || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />
        </>
    );
};