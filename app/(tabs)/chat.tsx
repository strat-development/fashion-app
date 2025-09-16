import { ChatSection } from '@/components/outfit-constructor/ChatSection';
import { ConstuctorSection } from '@/components/outfit-constructor/ConstructorSection';
import { Button } from '@/components/ui/button';
import { useViewContext } from '@/providers/chatViewContext';
import { useTheme } from '@/providers/themeContext';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { view, setView } = useViewContext();
  const { t } = useTranslation();

  return (
    <>
      {view === 'none' && (
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: colors.background,
          gap: 32 
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: colors.text, 
            textAlign: 'center' 
          }}>{t('homeScreen.welcomeMessage')}</Text>
          <View style={{ 
            flexDirection: 'column', 
            gap: 16, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Button 
              style={{ backgroundColor: colors.accent }}
              onPress={() => setView('outfitAIConstructor')}
            >
              <Text style={{ fontSize: 18, color: '#fff' }}>{t('homeScreen.aiConstructorButton')}</Text>
            </Button>
            <Button 
              style={{ backgroundColor: colors.accent }}
              onPress={() => setView('outfitCreator')}
            >
              <Text style={{ fontSize: 18, color: '#fff' }}>{t('homeScreen.createOwnOutfitButton')}</Text>
            </Button>
          </View>
        </View>
      )}
      {view === 'outfitAIConstructor' && <ChatSection />}
      {view === 'outfitCreator' && <ConstuctorSection />}
    </>
  );
}