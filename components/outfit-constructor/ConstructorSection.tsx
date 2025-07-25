import { Text, View } from "react-native";
import { ChatSwitch } from "./ChatSwitch";

export const ConstuctorSection = () => {
    return (
        <View className='flex flex-col items-center bg-gray-800 justify-center w-full h-full'>
            <ChatSwitch />
            <Text className='text-white text-lg mt-24'>Select a mode to start creating your outfit</Text>
        </View>
    );
}