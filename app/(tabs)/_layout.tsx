import RegistrationModal from '@/components/modals/RegistrationModal';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname } from 'expo-router';
import { Bot, Compass, Trophy, User2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { userId, loading: userContextLoading } = useUserContext();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [focusedTab, setFocusedTab] = useState(0);
  const pathname = usePathname();
  
  // Reanimated shared value for smooth animation
  const translateX = useSharedValue(0);
  
  const tabs = ['index', 'chat', 'ranking', 'userProfile'];
  
  const tabGradients: Record<string, [string, string]> = {
    index: ['#5F94FF', '#6F31FF'],
    chat: ['#A45FFF', '#7C31FF'],
    ranking: ['#FF6A5F', '#FF9131'],
    userProfile: ['#A75FFF', '#D631FF'],
  };

  const getTabIcon = (Icon: React.ElementType, focused: boolean, key: keyof typeof tabGradients, tabIdx: number) => {
    return (
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center', 
        justifyContent: 'center',
      }}>
        <Icon size={26} color={focused ? colors.white : colors.textSecondary} />
      </View>
    );
  };

  // Update focusedTab based on pathname
  useEffect(() => {
    const currentPath = pathname.replace('/(tabs)/', '').replace('/', '') || 'index';
    const tabIndex = tabs.indexOf(currentPath);
    if (tabIndex !== -1) {
      setFocusedTab(tabIndex);
      // Animate the gradient with spring animation
      translateX.value = withSpring(tabIndex, {
        damping: 70,
        stiffness: 1000,
      });
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
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 40,
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
            alignSelf: 'center',
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
            paddingHorizontal: 0,
            margin: 0,
          },
          tabBarBackground: () => {
            const currentPath = pathname.replace('/(tabs)/', '').replace('/', '') || 'index';
            const tabIndex = tabs.indexOf(currentPath);
            const gradient = tabIndex !== -1 ? tabGradients[tabs[tabIndex] as keyof typeof tabGradients] : tabGradients.index;

            // Animated style for smooth gradient movement
            const animatedStyle = useAnimatedStyle(() => {
              return {
                left: `${translateX.value * 25}%`,
              };
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
                  style={[
                    {
                      position: 'absolute',
                      width: '25%',
                      height: '100%',
                    },
                    animatedStyle,
                  ]}
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
          tabBarButton: ({ children, onPress, accessibilityLabel }) => {
            return (
              <Pressable
                onPress={event => {
                  if (onPress) onPress(event);
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  padding: 0,
                  margin: 0,
                  position: 'relative',
                }}
                accessibilityLabel={accessibilityLabel}
              >
                {children}
              </Pressable>
            );
          },
        }}
      >

        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(Compass, focused, 'index', 0),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(Bot, focused, 'chat', 1),
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(Trophy, focused, 'ranking', 2),
          }}
        />
        <Tabs.Screen
          name="userProfile"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => getTabIcon(User2, focused, 'userProfile', 3),
          }}
        />
      </Tabs>
    </>
  );
}