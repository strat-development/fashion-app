import { useDeleteOutfitMutation } from '@/mutations/outfits/DeleteOutfitMutation';
import { useTheme } from '@/providers/themeContext';
import { ModalProps } from '@/types/createOutfitTypes';
import { AlertTriangle, X } from "lucide-react-native";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from "react-native";

interface DeleteOutfitModalProps {
    outfitId: string;
    userId?: string;
    onSuccess?: () => void;
}

export const DeleteModalOutfit = ({
    isVisible,
    onClose,
    isAnimated,
    outfitId,
    onSuccess,
    userId
}: ModalProps & DeleteOutfitModalProps) => {
    const { t } = useTranslation();
    const { mutate: deleteOutfit, isPending } = useDeleteOutfitMutation();
    const { colors } = useTheme();

    const handleDelete = () => {
        if (!userId) {
            console.error(t('deleteModalOutfit.error'));
            return;
        }

        deleteOutfit({
            outfitId,
            userId
        }, {
            onSuccess: () => {
                onClose();
                onSuccess?.();
            },
            onError: (error) => {
                console.error('Delete outfit error:', error);
            }
        });
    };

    return (
        <Modal
            visible={isVisible}
            animationType={isAnimated ? 'fade' : 'none'}
            transparent={true}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
                <View
                    className="rounded-2xl p-6 w-full max-w-sm border"
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${colors.error}20` }}
                            >
                                <AlertTriangle size={16} color={colors.error} />
                            </View>
                            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                                {t('deleteModalOutfit.title')}
                            </Text>
                        </View>
                        <Pressable onPress={onClose} className="p-1">
                            <X size={20} color={colors.text} />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <Text className="text-base mb-6 leading-5" style={{ color: colors.textSecondary }}>
                        {t('deleteModalOutfit.message')}
                    </Text>

                    {/* Actions */}
                    <View className="flex-row space-x-3">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 py-3 rounded-xl border"
                            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                        >
                            <Text className="font-medium text-center" style={{ color: colors.text }}>
                                {t('deleteModalOutfit.cancel')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            disabled={isPending}
                            className={`flex-1 py-3 rounded-xl ${isPending ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: colors.error }}
                        >
                            <Text className="font-medium text-center" style={{ color: colors.white }}>
                                {isPending ? t('deleteModalOutfit.deleting') : t('deleteModalOutfit.delete')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};