import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LogOut, Palette } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export function ProfileSettingsButtons() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
      
      const session = await supabase?.auth.getSession();
      const userId = session?.data?.session?.user?.id;
      if (userId) {
        await AsyncStorage.removeItem(`user_ctx:${userId}`);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={{ gap: 12, marginTop: 16 }}>
      <Pressable
        onPress={() => router.push('/theme-settings' as any)}
        style={{
          backgroundColor: `${colors.accent}33`,
          borderWidth: 1,
          borderColor: `${colors.accent}4D`,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Palette size={18} color={colors.accent} />
        <Text style={{ color: colors.accent, fontWeight: '500', marginLeft: 8 }}>
          {t('profileSettingsButtons.themeSettings')}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: `${colors.error}33`,
          borderWidth: 1,
          borderColor: `${colors.error}4D`,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogOut size={18} color={colors.error} />
        <Text style={{ color: colors.error, fontWeight: '500', marginLeft: 8 }}>
          {t('profileSettingsButtons.logout')}
        </Text>
      </Pressable>
    </View>
  );
}