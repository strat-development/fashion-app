import RegistrationModal from '@/components/modals/RegistrationModal';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Bot, Compass, Trophy, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

export default function TabLayout() {
  const { userId, loading: userContextLoading } = useUserContext();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (userContextLoading) {
        return;
      }

      if (!userId) {
        setShowRegistrationModal(true);
        setIsCheckingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_id, nickname, full_name, bio, user_avatar')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user profile:', error);
          Alert.alert('Error', 'Failed to verify user profile. Please try again.');
          setIsCheckingProfile(false);
          return;
        }

        if (data) {
          setShowRegistrationModal(false);
        } else {
          setShowRegistrationModal(true);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        Alert.alert('Error', 'Failed to verify user profile. Please try again.');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkUserProfile();
  }, [userId, userContextLoading]);


  if (userContextLoading || isCheckingProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-gray-300 text-sm mt-4">Loading...</Text>
      </View>
    );
  }


  return (
    <>
      <RegistrationModal
        isVisible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        userId={userId}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 24,
            marginBottom: 16,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(107, 114, 128, 0.3)',
            backgroundColor: '#1f1f1fcc',
            padding: 4,
            height: 60,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#1f1f1fcc', '#1f1f1fcc']}
              style={{
                flex: 1,
                borderRadius: 999,
              }}
            />
          ),
          tabBarButton: ({ children, onPress, accessibilityLabel }) => (
            <Pressable
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
              }}
              accessibilityLabel={accessibilityLabel}
            >
              {children}
            </Pressable>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Compass
                  size={24}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Bot
                  size={24}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Trophy
                  size={24}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="userProfile"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <User2
                  size={24}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}