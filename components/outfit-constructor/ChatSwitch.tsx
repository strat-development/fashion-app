import { Button } from "@/components/ui/button";
import { useViewContext } from "@/providers/chatViewContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export const ChatSwitch = () => {
    const { t } = useTranslation();
    const { view, setView } = useViewContext();

    return (
        <View className='self-center flex flex-row gap-1 bg-gray-900/70 border border-gray-800 backdrop-blur-xl z-[99999999999999] rounded-full p-1 mt-4'>
            <Button onPress={() => setView('outfitAIConstructor')} className={`${view === 'outfitAIConstructor' ? 'bg-purple-500/20 rounded-full' : 'bg-transparent'}`}>
                <Text className={`text-white ${view === 'outfitAIConstructor' ? 'font-bold' : ''}`}>{t('chatSwitch.ai')}</Text>
            </Button>
            <Button onPress={() => setView('outfitCreator')} className={`${view === 'outfitCreator' ? 'bg-purple-500/20 rounded-full' : 'bg-transparent'}`}>
                <Text className={`text-white ${view === 'outfitCreator' ? 'font-bold' : ''}`}>{t('chatSwitch.creator')}</Text>
            </Button>
        </View>
    )
}