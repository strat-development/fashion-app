import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OutfitDetailHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: 16,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          width: 44,
          height: 44,
          backgroundColor: '#1f1f1fcc',
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#2a2a2a',
        }}
      >
        <ArrowLeft size={20} color="#ffffff" />
      </Pressable>
      
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Outfit Details</Text>
      
      <View style={{ width: 44 }} />
    </View>
  );
}
