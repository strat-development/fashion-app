import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface SparkleBurstProps {
  show: boolean;
  color?: string;
  size?: number;
}

// Lightweight sparkle burst using Moti circles
export const SparkleBurst: React.FC<SparkleBurstProps> = ({ show, color = "#f472b6", size = 24 }) => {
  if (!show) return null;
  const dots = new Array(6).fill(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 450 });
  }, [progress]);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const dx = Math.cos(angle) * size;
        const dy = Math.sin(angle) * size;
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
            key={i}
            style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: "absolute" }, style]}
          />
        );
      })}
    </View>
  );
};

export default SparkleBurst;
