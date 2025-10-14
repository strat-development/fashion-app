import { useTheme } from '@/providers/themeContext';
import { Heart, Plus, Trophy } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export function ProfileRecentActivitySection() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const activityTexts = (t('profileRecentActivitySection.activities', { returnObjects: true }) as Array<{ text: string }>) || [];

  const activities = [
    {
      icon: Trophy,
      color: colors.success,
      text: activityTexts[0]?.text ?? '',
    },
    {
      icon: Heart,
      color: colors.accent,
      text: activityTexts[1]?.text ?? '',
    },
    {
      icon: Plus,
      color: colors.secondary,
      text: activityTexts[2]?.text ?? '',
    },
  ];

  return (
    <View style={{ paddingBottom: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        {t('profileRecentActivitySection.title')}
      </Text>
      <View style={{ gap: 12, paddingVertical: 16 }}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon size={18} color={activity.color} />
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>{activity.text}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}