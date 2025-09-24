import { Button, ButtonText } from '@/components/ui/button';
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
  return (
    <View className='w-[95vw] mt-20 mb-2 flex-row flex-wrap gap-4 items-center justify-between z-20'>
      <View className='flex-row items-center gap-2'>
        <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md' onPress={onShowConversations}>
          <ButtonText className='text-white'>{t('chatSection.conversations') || 'Conversations'}</ButtonText>
        </Button>
        <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md' onPress={onNewChat}>
          <ButtonText className='text-white'>{t('chatSection.newChat') || 'New chat'}</ButtonText>
        </Button>
      </View>
      <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md' onPress={onToggleFilters}>
        <ButtonText className='text-white'>{filtersExpanded ? (t('chatSection.hideFilters') || 'Hide filters') : (t('chatSection.showFilters') || 'Show filters')}</ButtonText>
      </Button>
    </View>
  );
};


