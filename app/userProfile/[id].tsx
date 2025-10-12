import { UserProfile } from '@/app/(tabs)/userProfile';
import { useLocalSearchParams } from 'expo-router';
import { useUserContext } from '@/providers/userContext';
import React from 'react';



export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useUserContext();
  const isOwnProfile = !id || id === userId;
  const profileId = (isOwnProfile ? userId : id) ?? '';

  return <UserProfile isOwnProfile={isOwnProfile} profileId={profileId} />;
}