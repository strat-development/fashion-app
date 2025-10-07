import RegistrationModal from '@/components/modals/RegistrationModal';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname } from 'expo-router';
import { Bot, Compass, Trophy, User2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, View, Animated } from 'react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { userId, loading: userContextLoading } = useUserContext();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const pathname = usePathname();
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  
  const tabs = ['index', 'chat', 'ranking', 'userProfile'];
  
  const tabGradients: Record<string, [string, string]> = {
    index: ['#5F94FF', '#6F31FF'],
    chat: ['#A45FFF', '#7C31FF'],
    ranking: ['#FF6A5F', '#FF9131'],
    userProfile: ['#A75FFF', '#D631FF'],
  };

  const getTabIcon = (Icon: React.ElementType, focused: boolean, key: keyof typeof tabGradients) => {
    const gradient = tabGradients[key];
    const baseShadow = {
      shadowColor: gradient?.[1] || colors.accent,
      shadowOpacity: focused ? 0.25 : 0,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: focused ? 6 : 0,
    };

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 999, padding: 8 }}>
        <Icon size={24} color={focused ? colors.white : colors.textSecondary} />
      </View>
    );
  };

  useEffect(() => {
    const currentPath = pathname.replace('/(tabs)/', '').replace('/', '') || 'index';
    const tabIndex = tabs.indexOf(currentPath);
    
    if (tabIndex !== -1) {
      Animated.spring(indicatorPosition, {
        toValue: tabIndex,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [pathname]);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (userContextLoading) {
        return;
      }

      if (!userId) {
        setShowRegistrationModal(false);
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
          setShowRegistrationModal(false);
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
            left: 60,
            right: 60,
            bottom: 20,
            height: 58,
            borderRadius: 999,
            borderWidth: 0,
            borderColor: "transparent",
            backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.8)',
            overflow: 'hidden',
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 2,
            shadowOffset: { width: 2, height: 2 },
          },
          tabBarBackground: () => {
            const currentPath = pathname.replace('/(tabs)/', '').replace('/', '') || 'index';
            const tabIndex = tabs.indexOf(currentPath);
            const gradient = tabIndex !== -1 ? tabGradients[tabs[tabIndex] as keyof typeof tabGradients] : tabGradients.index;
            
            const translateX = indicatorPosition.interpolate({
              inputRange: [0, 1, 2, 3],
              outputRange: ['0%', '100%', '200%', '300%'],
            });

            return (
              <>
                <BlurView
                  intensity={40}
                  tint={isDark ? 'dark' : 'light'}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: '25%',
                    height: '100%',
                    transform: [{ translateX }],
                  }}
                >
                  <LinearGradient
                    colors={gradient || tabGradients.index}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      borderRadius: 999,
                      opacity: 0.9,
                    }}
                  />
                </Animated.View>
              </>
            );
          },
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
            tabBarIcon: ({ focused }) => getTabIcon(Compass, focused, 'index'),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(Bot, focused, 'chat'),
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(Trophy, focused, 'ranking'),
          }}
        />
        <Tabs.Screen
          name="userProfile"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(User2, focused, 'userProfile'),
          }}
        />
      </Tabs>
    </>
  );
}