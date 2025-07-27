import { RefreshControl, Text, View } from "react-native"
import { ScrollView } from "react-native"
import { EmptyState } from "./EmptyState"
import { Bookmark } from "lucide-react-native"
import { OutfitCard } from "./OutfitCard"
import { useFetchSavedOutfits } from "@/fetchers/fetchSavedOutfits"
import { useUserContext } from "@/providers/userContext"

interface SavedOutfitsSectionProps {
    refreshing: boolean
}

export const SavedOutfitsSection = ({ refreshing }: SavedOutfitsSectionProps) => {
    const { userId } = useUserContext();
    const { data: savedOutfits = [], isLoading} = useFetchSavedOutfits(userId || '');

    return (
        <>
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} />
                }
            >
                <View className="pt-6 pb-20">
                    {/* <Text className="text-white text-xl font-semibold mb-6">Saved Outfits</Text> */}
                    {savedOutfits.length > 0 ? (
                        savedOutfits.map(outfit => (
                            <OutfitCard 
                                key={outfit}
                                outfit={outfit}
                            // onToggleLike={toggleLike}
                            // onToggleSave={toggleSave}
                            // onComment={handleComment}
                            // onShare={handleShare}
                            // onPress={handleOutfitPress}
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
        </>
    )
}