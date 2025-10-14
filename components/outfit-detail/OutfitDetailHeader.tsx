import { useTheme } from "@/providers/themeContext";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OutfitDetailHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 16,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          width: 44,
          height: 44,
          backgroundColor: colors.surface,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <ArrowLeft size={20} color={colors.text} />
      </Pressable>
      
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
        {t('outfitDetail.header.title')}
      </Text>
      
      <View style={{ width: 44 }} />
    </View>
  );
}