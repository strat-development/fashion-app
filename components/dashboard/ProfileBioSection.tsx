import { useTheme } from '@/providers/themeContext';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileBioSectionProps {
  bio: string | null;
}

export function ProfileBioSection({ bio }: ProfileBioSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 24,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        {t('profileBioSection.title')}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 16, lineHeight: 24 }}>
        {bio || t('profileBioSection.noBio')}
      </Text>
    </View>
  );
}