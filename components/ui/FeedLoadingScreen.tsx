import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Platform, Text, View } from 'react-native';

interface FeedLoadingScreenProps {
  message?: string;
}

export const FeedLoadingScreen = ({ message = "Loading your feed..." }: FeedLoadingScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-black">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Main loading area with glow effect */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
          className="relative items-center justify-center mb-8"
        >
          {/* Background glow */}
          <View className="absolute w-24 h-24 bg-purple-500/30 rounded-full blur-xl" />
          <View className="absolute w-16 h-16 bg-pink-500/40 rounded-full blur-lg" />
          
          {/* Main spinner container */}
          <View className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full items-center justify-center border border-purple-500/30 backdrop-blur-sm">
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
        </Animated.View>

        {/* Loading text with subtle animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
          className="items-center mb-6"
        >
          <Text className="text-white text-xl font-semibold text-center mb-2">
            {message}
          </Text>
          <Text className="text-gray-400 text-sm text-center leading-relaxed max-w-xs">
            Curating the perfect outfits for you
          </Text>
        </Animated.View>

        {/* Animated dots indicator */}
        <View className="flex-row items-center space-x-1">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
            >
              <View 
                className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                style={Platform.select({
                  web: {
                    boxShadow: '0 0 4px rgba(168, 85, 247, 0.6)',
                  },
                  default: {
                    shadowColor: '#A855F7',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 4, 
                  },
                })}
              />
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Background ambient lighting */}
      <View className="absolute inset-0 opacity-20">
        <View className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
        <View className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-pink-500 rounded-full blur-3xl" />
        <View className="absolute top-1/2 right-1/3 w-20 h-20 bg-purple-500 rounded-full blur-2xl" />
      </View>

      {/* Subtle overlay for depth */}
      <View className="absolute inset-0 bg-black/10" />
    </View>
  );
};
