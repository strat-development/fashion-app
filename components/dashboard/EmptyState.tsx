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

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <View className="items-center justify-center py-20">
      <Icon size={60} color="rgba(255,255,255,0.3)" />
      <Text className="text-white/60 text-lg mt-4">{title}</Text>
      <Text className="text-white/40 text-center mt-2">{description}</Text>
      {actionText && onAction && (
        <Pressable 
          onPress={onAction}
          className="bg-blue-600 px-6 py-3 rounded-full mt-6"
        >
          <Text className="text-white font-medium">{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};
