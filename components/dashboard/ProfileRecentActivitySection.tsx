import { useTheme } from '@/providers/themeContext';
import { Heart, Plus, Trophy } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export function ProfileRecentActivitySection() {
  const { colors } = useTheme();

  const activities = [
    {
      icon: Trophy,
      color: colors.success,
      text: 'Your outfit got 50+ likes!',
    },
    {
      icon: Heart,
      color: colors.accent,
      text: 'Liked 5 new outfits',
    },
    {
      icon: Plus,
      color: colors.secondary,
      text: 'Created "Summer Casual Look"',
    },
  ];

  return (
    <View style={{ paddingBottom: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        Recent Activity
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
