import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OutfitDetailHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
    >
      <Pressable
        onPress={() => router.back()}
        className="w-10 h-10 bg-gray-800/80 rounded-full items-center justify-center"
      >
        <ArrowLeft size={20} color="#ffffff" />
      </Pressable>
      
      <Text className="text-white text-lg font-semibold">Outfit Details</Text>
      
      <View className="w-10" />
    </View>
  );
}
