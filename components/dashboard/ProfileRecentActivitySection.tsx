import { useFetchRecentActivity } from '@/fetchers/dashboard/fetchRecentActivity';
import { useTheme } from '@/providers/themeContext';
import { Heart, MessageCircle, Plus, Trophy } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  outfit_id: string | null;
  comment_id: string | null;
  created_at: string;
}

export function ProfileRecentActivitySection({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: activities, isLoading } = useFetchRecentActivity(userId);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created_post':
        return Plus;
      case 'new_comment':
        return MessageCircle;
      default:
        if (activityType.startsWith('milestone')) {
          return Trophy;
        }
        return Heart;
    }
  };

  const getActivityText = (activityType: string) => {
    const milestoneMatch = activityType.match(/\d+/);
    if (milestoneMatch) {
      const milestone = parseInt(milestoneMatch[0], 10);
      return t('profileRecentActivitySection.milestone', { count: milestone });
    }
    return t(`profileRecentActivitySection.${activityType}`);
  };

  if (isLoading) {
    return <ActivityIndicator color={colors.accent} />;
  }

  return (
    <View style={{ paddingBottom: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        {t('profileRecentActivitySection.title')}
      </Text>
      <View style={{ gap: 12, paddingVertical: 16 }}>
        {activities && activities.length > 0 ? (
          (activities as unknown as Activity[]).map((activity, index) => {
            const Icon = getActivityIcon(activity.activity_type);
            return (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon size={18} color={colors.accent} />
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                  {getActivityText(activity.activity_type)}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>
            {t('profileRecentActivitySection.noActivity')}
          </Text>
        )}
      </View>
    </View>
  );
}