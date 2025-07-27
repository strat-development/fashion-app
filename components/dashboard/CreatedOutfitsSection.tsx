import { useFetchCreatedOutfits } from "@/fetchers/fetchCreatedOutfits";
import { useUserContext } from "@/providers/userContext";
import { Plus } from "lucide-react-native";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Button } from "../ui/button";
import { EmptyState } from "./EmptyState";
import { OutfitCard } from "./OutfitCard";

interface CreatedOutfitsSectionProps {
    refreshing: boolean;
}

export const CreatedOutfitsSection = ({ refreshing }: CreatedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: fetchedOutfits = [], isLoading } = useFetchCreatedOutfits(userId || '');

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
                            // onPress={handleCreateOutfit}
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
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon={Plus}
                            title="No outfits created yet"
                            description="Start creating your first outfit!"
                            actionText="Create Outfit"
                            // onAction={handleCreateOutfit}
                        />
                    )}
                </View>
            </ScrollView>
        </>
    );
};