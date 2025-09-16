import { useFetchFeedOutfits } from "@/fetchers/outfits/fetchFeedOutfits"
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits"
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation"
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation"
import { useUserContext } from "@/providers/userContext"
import { Grid } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Alert, RefreshControl, ScrollView, View } from "react-native"
import { useTranslation } from "react-i18next";
import { enrichOutfit } from '../../utils/enrichOutfit'
import { EmptyState } from "../dashboard/EmptyState"
import CommentSection from "./CommentSection"
import { OutfitCard, OutfitData } from "./OutfitCard"

interface FeedSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const FeedSection = ({ refreshing }: FeedSectionProps) => {
    const { t } = useTranslation();
    const { data: fetchedOutfits = [], isLoading } = useFetchFeedOutfits();
    const { userId } = useUserContext();
    const { mutate: saveOutfit } = useSaveOutfitMutation();
    const { data: savedOutfits = [] } = useFetchSavedOutfits(userId || '');
    const { mutate: unsaveOutfit } = useDeleteSavedOutfitMutation();

    const savedOutfitIds = useMemo(() => 
        new Set(savedOutfits?.map(outfit => outfit.outfit_id) || []), 
        [savedOutfits?.map(outfit => outfit.outfit_id).join(',')]
    );

    const enrichedOutfits = useMemo(() => {
        return fetchedOutfits?.map(raw => enrichOutfit(raw, savedOutfitIds)) || [];
    }, [fetchedOutfits, savedOutfitIds]);

    const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
    const [showOutfitDetail, setShowOutfitDetail] = useState(false);
    const [selectedOutfitForComments, setSelectedOutfitForComments] = useState<OutfitData | null>(null);
    const [commentOutfitId, setCommentOutfitId] = useState<string | null>(null);
    const [showCommentSection, setShowCommentSection] = useState(false);

    const handleUnsavePress = (outfit: OutfitData) => {
        unsaveOutfit({
            outfitId: outfit.outfit_id || "",
            userId: userId || ""
        });
    };

    const handleToggleSave = (outfitId: string) => {
        if (!userId) {
            Alert.alert(t('feedSection.alerts.notLoggedIn.title'), t('feedSection.alerts.notLoggedIn.message'));
            return;
        }

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
        setCommentOutfitId(outfitId);
        const enrichedOutfit = enrichedOutfits.find(o => o.outfit_id === outfitId);
        setSelectedOutfitForComments(enrichedOutfit || null);
        setShowCommentSection(true);
    };

    const handleCloseOutfitDetail = () => {
        setShowOutfitDetail(false);
        setSelectedOutfit(null);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} />
                }
            >
                <View className="pt-6 pb-20">
                    {enrichedOutfits?.length > 0 ? (
                        enrichedOutfits.map(outfit => (
                            <OutfitCard
                                key={outfit.outfit_id}
                                outfit={outfit}
                                onToggleSave={() => handleToggleSave(outfit.outfit_id)}
                                onComment={handleCommentPress}
                                onPress={() => handleOutfitPress(outfit)}
                                onUnsave={() => handleUnsavePress(outfit)}
                            />
                        ))
                    ) : (
                            <EmptyState
                                icon={Grid}
                                title={t('feedSection.emptyState.title')}
                                description={t('feedSection.emptyState.description')}
                                actionText={t('feedSection.emptyState.actionText')}
                            />
                        )}
                </View>
            </ScrollView>

            <CommentSection
                isVisible={showCommentSection}
                onClose={() => setShowCommentSection(false)}
                outfitId={commentOutfitId || ''}
                outfitTitle={selectedOutfitForComments?.outfit_name || ''}
            />
        </View>
    )
}