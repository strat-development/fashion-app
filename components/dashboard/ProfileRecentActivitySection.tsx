import { useTheme } from '@/providers/themeContext';
import { Heart, Plus, Trophy } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export function ProfileRecentActivitySection() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const activities = [
    {
      icon: Trophy,
      color: colors.success,
      text: t('profileRecentActivitySection.activities[0].text'),
    },
    {
      icon: Heart,
      color: colors.accent,
      text: t('profileRecentActivitySection.activities[1].text'),
    },
    {
      icon: Plus,
      color: colors.secondary,
      text: t('profileRecentActivitySection.activities[2].text'),
    },
  ];

  return (
    <View style={{ paddingBottom: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        {t('profileRecentActivitySection.title')}
      </Text>
      <View style={{ gap: 16 }}>
        {activities.map((activity, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 32,
                height: 32,
                backgroundColor: `${activity.color}33`,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <activity.icon size={14} color={activity.color} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 14, flex: 1 }}>
              {activity.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}