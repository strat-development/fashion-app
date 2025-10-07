import { Button, ButtonText } from '@/components/ui/button';
import { useTheme } from '@/providers/themeContext';
import { BlurView } from 'expo-blur';
import { MessageSquare, Plus, SlidersHorizontal } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

type ChatHeaderProps = {
  onShowConversations: () => void;
  onNewChat: () => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  title?: string;
  t: (k: string) => string;
};

export const ChatHeader = ({ onShowConversations, onNewChat, filtersExpanded, onToggleFilters, title, t }: ChatHeaderProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: isDark ? 'transparent' : colors.surface,
        borderBottomWidth: 0,
      }}
    >
      <BlurView
        intensity={70}
        tint={isDark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          zIndex: -1,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      />

      <View
        style={{
          width: '100%',
          height: 72,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          gap: 12,
          zIndex: 20,
        }}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
          <Plus size={20}
            color={colors.white+'aa'} />
        </Button>
      </View>
      
      {/* Filter Button with Circle Background - matching Feed style */}
      <TouchableOpacity
        onPress={onToggleFilters}
        style={{
          width: 44,
          height: 44,
          borderRadius: 100,
          backgroundColor: filtersExpanded ? colors.accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: filtersExpanded ? 0.1 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          borderWidth: filtersExpanded ? 0 : 1,
          borderColor: filtersExpanded ? 'transparent' : colors.border,
        }}
      >
        <SlidersHorizontal 
          size={18} 
          color={filtersExpanded ? colors.white : colors.textSecondary} 
        />
      </TouchableOpacity>
      </View>
    </View>
  );
};


