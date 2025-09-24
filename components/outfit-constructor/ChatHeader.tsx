import { Button, ButtonText } from '@/components/ui/button';
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
  return (
    <View className='w-[95vw] mb-2 flex-row flex-wrap gap-4 items-center justify-between z-20'>
      <View className='flex-row items-center gap-2'>
        <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md flex-row items-center gap-2' onPress={onShowConversations}>
          <MessageSquare size={16} color={'#e5e7eb'} />
          <ButtonText className='text-white'>{t('chatSection.conversations') || 'Conversations'}</ButtonText>
        </Button>
        <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md flex-row items-center gap-2' onPress={onNewChat}>
          <Plus size={16} color={'#e5e7eb'} />
          <ButtonText className='text-white'>{t('chatSection.newChat') || 'New chat'}</ButtonText>
        </Button>
      </View>
      <Button variant='outline' action='primary' size='sm' className='bg-white/5 border-white/10 backdrop-blur-md flex-row items-center gap-2' onPress={onToggleFilters}>
        <SlidersHorizontal size={16} color={'#e5e7eb'} />
        <ButtonText className='text-white'>{filtersExpanded ? (t('chatSection.hideFilters') || 'Hide filters') : (t('chatSection.showFilters') || 'Show filters')}</ButtonText>
      </Button>
    </View>
  );
};


