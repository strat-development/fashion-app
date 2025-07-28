import { useFetchCreatedOutfitsByUser } from "@/fetchers/fetchCreatedOutfitsByUser";
import { useDeleteOutfitMutation } from "@/mutations/DeleteOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/SaveOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import { OutfitCard, OutfitData } from "./OutfitCard";
import { DeleteModalOutfit } from "./modals/DeleteOutfitModal";
import { OutfitCreateModal } from "./modals/OutfitCreateModal";
import { OutfitDetail } from "./modals/OutfitDetailModal";

interface CreatedOutfitsSectionProps {
    refreshing: boolean;
    onPress?: (outfit: OutfitData) => void;
}

export const CreatedOutfitsSection = ({ refreshing, }: CreatedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: fetchedOutfits = [], isLoading } = useFetchCreatedOutfitsByUser(userId || '');
    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [showOutfitCreate, setShowOutfitCreate] = useState(false);
    const [outfitToDelete, setOutfitToDelete] = useState<OutfitData | null>(null);
    const [showDeleteOutfit, setShowDeleteOutfit] = useState(false);
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { mutate: deleteOutfit } = useDeleteOutfitMutation();

    const handleCreateOutfit = () => {
        setShowOutfitCreate(true);
    };

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

    const handleCloseOutfitCreate = () => {
        setShowOutfitCreate(false);
    };

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
                    <View className="flex-row items-center justify-between mb-6">
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
                    </View>
                    {fetchedOutfits?.length > 0 ? (
                        fetchedOutfits.map(outfit => (
                            <OutfitCard
                                key={outfit.outfit_id}
                                outfit={outfit}
                                onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                                onPress={() => handleOutfitPress(outfit)}
                                onDelete={handleDeletePress}
                                isDeleteVisible={true}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon={Plus}
                            title="No outfits created yet"
                            description="Start creating your first outfit!"
                            actionText="Create Outfit"
                        />
                    )}
                </View>
            </ScrollView>

            <OutfitCreateModal
                isVisible={showOutfitCreate}
                onClose={handleCloseOutfitCreate}
            />

            <DeleteModalOutfit
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
                    onToggleSave={() => handleToggleSave(selectedOutfit.outfit_id)}
                />
            )}
        </>
    );
};