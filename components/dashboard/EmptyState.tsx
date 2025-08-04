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
    <View className="items-center justify-center py-16">
      <Icon size={48} color="#4B5563" />
      <Text className="text-gray-300 text-base mt-4">{title}</Text>
      <Text className="text-gray-500 text-center mt-2 text-sm">{description}</Text>
      {actionText && onAction && (
        <Pressable 
          onPress={onAction}
          className="bg-gray-800 px-4 py-2 rounded-lg mt-4"
        >
          <Text className="text-gray-300 font-medium text-sm">{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};
