import { useState } from "react";
import { View } from "react-native";
import { ChatSwitch } from "./ChatSwitch";
import { OutfitCreateModal } from "../dashboard/modals/OutfitCreateModal";

export const ConstuctorSection = () => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <View className='flex flex-col items-center bg-gray-800 justify-center w-full h-full'>
            <ChatSwitch />
            <OutfitCreateModal isVisible={isVisible}
                onClose={() => setIsVisible(false)}
                isAnimated={false} />
        </View>
    );
}