import { Button, ButtonText } from '@/components/ui/button';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { Send, Square } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

type ChatComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  sending: boolean;
  placeholder: string;
};

export const ChatComposer = ({ value, onChange, onSend, onStop, sending, placeholder }: ChatComposerProps) => {
  const { colors } = useTheme();
  
  return (
    <View className='w-full mb-16'>
      <View className='flex-row items-end gap-3'>
        <View className='flex-1 rounded-2xl' style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }}>
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline={true}
            numberOfLines={1}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={onSend}
            className='px-4 py-3 h-24 text-base'
            style={{ minHeight: 48, maxHeight: 120, color: colors.text }}
          />
        </View>
        {sending ? (
          <Pressable
            onPress={onStop}
            className='rounded-2xl p-3 h-12 w-12 items-center justify-center'
            style={{ backgroundColor: colors.error, borderWidth: 1, borderColor: colors.error }}
          >
            <Square size={20} color={colors.white} fill={colors.white} />
          </Pressable>
        ) : (
          <Pressable 
            onPress={onSend} 
            className='rounded-2xl p-3 h-12 w-12 items-center justify-center overflow-hidden'
            disabled={!value.trim()}
            style={{ opacity: !value.trim() ? 0.5 : 1, position: 'relative' }}
          >
            <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            <View style={{ zIndex: 1 }}>
              <Send size={20} color="#FFFFFF" />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
};


