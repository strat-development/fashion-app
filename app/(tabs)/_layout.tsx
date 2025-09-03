import RegistrationModal from '@/components/modals/RegistrationModal';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Bot, Compass, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

export default function TabLayout() {
  const { userId } = useUserContext();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
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
  }, [userId]);


  if (isCheckingProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
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
            borderColor: 'rgba(75, 85, 99, 0.5)',
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 4,
            height: 60,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['rgba(17, 24, 39, 0.9)', 'rgba(17, 24, 39, 0.9)']}
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
                  size={18}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: '500',
                    color: focused ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  Feed
                </Text>
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
                  size={18}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: '500',
                    color: focused ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  Create
                </Text>
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
                  size={18}
                  color={focused ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: '500',
                    color: focused ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  Profile
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}