import { EmptyState } from "@/components/dashboard/EmptyState";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useTheme } from "@/providers/themeContext";
import { OutfitData } from "@/types/createOutfitTypes";
import { router } from "expo-router";
import { Grid } from "lucide-react-native";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

interface FeedListProps {
    outfits: OutfitData[];
    isLoading: boolean;
    hasMore: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onEndReached: () => void;
    onToggleSave: (outfitId: string) => void;
    onComment: (outfit: OutfitData) => void;
    onShare: (outfit: OutfitData) => void;
    onUnsave: (outfit: OutfitData) => void;
}

export function FeedList({
    outfits,
    isLoading,
    hasMore,
    refreshing,
    onRefresh,
    onEndReached,
    onToggleSave,
    onComment,
    onShare,
    onUnsave
}: FeedListProps) {
    const { colors } = useTheme();

    return (
        <FlatList
            style={{ backgroundColor: colors.background }}
            data={outfits}
            keyExtractor={item => item.outfit_id}
            renderItem={({ item: outfit }) => (
                <OutfitCard
                    outfit={outfit}
                    onToggleSave={() => onToggleSave(outfit.outfit_id)}
                    onComment={() => onComment(outfit)}
                    onUnsave={() => onUnsave(outfit)}
                    onShare={() => onShare(outfit)}
                    onPress={() => router.push({
                        pathname: "/outfit/[id]",
                        params: { id: outfit.outfit_id }
                    })}
                />
            )}
            ListEmptyComponent={
                isLoading ? (
                    <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>Loading outfits...</Text>
                    </View>
                ) : (
                    <EmptyState
                        icon={Grid}
                        title="No outfits yet"
                        description="Create your first outfit or follow others to see their creations"
                        actionText="Create Outfit"
                    />
                )
            }
            refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isLoading && hasMore && outfits.length > 0 ? (
                    <View style={{ paddingVertical: 16 }}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : null
            }
            contentContainerStyle={{ paddingTop: 0, paddingBottom: 80, paddingHorizontal: 0 }}
        />
    );
}
