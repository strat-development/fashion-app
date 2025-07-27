import { RefreshControl, ScrollView, View } from "react-native"
import { OutfitCard } from "./OutfitCard"
import { EmptyState } from "./EmptyState"
import { Grid } from "lucide-react-native"
import { useFetchFeedOutfits } from "@/fetchers/fetchFeedOutfits"

interface FeedSectionProps {
    refreshing: boolean
}

export const FeedSection = ({ refreshing }: FeedSectionProps) => {
    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits();
    

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
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon={Grid}
                            title="No outfits yet"
                            description="Create your first outfit or follow others to see their creations"
                            actionText="Create Outfit"
                        // onAction={handleCreateOutfit}
                        />
                    )}
                </View>
            </ScrollView>
        </>
    )
}