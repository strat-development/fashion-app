import { useFetchFeedOutfits } from "@/fetchers/fetchFeedOutfits"
import { useSaveOutfitMutation } from "@/mutations/SaveOutfitMutation"
import { useUserContext } from "@/providers/userContext"
import { Grid } from "lucide-react-native"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { EmptyState } from "./EmptyState"
import { OutfitCard, OutfitData } from "./OutfitCard"
import { OutfitDetail } from "./modals/OutfitDetailModal"

interface FeedSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const FeedSection = ({ refreshing }: FeedSectionProps) => {
    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
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
            savedAt: new Date().toISOString()
        });
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
                        fetchedOutfits.map(outfit => (
                            <OutfitCard
                                outfit={outfit}
                                onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                                onPress={() => {
                                    handleOutfitPress(outfit);
                                }}
                            />
                        ))
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
                    outfit={selectedOutfit}
                    isVisible={showOutfitDetail}
                    onClose={handleCloseOutfitDetail}
                    onToggleLike={() => { }}
                    onToggleSave={() => handleToggleSave(selectedOutfit.outfit_id)}
                />
            )}
        </>
    )
}