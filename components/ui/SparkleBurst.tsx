import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface SparkleBurstProps {
  show: boolean;
  color: string;
  size: number;
}

interface SparkleDotProps {
  progress: Animated.SharedValue<number>;
  angle: number;
  color: string;
  size: number;
}

const SparkleDot = ({ progress, angle, color, size }: SparkleDotProps) => {
  const dx = Math.cos(angle) * size || 0;
  const dy = Math.sin(angle) * size || 0;

  const style = useAnimatedStyle(() => {
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, dx]) },
        { translateY: interpolate(progress.value, [0, 1], [0, dy]) },
        { scale: interpolate(progress.value, [0, 1], [0.5, 1.2]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: "absolute" }, style]}
    />
  );
};

export const SparkleBurst = ({ show, color, size }: SparkleBurstProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (show) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 450 });
    }
  }, [show, progress]);

  if (!show) return null;

  const dots = new Array(6).fill(0);

  return (
    <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        return <SparkleDot key={i} progress={progress} angle={angle} color={color} size={size} />;
      })}
    </View>
  );
};