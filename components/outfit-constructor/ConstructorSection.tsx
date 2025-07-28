import { useState } from "react";
import { View } from "react-native";
import { OutfitCreate } from "../dashboard/modals/OutfitCreateModal";
import { ChatSwitch } from "./ChatSwitch";

export const ConstuctorSection = () => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <View className='flex flex-col items-center bg-gray-800 justify-center w-full h-full'>
            <ChatSwitch />
            <OutfitCreate isVisible={isVisible}
                onClose={() => setIsVisible(false)}
                isAnimated={false} />
        </View>
    );
}