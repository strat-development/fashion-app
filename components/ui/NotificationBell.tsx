import { useTheme } from '@/providers/themeContext';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface NotificationBellProps {
  count: number;
  onPress: () => void;
}

export function NotificationBell({ count, onPress }: NotificationBellProps) {
  const { colors } = useTheme();
  
  return (
    <Pressable onPress={onPress} style={{ padding: 6 }}>
      <View>
        <Bell size={20} color={colors.text} />
        {count > 0 && (
          <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: colors.error, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 }}>
            <Text style={{ color: colors.white, fontSize: 10, fontWeight: '700' }}>{count}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}


