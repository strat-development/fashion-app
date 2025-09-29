import RegistrationModal from '@/components/modals/RegistrationModal';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Bot, Compass, Trophy, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();
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
    return <FullScreenLoader />;
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
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: 4,
            height: 60
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={[colors.surface, colors.surface]}
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
                  color={focused ? colors.text : colors.textSecondary}
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
                  color={focused ? colors.text : colors.textSecondary}
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
                  color={focused ? colors.text : colors.textSecondary}
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
                  color={focused ? colors.text : colors.textSecondary}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}