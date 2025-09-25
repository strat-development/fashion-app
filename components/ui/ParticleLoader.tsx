import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export const ParticleLoader = () => {
  const particles = useRef<Particle[]>([]);
  const lightBeam = useRef(new Animated.Value(0)).current;
  const isInitialized = useRef(false);
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialize subtle particles for a minimal look
    particles.current = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0.12 + Math.random() * 0.18),
      scale: new Animated.Value(0.9 + Math.random() * 0.2),
    }));

    // Text fade in animation
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Smooth particle animation
    particles.current.forEach((particle, index) => {
      setTimeout(() => {
        // Continuous smooth movement with easing
        const moveParticle = () => {
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: 5000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * height,
              duration: 5000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Only continue if component is still mounted
            if (isInitialized.current) {
              moveParticle();
            }
          });
        };

        // Subtle opacity breathing
        const pulseSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.25,
              duration: 2200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.12,
              duration: 2200,
              useNativeDriver: true,
            }),
          ])
        );

        // Scale animation for breathing effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.8,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        pulseSequence.start();
        moveParticle();
      }, index * 150); // Staggered start
    });

    // Subtle sweep animation (no glow)
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightBeam, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(lightBeam, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      isInitialized.current = false;
      particles.current.forEach(particle => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.opacity.stopAnimation();
        particle.scale.stopAnimation();
      });
      lightBeam.stopAnimation();
      textOpacity.stopAnimation();
    };
  }, []);

  const lightBeamTranslateX = lightBeam.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-width * 1.2, 0, width * 1.2],
    extrapolate: 'clamp',
  });

  const lightBeamTranslateY = lightBeam.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-height * 1.2, 0, height * 1.2],
    extrapolate: 'clamp',
  });

  return (
    <View className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60 backdrop-blur-md items-center justify-center">
      {/* Minimal diagonal sweep, no glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 2,
          height: Math.sqrt(width * width + height * height),
          backgroundColor: 'rgba(148,163,184,0.25)', // slate-400/25
          transform: [
            { translateX: lightBeamTranslateX },
            { translateY: lightBeamTranslateY },
            { rotate: '45deg' },
          ],
        }}
      />
      
      {/* Subtle particles */}
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            backgroundColor: 'rgba(148,163,184,0.6)',
            borderRadius: 2,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
          }}
        />
      ))}
      
      {/* Minimal center text, no emoji, no glow */}
      <View className="bg-gray-900/70 rounded-xl px-4 py-3 border border-gray-800">
        <Animated.Text 
          className="text-gray-300 text-sm font-medium text-center"
          style={{
            opacity: textOpacity,
          }}
        >
          Searching for images…
        </Animated.Text>
      </View>
    </View>
  );
};
