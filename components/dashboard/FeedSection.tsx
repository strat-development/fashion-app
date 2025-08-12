import { useFetchFeedOutfits } from "@/fetchers/dashboard/fetchFeedOutfits"
import { useFetchSavedOutfits } from "@/fetchers/dashboard/fetchSavedOutfits"
import { useDeleteSavedOutfitMutation } from "@/mutations/dashboard/DeleteSavedOutfitMutation"
import { useSaveOutfitMutation } from "@/mutations/dashboard/SaveOutfitMutation"
import { useUserContext } from "@/providers/userContext"
import { Grid } from "lucide-react-native"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import CommentSection from "./CommentSection"
import { EmptyState } from "./EmptyState"
import { OutfitCard, OutfitData } from "./OutfitCard"
import { OutfitDetail } from "./modals/OutfitDetailModal"
import { enrichOutfit } from './utils/enrichOutfit'

interface FeedSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const FeedSection = ({ refreshing }: FeedSectionProps) => {
    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const savedOutfitIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({ outfitId: outfit.outfit_id || "" });
    };


    const handleToggleSave = (outfitId: string) => {
        if (!userId) return;

        const isCurrentlySaved = savedOutfitIds.has(outfitId);

        saveOutfit({
            userId,
            outfitId,
            savedAt: new Date().toISOString()
        });
    };

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
    };

    const handleCommentPress = (outfitId: string) => {
        console.log('FeedSection: handleCommentPress called with outfitId:', outfitId);
        setCommentOutfitId(outfitId);
        const raw = fetchedOutfits.find(o => o.outfit_id === outfitId);
        if (raw) {
            const enriched = enrichOutfit(raw, savedOutfitIds);
            setSelectedOutfitForComments(enriched);
        } else {
            setSelectedOutfitForComments(null);
        }
        console.log('FeedSection: setting showCommentSection to true');
        setShowCommentSection(true);
    };

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
    };

    return (
        <>
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} />
                }
            >
                <View className="pt-6 pb-20">
                    {fetchedOutfits?.length > 0 ? (
                        fetchedOutfits.map(raw => {
                            const outfit = enrichOutfit(raw, savedOutfitIds);
                            return (
                                <OutfitCard
                                    key={outfit.outfit_id}
                                    outfit={outfit}
                                    onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                                    onComment={handleCommentPress}
                                    onPress={() => handleOutfitPress(outfit)}
                                    onUnsave={() => handleUnsavePress(outfit)}
                                />
                            );
                        })
                    ) : (
                        <EmptyState
                            icon={Grid}
                            title="No outfits yet"
                            description="Create your first outfit or follow others to see their creations"
                            actionText="Create Outfit"
                        />
                    )}
                </View>
            </ScrollView>

            {selectedOutfit && (
                <OutfitDetail
                    outfit={{
                        ...selectedOutfit,
                        isSaved: savedOutfitIds.has(selectedOutfit.outfit_id)
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
    )
}