import { useFetchIsFollowed } from '@/fetchers/fetchIsFollowed';
import { useFollowUserMutation } from '@/mutations/FollowUserMutation';
import { useUnFollowUserMutation } from '@/mutations/UnfollowUserMutation';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface FollowButtonProps {
  profileId: string;
  isPublic: boolean;
}

export const FollowButton = ({ profileId, isPublic }: FollowButtonProps) => {
  const { t } = useTranslation();
  const { userId } = useUserContext();
  const { colors } = useTheme();
  const { data: followStatus } = useFetchIsFollowed(userId || '', profileId || '');
  const isFollowed = followStatus?.isFollowed || false;
  const isPending = followStatus?.isPending || false;
  const { mutate: followUser } = useFollowUserMutation();
  const { mutate: unFollowUser } = useUnFollowUserMutation();

  if (!userId || userId === profileId) return null;

  if (isPending && !isPublic) {
    return (
      <Pressable disabled style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, borderRadius: 8, marginTop: 16, opacity: 0.7 }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14 }}>{t('followButton.pending')}</Text>
      </Pressable>
    );
  }

  return isFollowed ? (
    <Pressable
      onPress={() => unFollowUser({ followedAccountId: profileId, userId: userId })}
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{t('followButton.unfollow')}</Text>
      </View>
    </Pressable>
  ) : (
    <Pressable
      onPress={() => followUser({ followedAccountId: profileId, userId: userId, isPublicAccount: isPublic })}
      style={{ backgroundColor: colors.accent, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
    >
      <Text style={{ color: colors.onAccent, textAlign: 'center', fontSize: 14, fontWeight: '600' }}>{t('followButton.follow')}</Text>
    </Pressable>
  );
};