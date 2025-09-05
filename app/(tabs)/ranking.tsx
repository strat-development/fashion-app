import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { View } from 'react-native';

export default function RankingScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <View className="flex-1 justify-center items-center bg-black">
        <ThemedText className="text-white text-2xl font-bold mb-4">
          Ranking
        </ThemedText>
        <ThemedText className="text-gray-400 text-lg text-center px-8">
          Coming Soon
        </ThemedText>
        <ThemedText className="text-gray-500 text-sm text-center px-8 mt-2">
          This feature is under development
        </ThemedText>
      </View>
    </ThemedView>
  );
}
