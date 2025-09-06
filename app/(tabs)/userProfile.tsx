import { CreatedOutfitsSection } from '@/components/dashboard/CreatedOutfitsSection';
import { SavedOutfitsSection } from '@/components/dashboard/SavedOutfitsSection';
import { UserStatistics } from '@/components/dashboard/UserStatistics';
import { ProfileEdit } from '@/components/modals/ProfileEditModal';
import { Button, ButtonText } from '@/components/ui/button';
import { useFetchNotifications } from '@/fetchers/dashboard/fetchUserNotifications';
import { supabase } from '@/lib/supabase';
import { useAcceptFollowerMutation } from '@/mutations/AcceptFollower';
import { useUnFollowUserMutation } from '@/mutations/UnfollowUserMutation';
import { useUserContext } from '@/providers/userContext';
import { Image } from 'expo-image';
import { Bell, BookOpen, Check, Edit3, Heart, LogOut, Plus, Trophy, User, User2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type TabType = 'user-info' | 'created-outfits' | 'saved-outfits';

interface Notification {
  id: string;
  type: 'like' | 'follow_request';
  message: string;
  createdAt: string;
  userId: string;
}

interface UserProfileProps {
  isOwnProfile?: boolean;
}

export default function UserProfile({
  isOwnProfile = true
}: UserProfileProps) {
  const {
    userName,
    userBio,
    userImage,
    userEmail,
    userSocials,
    userId,
  } = useUserContext();

  const [activeTab, setActiveTab] = useState<TabType>('user-info');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { data: notificationsData, isLoading, error } = useFetchNotifications(userId || "");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const offset = useSharedValue(Dimensions.get('window').width);
  const { mutate: acceptFollowRequest } = useAcceptFollowerMutation();
  const { mutate: unFollowUser } = useUnFollowUserMutation();

  useEffect(() => {
    if (notificationsData) {
      const transformedNotifications: Notification[] = notificationsData.map((follower) => ({
        id: follower.user_id!,
        type: 'follow_request',
        message: `${follower.users?.nickname || follower.users?.full_name} requested to follow you`,
        createdAt: follower.created_at,
        userId: follower.user_id!,
      }));
      setNotifications(transformedNotifications);
    }
  }, [notificationsData]);

  useEffect(() => {
    offset.value = withSpring(showDrawer ? Dimensions.get('window').width * 0 : Dimensions.get('window').width, {
      damping: 100,
      stiffness: 200,
    });
  }, [showDrawer]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-info':
        return (
          <View className="mt-6 space-y-6 px-6">
            {/* Bio Section */}
            <View className="pb-6 border-b border-gray-800/50">
              <Text className="text-white text-lg font-semibold mb-3">About</Text>
              <Text className="text-gray-300 text-base leading-6">
                {userBio || "No bio available yet. Add one by editing your profile!"}
              </Text>
            </View>

            {/* Statistics */}
            <View className="pb-6 border-b border-gray-800/50">
              {userId && <UserStatistics userId={userId} />}
            </View>

            {/* Recent Activity */}
            <View className="pb-6">
              <Text className="text-white text-lg font-semibold mb-4">Recent Activity</Text>
              <View className="space-y-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3">
                    <Trophy size={14} color="#22C55E" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Your outfit got 50+ likes!</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-pink-500/20 rounded-full items-center justify-center mr-3">
                    <Heart size={14} color="#EC4899" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Liked 5 new outfits</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                    <Plus size={14} color="#A855F7" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">Created "Summer Casual Look"</Text>
                </View>
              </View>
            </View>

            {/* Logout Button */}
            {isOwnProfile && (
              <Pressable
                onPress={handleLogout}
                className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 flex-row items-center justify-center mt-4"
              >
                <LogOut size={18} color="#EF4444" />
                <Text className="text-red-400 font-medium ml-2">Logout</Text>
              </Pressable>
            )}
          </View>
        );
      case 'created-outfits':
        return <CreatedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      case 'saved-outfits':
        return <SavedOutfitsSection refreshing={refreshing} profileId={userId || ''} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-black"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="pt-8 pb-20">
        {/* Profile Header */}
        <View className="items-center mb-8 px-6">
          <View className="relative mb-4">
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                className="w-28 h-28 rounded-full border-2 border-gray-600"
              />
            ) : (
              <View className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center border-2 border-gray-600">
                <User size={32} color="#FFFFFF" />
              </View>
            )}
            {/* Online indicator */}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black" />
          </View>

          <Text className="text-white text-2xl font-bold mb-1">{userName || "Anonymous User"}</Text>
          <Text className="text-gray-400 text-sm mb-4">Fashion Enthusiast</Text>

          {isOwnProfile && (
            <Pressable
              onPress={handleEditProfile}
              style={{ backgroundColor: '#1f1f1fcc' }}
              className="px-6 py-3 rounded-full flex-row items-center border border-gray-600/60"
            >
              <Edit3 size={16} color="#FFFFFF" />
              <Text className="text-white font-medium ml-2">Edit Profile</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setShowDrawer(true)}
            className="absolute top-4 right-4 flex-row items-center"
          >
            <Bell size={20} color="#9CA3AF" />
            {notificationsData && notificationsData.length > 0 && (
              <View className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-semibold">{notificationsData.length}</Text>
              </View>)}
          </Pressable>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-center mb-8 px-6">
          <View style={{ backgroundColor: '#1f1f1fcc' }} className="flex-row rounded-full p-1">
            {[
              { key: 'user-info', label: 'Profile', icon: User2 },
              { key: 'created-outfits', label: 'Created', icon: BookOpen },
              { key: 'saved-outfits', label: 'Saved', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabType)}
                className={`flex-row items-center px-4 py-2 rounded-full ${activeTab === key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-transparent'
                  }`}
              >
                <Icon
                  size={16}
                  color={activeTab === key ? "#FFFFFF" : "#9CA3AF"}
                />
                <Text
                  className={`text-sm ml-2 font-medium ${activeTab === key ? 'text-white' : 'text-gray-400'
                    }`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Notification Modal */}
        <Modal
          visible={showDrawer}
          onRequestClose={() => setShowDrawer(false)}
          animationType="none"
          transparent={true}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
            onPress={() => setShowDrawer(false)}
          >
            <Animated.View
              style={[{
                width: '75%',
                height: '100%',
                backgroundColor: '#111827',
                borderLeftWidth: 1,
                borderLeftColor: '#1F2937',
              }, useAnimatedStyle(() => ({
                transform: [{ translateX: offset.value }],
              }))]}
              onStartShouldSetResponder={() => true}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '500' }}>
                  Notifications
                </Text>
                <Pressable onPress={() => setShowDrawer(false)}>
                  <Text style={{ color: '#9CA3AF' }}>Close</Text>
                </Pressable>
              </View>
              <ScrollView style={{ padding: 16 }}>
                {isLoading ? (
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Loading notifications...</Text>
                ) : error ? (
                  <Text style={{ color: '#EF4444', fontSize: 14 }}>
                    Error loading notifications: {error.message}
                  </Text>
                ) : notifications.length === 0 ? (
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No notifications yet.</Text>
                ) : (
                  notifications.map((notification) => (
                    <View
                      key={notification.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: '#D1D5DB', fontSize: 14, flex: 1 }}>
                        <Pressable onPress={() => { }}>
                          <Text style={{ color: '#3B82F6', textDecorationLine: 'underline' }}>
                            {notification.message.split(' requested')[0]}
                          </Text>
                        </Pressable>
                        <Text style={{ color: '#D1D5DB' }}>
                          {' requested to follow you'}
                        </Text>
                      </Text>
                      <View className='flex flex-row gap-2'>
                        {notification.type === 'follow_request' && (
                          <View className='flex flex-row gap-2'>
                            <Button
                              size="sm"
                              variant="link"
                              onPress={() => {
                                if (userId && notification.userId) {
                                  acceptFollowRequest({ followerId: notification.userId, followedAccountId: userId });
                                } else {
                                  console.error('Invalid IDs:', { userId, followerId: notification.userId });
                                }
                              }}
                              className='border border-gray-50/10 rounded-full p-2'
                            >
                              <Check size={20} color="#4ADE80" />
                            </Button>
                            <Button
                              size="sm"
                              variant="link"
                              onPress={() => {
                                if (userId && notification.userId) {
                                  unFollowUser({ followedAccountId: userId, userId: notification.userId });
                                } else {
                                  console.error('Invalid IDs:', { userId, followerId: notification.userId });
                                }
                              }}
                              className='border border-gray-50/10 rounded-full p-2'
                            >
                              <X size={20} color="#EF4444" />
                            </Button>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#1F2937',
                }}
              >
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => setNotifications([])}
                  disabled={notifications.length === 0}
                >
                  <ButtonText className="text-gray-400">Clear All</ButtonText>
                </Button>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <ProfileEdit
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentUserData={{
            name: userName,
            bio: userBio,
            avatar: userImage,
            email: userEmail,
            socials: userSocials,
          }}
        />
      )}
    </ScrollView>
  );
};
