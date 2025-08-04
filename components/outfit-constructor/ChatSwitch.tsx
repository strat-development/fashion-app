import { Button } from "@/components/ui/button";
import { useViewContext } from "@/providers/chatViewContext";
import { Text, View } from "react-native";

export const ChatSwitch = () => {
    const { view, setView } = useViewContext();

    return (
        <View className='flex flex-row gap-4 bg-gray-400/10 backdrop-blur-lg z-[99999999999999] rounded-full py-2 px-2 mt-4 fixed top-4'>
            <Button onPress={() => setView('outfitAIConstructor')} className={`${view === 'outfitAIConstructor' ? 'bg-blue-300/20 rounded-full' : 'bg-transparent'}`}>
                <Text className={`text-white ${view === 'outfitAIConstructor' ? 'font-bold' : ''}`}>AI</Text>
            </Button>
            <Button onPress={() => setView('outfitCreator')} className={`${view === 'outfitCreator' ? 'bg-blue-300/20 rounded-full' : 'bg-transparent'}`}>
                <Text className={`text-white ${view === 'outfitCreator' ? 'font-bold' : ''}`}>Creator</Text>
            </Button>
        </View>
    )
}