import { useFetchFeedOutfits } from "@/fetchers/outfits/fetchFeedOutfits"
import { useFetchSavedOutfits } from "@/fetchers/outfits/fetchSavedOutfits"
import { useDeleteSavedOutfitMutation } from "@/mutations/outfits/DeleteSavedOutfitMutation"
import { useSaveOutfitMutation } from "@/mutations/outfits/SaveOutfitMutation"
import { useTheme } from "@/providers/themeContext"
import { useUserContext } from "@/providers/userContext"
import { Grid } from "lucide-react-native"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native"
import { enrichOutfit } from '../../utils/enrichOutfit'
import { EmptyState } from "../dashboard/EmptyState"
import OutfitDetailImages from "../outfit-detail/OutfitDetailImages"
import OutfitDetailInfo from "../outfit-detail/OutfitDetailInfo"
import OutfitDetailSections from "../outfit-detail/OutfitDetailSections"
import CommentSection from "./CommentSection"
import { OutfitCard, OutfitData } from "./OutfitCard"

interface FeedSectionProps {
    refreshing: boolean
    onPress?: (outfit: OutfitData) => void;
}

export const FeedSection = ({ refreshing }: FeedSectionProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { data: fetchedOutfits = [] } = useFetchFeedOutfits();
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
    const [selectedMeta, setSelectedMeta] = useState<{ positive: number; negative: number; isLiked: boolean; isDisliked: boolean; isSaved?: boolean; comments: number } | null>(null);
    const [selectedUserData, setSelectedUserData] = useState<{ nickname?: string | null; user_avatar?: string | null } | undefined>(undefined);
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
        setSelectedMeta(null);
        setShowOutfitDetail(true);
    };

    const handleOpenDetailInline = (args: { outfit: OutfitData; userData?: { nickname?: string | null; user_avatar?: string | null }; rating: { positive: number; negative: number; isLiked: boolean; isDisliked: boolean; isSaved?: boolean; comments: number } }) => {
        setSelectedOutfit(args.outfit);
        setSelectedMeta(args.rating);
        setSelectedUserData(args.userData);
        setShowOutfitDetail(true);
    };

    const handleCommentPress = (outfitId: string) => {
        setCommentOutfitId(outfitId);
        const enrichedOutfit = enrichedOutfits.find(o => o.outfit_id === outfitId);
        setSelectedOutfitForComments(enrichedOutfit || null);
        setShowCommentSection(true);
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

            <Modal visible={showOutfitDetail} transparent animationType="fade" onRequestClose={() => setShowOutfitDetail(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <Pressable style={{ flex: 1 }} onPress={() => setShowOutfitDetail(false)} />
                    <View style={{ maxHeight: '90%', backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
                        {selectedOutfit && (
                            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                                {/* Header */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{selectedOutfit.outfit_name}</Text>
                                    <Pressable onPress={() => setShowOutfitDetail(false)}>
                                        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{t('common.close') || 'Close'}</Text>
                                    </Pressable>
                                </View>

                                {/* Info */}
                                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                                    <OutfitDetailInfo
                                        outfit={selectedOutfit}
                                        userData={selectedUserData}
                                        tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                                    />
                                </View>

                                {/* Images */}
                                <View style={{ paddingHorizontal: 16 }}>
                                    <OutfitDetailImages
                                        imageUrls={Array.isArray(selectedOutfit.outfit_elements_data)
                                            ? (selectedOutfit.outfit_elements_data as any[])
                                                .map((el) => (typeof el === 'string' ? el : el?.imageUrl))
                                                .filter((u): u is string => typeof u === 'string' && !!u)
                                            : []}
                                        elementsData={Array.isArray(selectedOutfit.outfit_elements_data)
                                            ? (selectedOutfit.outfit_elements_data as any[]).filter((el) => el && typeof el === 'object' && (el as any).imageUrl)
                                            : [] as any}
                                    />
                                </View>

                                {/* Sections */}
                                <OutfitDetailSections
                                    description={selectedOutfit.description}
                                    tags={Array.isArray(selectedOutfit.outfit_tags) ? selectedOutfit.outfit_tags : (selectedOutfit.outfit_tags ? [selectedOutfit.outfit_tags] : [])}
                                />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    )
}