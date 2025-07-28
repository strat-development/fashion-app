import { Button } from '@/components/ui/button';
import { ModalProps } from '@/types/createOutfitTypes';
import { X } from "lucide-react-native";
import { Modal, Pressable, SafeAreaView, Text, View } from "react-native";

export const DeleteSavedModalOutfit = ({
    isVisible,
    onClose,
    isAnimated,
    onDelete
}: ModalProps) => {
    return (
        <>
            <Modal
                visible={isVisible}
                animationType={isAnimated ? 'slide' : 'none'}
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/50">
                        <Pressable onPress={onClose} className="p-2">
                            <X size={24} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <View className="pt-6 pb-20">
                        <Text className="text-white text-lg font-medium text-center">Are you sure you want to delete this outfit?</Text>

                        <View className="flex-row items-center justify-center mt-4">
                            <Button className="bg-gray-800 px-4 py-2 rounded-lg mr-2" onPress={onClose}>
                                <Text className="text-gray-300 font-medium text-sm">Cancel</Text>
                            </Button>
                            <Button
                                className="bg-red-600 px-4 py-2 rounded-lg"
                                onPress={() => {
                                    onDelete?.();
                                    onClose();
                                }}
                            >
                                <Text className="text-white font-medium text-sm">Delete</Text>
                            </Button>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    )
}