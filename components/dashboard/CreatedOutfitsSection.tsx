import { useFetchCreatedOutfitsByUser } from "@/fetchers/dashboard/fetchCreatedOutfitsByUser";
import { useFetchSavedOutfits } from "@/fetchers/dashboard/fetchSavedOutfits";
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation";
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation";
import { useUserContext } from "@/providers/userContext";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { enrichOutfit } from '../../utils/enrichOutfit';
import { DeleteModalOutfit } from "../modals/DeleteOutfitModal";
import { OutfitCreateModal } from "../modals/OutfitCreateModal";
import { OutfitDetail } from "../modals/OutfitDetailModal";
import CommentSection from "../outfits/CommentSection";
import { OutfitCard, OutfitData } from "../outfits/OutfitCard";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";

interface CreatedOutfitsSectionProps {
    refreshing: boolean;
    onPress?: (outfit: OutfitData) => void;
}

export const CreatedOutfitsSection = ({ refreshing, }: CreatedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: fetchedOutfits = [], isLoading } = useFetchCreatedOutfitsByUser(userId || '');
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [outfitToDelete, setOutfitToDelete] = useState<OutfitData | null>(null);

    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [showOutfitCreate, setShowOutfitCreate] = useState(false);
    const [showDeleteOutfit, setShowDeleteOutfit] = useState(false);

    const savedOutfitIds = new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []);

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({ outfitId: outfit.outfit_id || "" });
    };

    const handleCreateOutfit = () => {
        setShowOutfitCreate(true);
    };

    const handleDeletePress = (outfit: OutfitData) => {
        setOutfitToDelete(outfit);
        setShowDeleteOutfit(true);
    };

    const handleDeleteSuccess = () => {
        setOutfitToDelete(null);
    };

    const handleCloseOutfitCreate = () => {
        setShowOutfitCreate(false);
    };

    const handleOutfitPress = (outfit: OutfitData) => {
        setSelectedOutfit(outfit);
        setShowOutfitDetail(true);
    };

    const handleCommentPress = (outfitId: string) => {
        console.log('CreatedOutfitsSection: handleCommentPress called with outfitId:', outfitId);
        const raw = fetchedOutfits.find(o => o.outfit_id === outfitId);
        if (!raw) return;
        const enriched = enrichOutfit(raw, savedOutfitIds);
        setSelectedOutfitForComments(enriched);
        console.log('CreatedOutfitsSection: setting showCommentSection to true');
        setShowCommentSection(true);
    };

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
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

    return (
        <>
            <ScrollView
                className="flex-1"
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
                        fetchedOutfits.map(raw => {
                            const outfit = enrichOutfit(raw, savedOutfitIds);
                            return (
                                <OutfitCard
                                    key={outfit.outfit_id}
                                    outfit={outfit}
                                    onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                                    onComment={handleCommentPress}
                                    onPress={() => handleOutfitPress(outfit)}
                                    onDelete={() => handleDeletePress(outfit)}
                                    onUnsave={() => handleUnsavePress(outfit)}
                                    isDeleteVisible={true}
                                />
                            );
                        })
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

            {outfitToDelete && (
                <DeleteModalOutfit
                    isVisible={showDeleteOutfit}
                    onClose={() => setShowDeleteOutfit(false)}
                    isAnimated={true}
                    outfitId={outfitToDelete.outfit_id}
                    onSuccess={handleDeleteSuccess}
                />
            )}

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
                outfitId={selectedOutfitForComments?.outfit_id || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />
        </>
    );
};