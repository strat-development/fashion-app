import { useTheme } from '@/providers/themeContext';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 64 
    }}>
      <Icon size={48} color={colors.textMuted} />
      <Text style={{ 
        color: colors.textSecondary, 
        fontSize: 16, 
        marginTop: 16,
        width: '80%'
      }}>{title}</Text>
      <Text style={{ 
        color: colors.textMuted, 
        textAlign: 'center', 
        marginTop: 8, 
        fontSize: 14 
      }}>{description}</Text>
      {actionText && onAction && (
        <Pressable 
          onPress={onAction}
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Text style={{ 
            color: colors.text, 
            fontWeight: '500',
            fontSize: 14
          }}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};
