import { supabase } from '@/lib/supabase';
import { RedGradient, ThemedGradient, useTheme } from '@/providers/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FileText, LogOut, Settings as SettingsIcon } from 'lucide-react-native';
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
      <ThemedGradient
        style={{
          borderRadius: 12,
        }}
      >
        <Pressable
          onPress={() => router.push('/theme-settings' as any)}
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SettingsIcon size={18} color={colors.white} />
          <Text style={{ color: colors.white, fontWeight: '500', marginLeft: 8 }}>
            {t('profileSettingsButtons.themeSettings')}
          </Text>
        </Pressable>
      </ThemedGradient>

      <ThemedGradient
        style={{
          borderRadius: 12,
        }}
      >
        <Pressable
          onPress={() => router.push('/privacy-policy' as any)}
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileText size={18} color={colors.white} />
          <Text style={{ color: colors.white, fontWeight: '500', marginLeft: 8 }}>
            Privacy Policy
          </Text>
        </Pressable>
      </ThemedGradient>

      <RedGradient
        style={{
          borderRadius: 12,
        }}
      >
        <Pressable
          onPress={handleLogout}
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut size={18} color={colors.white} />
          <Text style={{ color: colors.white, fontWeight: '500', marginLeft: 8 }}>
            {t('profileSettingsButtons.logout')}
          </Text>
        </Pressable>
      </RedGradient>
    </View>
  );
}