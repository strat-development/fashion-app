import { Button, ButtonText } from '@/components/ui/button';
import { TextInput, View } from 'react-native';

type ChatComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  placeholder: string;
};

export const ChatComposer = ({ value, onChange, onSend, sending, placeholder }: ChatComposerProps) => {
  return (
    <View className='w-full mb-16'>
      <View className='flex-row items-end gap-3'>
        <View className='flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm'>
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline={true}
            numberOfLines={1}
            placeholder={placeholder}
            placeholderTextColor='#9CA3AF'
            onSubmitEditing={onSend}
            className='px-4 py-3 text-gray-100 text-base'
            style={{ minHeight: 48, maxHeight: 120 }}
          />
        </View>
        <Button 
          onPress={onSend} 
          action='primary' 
          variant='solid' 
          size='lg' 
          className='bg-blue-600 hover:bg-blue-700 border-0 rounded-2xl px-6 h-12'
          disabled={sending || !value.trim()}
        >
          <ButtonText className='text-white font-medium'>
            {sending ? '...' : 'Send'}
          </ButtonText>
        </Button>
      </View>
    </View>
  );
};


