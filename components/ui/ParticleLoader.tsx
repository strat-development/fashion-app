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

    // Initialize particles with more particles for better effect
    particles.current = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0.1 + Math.random() * 0.3),
      scale: new Animated.Value(0.3 + Math.random() * 0.4),
    }));

    // Animate text fade in
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Smooth particle animation with easing
    particles.current.forEach((particle, index) => {
      setTimeout(() => {
        // Continuous smooth movement with easing
        const moveParticle = () => {
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: 4000 + Math.random() * 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * height,
              duration: 4000 + Math.random() * 3000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Only continue if component is still mounted
            if (isInitialized.current) {
              moveParticle();
            }
          });
        };

        // Smooth pulsing effect with different patterns
        const pulsePattern = index % 3;
        let pulseSequence;
        
        if (pulsePattern === 0) {
          // Slow, gentle pulse
          pulseSequence = Animated.loop(
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 0.8,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 0.2,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          );
        } else if (pulsePattern === 1) {
          // Medium pulse
          pulseSequence = Animated.loop(
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 0.6,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 0.1,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          );
        } else {
          // Fast pulse
          pulseSequence = Animated.loop(
            Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: 0.9,
                  duration: 1000,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                  toValue: 0.3,
                  duration: 1000,
                  useNativeDriver: true,
                }),
            ])
          );
        }

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

    // Ultra smooth light beam animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightBeam, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(lightBeam, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
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
    <View className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-purple-900/20 to-gray-900/60 backdrop-blur-md items-center justify-center">
      {/* Light beam with enhanced glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 3,
          height: Math.sqrt(width * width + height * height),
          backgroundColor: '#A855F7',
          transform: [
            { translateX: lightBeamTranslateX },
            { translateY: lightBeamTranslateY },
            { rotate: '45deg' },
          ],
          shadowColor: '#A855F7',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 20,
        }}
      />
      
      {/* Secondary light beam for depth */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 1,
          height: Math.sqrt(width * width + height * height),
          backgroundColor: '#C084FC',
          transform: [
            { translateX: lightBeamTranslateX },
            { translateY: lightBeamTranslateY },
            { rotate: '45deg' },
          ],
          shadowColor: '#C084FC',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 15,
          elevation: 15,
        }}
      />
      
      {/* Particles with enhanced effects */}
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            backgroundColor: '#A855F7',
            borderRadius: 3,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
            shadowColor: '#A855F7',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 8,
          }}
        />
      ))}
      
      {/* Simple center text without glow */}
      <View className="bg-gray-900/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-gray-700">
        <Animated.Text 
          className="text-gray-200 text-base font-medium text-center"
          style={{
            opacity: textOpacity,
          }}
        >
          ✨ Generating fashion images...
        </Animated.Text>
        <Animated.View 
          className="mt-2 flex-row justify-center space-x-1"
          style={{ opacity: textOpacity }}
        >
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </Animated.View>
      </View>
    </View>
  );
};
