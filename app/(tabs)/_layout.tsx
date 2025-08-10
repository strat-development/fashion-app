import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Bot, Compass, User2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
          backgroundColor: 'transparent',
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
  );
}