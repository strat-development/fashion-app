import { ChatSection } from '@/components/outfit-constructor/ChatSection';
import { ConstuctorSection } from '@/components/outfit-constructor/ConstructorSection';
import { Button } from '@/components/ui/button';
import { useViewContext } from '@/providers/chatViewContext';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { view, setView } = useViewContext();

  return (
    <>
      {view === 'none' && (
        <View className='flex flex-col items-center justify-center h-full bg-gradient-to-b from-black to-gray-900 gap-8'>
          <Text className='text-2xl font-bold text-white text-center'>Welcome, how would like to create an outfit?</Text>
          <View className='flex flex-col gap-4 items-center justify-center'>
            <Button className='bg-blue-200' onPress={() => setView('outfitAIConstructor')}>
              <Text className='text-lg'>AI Constructor</Text>
            </Button>
            <Button className='bg-blue-200' onPress={() => setView('outfitCreator')}>
              <Text className='text-lg'>Create your own outfit</Text>
            </Button>
          </View>
        </View>
      )}
      {view === 'outfitAIConstructor' && <ChatSection />}
      {view === 'outfitCreator' && <ConstuctorSection />}
    </>
  );
}