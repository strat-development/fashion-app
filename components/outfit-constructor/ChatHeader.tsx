import { Button, ButtonText } from '@/components/ui/button';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { MessageSquare, Plus, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';

type ChatHeaderProps = {
  onShowConversations: () => void;
  onNewChat: () => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  title?: string;
  t: (k: string) => string;
};

export const ChatHeader = ({ onShowConversations, onNewChat, filtersExpanded, onToggleFilters, title, t }: ChatHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View className='w-[95vw] mb-2 flex-row flex-wrap gap-4 items-center justify-between z-20'>
      <View className='flex-row items-center gap-2'>
        <Button
          variant='solid'
          action='primary'
          size='sm'
          className='flex-row items-center gap-2 text-white/70'
          style={{ borderRadius: 999, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 }}
          onPress={onShowConversations}
        >
          <MessageSquare size={16} color={colors.white+'aa'} />
          <ButtonText style={{ color: colors.white }}>{t('chatSection.conversations') || 'Chat'}</ButtonText>
        </Button>
        <Button
          variant='solid'
          action='primary'
          size='sm'
          className='flex-row items-center gap-2'
          style={{ borderRadius: 999, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 }}
          onPress={onNewChat}
        >
          <Plus size={24}
            color={colors.white+'aa'} />
          {/* <ButtonText style={{ color: colors.white }}>{t('chatSection.newChat') || 'New chat'}</ButtonText> */}
        </Button>
      </View>
      <Button variant='solid' action='primary' size='sm' className='flex-row items-center gap-2' style={{ borderRadius: 999, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 }} onPress={onToggleFilters}>
        <SlidersHorizontal size={16} color={colors.textSecondary} />
      </Button>
    </View>
  );
};


