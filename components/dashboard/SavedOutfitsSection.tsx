
import { useFetchSavedOutfits } from "@/fetchers/fetchSavedOutfits"
import { useDeleteSavedOutfitMutation } from "@/mutations/DeleteSavedOutfitMutation"
import { useUserContext } from "@/providers/userContext"
import { Bookmark } from "lucide-react-native"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { EmptyState } from "./EmptyState"
import { DeleteSavedModalOutfit } from "./modals/DeleteSavedOutfitModal"
import { OutfitDetail } from "./modals/OutfitDetailModal"
import { OutfitCard, OutfitData } from "./OutfitCard"

interface SavedOutfitsSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const SavedOutfitsSection = ({ refreshing }: SavedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: savedOutfits = [], isLoading } = useFetchSavedOutfits(userId || '');
    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [outfitToDelete, setOutfitToDelete] = useState<OutfitData | null>(null);
    const [showDeleteOutfit, setShowDeleteOutfit] = useState(false);
    const { mutate: deleteOutfit } = useDeleteSavedOutfitMutation();

    const handleDeletePress = (outfit: OutfitData) => {
        setOutfitToDelete(outfit);
        setShowDeleteOutfit(true);
    };

    const handleConfirmDelete = () => {
        if (outfitToDelete) {
            deleteOutfit({ outfitId: outfitToDelete.outfit_id || "" });
            setShowDeleteOutfit(false);
            setOutfitToDelete(null);
        }
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
                        savedOutfits.map(outfit => (
                            <OutfitCard
                                key={outfit}
                                outfit={outfit}
                                onPress={() =>
                                    handleOutfitPress(outfit)
                                }
                                isDeleteVisible={true}
                                onDelete={() => handleDeletePress(outfit)}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon={Bookmark}
                            title="No saved outfits yet"
                            description="Start saving outfits you love!"
                        />
                    )}
                </View>
            </ScrollView>

            <DeleteSavedModalOutfit
                isVisible={showDeleteOutfit}
                onClose={() => setShowDeleteOutfit(false)}
                onDelete={handleConfirmDelete}
                isAnimated={true}
            />

            {selectedOutfit && (
                <OutfitDetail
                    outfit={selectedOutfit}
                    isVisible={showOutfitDetail}
                    onClose={handleCloseOutfitDetail}
                    onToggleLike={() => { }}
                    onToggleSave={() => { }}
                />
            )}
        </>
    )
}