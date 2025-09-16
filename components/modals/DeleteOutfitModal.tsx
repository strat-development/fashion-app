import { useDeleteOutfitMutation } from '@/mutations/outfits/DeleteOutfitMutation';
import { ModalProps } from '@/types/createOutfitTypes';
import { AlertTriangle, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from 'react-i18next';

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
                <View className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-red-500/20 rounded-full items-center justify-center mr-3">
                                <AlertTriangle size={16} color="#EF4444" />
                            </View>
                            <Text className="text-white text-lg font-semibold">{t('deleteModalOutfit.title')}</Text>
                        </View>
                        <Pressable onPress={onClose} className="p-1">
                            <X size={20} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <Text className="text-gray-300 text-base mb-6 leading-5">
                        {t('deleteModalOutfit.message')}
                    </Text>

                    {/* Actions */}
                    <View className="flex-row space-x-3">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 bg-gray-800 py-3 rounded-xl border border-gray-700"
                        >
                            <Text className="text-gray-300 font-medium text-center">{t('deleteModalOutfit.cancel')}</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            disabled={isPending}
                            className={`flex-1 py-3 rounded-xl ${isPending ? 'bg-red-600/50' : 'bg-red-600'}`}
                        >
                            <Text className="text-white font-medium text-center">
                                {isPending ? t('deleteModalOutfit.deleting') : t('deleteModalOutfit.delete')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};