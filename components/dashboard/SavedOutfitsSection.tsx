
import { useFetchSavedOutfits } from "@/fetchers/dashboard/fetchSavedOutfits"
import { useDeleteSavedOutfitMutation } from "@/mutations/dashboard/DeleteSavedOutfitMutation"
import { useUserContext } from "@/providers/userContext"
import { Bookmark } from "lucide-react-native"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { EmptyState } from "./EmptyState"
import { OutfitDetail } from "./modals/OutfitDetailModal"
import { OutfitCard, OutfitData } from "./OutfitCard"

interface SavedOutfitsSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const SavedOutfitsSection = ({ refreshing }: SavedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: savedOutfits = [], isLoading } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();
    
    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    
    const savedOutfitIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({ outfitId: outfit.outfit_id || "" });
    };

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
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
                    {savedOutfits.length > 0 ? (
                        savedOutfits.map(raw => {
                            const enriched: OutfitData = {
                                ...(raw as any),
                                likes: (raw as any).likes ?? 0,
                                comments: (raw as any).comments ?? 0,
                                isSaved: savedOutfitIds.has(raw.outfit_id)
                            };
                            return (
                                <OutfitCard
                                    key={raw.outfit_id}
                                    outfit={enriched}
                                    onPress={() =>
                                        handleOutfitPress(enriched)
                                    }
                                    onUnsave={() =>
                                        handleUnsavePress(enriched)
                                    }
                                />
                            );
                        })
                    ) : (
                        <EmptyState
                            icon={Bookmark}
                            title="No saved outfits yet"
                            description="Start saving outfits you love!"
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
        </>
    )
}