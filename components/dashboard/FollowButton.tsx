import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUserContext } from '@/providers/userContext';
import { useFetchIsFollowed } from '@/fetchers/fetchIsFollowed';
import { useFollowUserMutation } from '@/mutations/FollowUserMutation';
import { useUnFollowUserMutation } from '@/mutations/UnfollowUserMutation';

interface FollowButtonProps {
  profileId: string;
  isPublic: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ profileId, isPublic }) => {
  const { userId } = useUserContext();
  const { data: followStatus, isLoading: followLoading } = useFetchIsFollowed(userId || '', profileId || '');
  const isFollowed = followStatus?.isFollowed || false;
  const isPending = followStatus?.isPending || false;
  const { mutate: followUser } = useFollowUserMutation();
  const { mutate: unFollowUser } = useUnFollowUserMutation();

  if (!userId || userId === profileId) return null;

  if (isPending && !isPublic) {
    return (
      <Pressable disabled style={{ backgroundColor: '#666', paddingVertical: 12, borderRadius: 8, marginTop: 16, opacity: 0.5 }}>
        <Text style={{ color: '#ccc', textAlign: 'center', fontSize: 14 }}>Follow Request Pending</Text>
      </Pressable>
    );
  }

  return isFollowed ? (
    <Pressable
      onPress={() => unFollowUser({ followedAccountId: profileId, userId: userId })}
      style={{ backgroundColor: '#222', paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#ccc', fontWeight: 'bold' }}>Unfollow</Text>
      </View>
    </Pressable>
  ) : (
    <Pressable
      onPress={() => followUser({ followedAccountId: profileId, userId: userId, isPublicAccount: isPublic })}
      style={{ backgroundColor: '#222', paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
    >
      <Text style={{ color: '#ccc', textAlign: 'center', fontSize: 14 }}>Follow</Text>
    </Pressable>
  );
};
