import { useTheme } from '@/providers/themeContext'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default function SilkBackground() {
  const { isDark } = useTheme()

  const t1x = useRef(new Animated.Value(0)).current
  const t1y = useRef(new Animated.Value(0)).current
  const t1r = useRef(new Animated.Value(0)).current
  const t2x = useRef(new Animated.Value(0)).current
  const t2y = useRef(new Animated.Value(0)).current
  const t2r = useRef(new Animated.Value(0)).current
  const t3x = useRef(new Animated.Value(0)).current
  const t3y = useRef(new Animated.Value(0)).current
  const t3r = useRef(new Animated.Value(0)).current
  const t4x = useRef(new Animated.Value(0)).current
  const t4y = useRef(new Animated.Value(0)).current
  const t4r = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = (val: Animated.Value, duration: number, delay = 0, easing = Easing.inOut(Easing.cubic)) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, easing, useNativeDriver: false, delay }),
          Animated.timing(val, { toValue: 0, duration, easing, useNativeDriver: false }),
        ])
      ).start()

    loop(t1x, 2800, 0, Easing.inOut(Easing.quad))
    loop(t1y, 3600, 800, Easing.inOut(Easing.cubic))
    loop(t1r, 2400, 400, Easing.inOut(Easing.sin))

    loop(t2x, 3400, 1200, Easing.inOut(Easing.cubic))
    loop(t2y, 2600, 400, Easing.inOut(Easing.quad))
    loop(t2r, 3000, 600, Easing.inOut(Easing.sin))

    loop(t3x, 3800, 600, Easing.inOut(Easing.cubic))
    loop(t3y, 3000, 1400, Easing.inOut(Easing.quad))
    loop(t3r, 3200, 1000, Easing.inOut(Easing.sin))

    loop(t4x, 3200, 1000, Easing.inOut(Easing.cubic))
    loop(t4y, 4000, 200, Easing.inOut(Easing.quad))
    loop(t4r, 28000, 1200, Easing.inOut(Easing.sin))

    return () => {
      ;[t1x, t1y, t1r, t2x, t2y, t2r, t3x, t3y, t3r, t4x, t4y, t4r].forEach(v => v.stopAnimation())
    }
  }, [t1x, t1y, t1r, t2x, t2y, t2r, t3x, t3y, t3r, t4x, t4y, t4r])

  const bgStart = isDark ? '#0A0C16' : '#F7F8FB'
  const bgEnd = isDark ? '#04070E' : '#EEF2F7'

  const silkA = isDark ? '#9EB2FDcc' : '#60A5FA'
  const silkB = isDark ? '#6DA1CEcc' : '#818CF8'
  const silkC = isDark ? '#14B8A6cc' : '#22C55E'
  const silkD = isDark ? '#F472B6cc' : '#F472B6'

  const circleProps = (
    vx: Animated.Value,
    vy: Animated.Value,
    vr: Animated.Value,
    cx0: number,
    cx1: number,
    cy0: number,
    cy1: number,
    r0: number,
    r1: number,
    wiggle: number
  ) => ({
    cx: Animated.add(
      vx.interpolate({ inputRange: [0, 1], outputRange: [cx0, cx1] }),
      vy.interpolate({ inputRange: [0, 1], outputRange: [-wiggle, wiggle] })
    ),
    cy: Animated.add(
      vy.interpolate({ inputRange: [0, 1], outputRange: [cy0, cy1] }),
      vx.interpolate({ inputRange: [0, 1], outputRange: [wiggle, -wiggle] })
    ),
    r: Animated.add(
      vr.interpolate({ inputRange: [0, 1], outputRange: [r0, r1] }),
      vx.interpolate({ inputRange: [0, 1], outputRange: [-1, 1] })
    ),
  })

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <LinearGradient
        colors={[bgStart, bgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="silkA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={silkA} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={silkA} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="silkB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={silkB} stopOpacity="0.20" />
            <Stop offset="100%" stopColor={silkB} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="silkC" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={silkC} stopOpacity="0.16" />
            <Stop offset="100%" stopColor={silkC} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="silkD" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={silkD} stopOpacity="0.14" />
            <Stop offset="100%" stopColor={silkD} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width="100" height="100" fill="transparent" />

        <AnimatedCircle fill="url(#silkA)" {...circleProps(t1x, t1y, t1r, 25, 37, 20, 32, 26, 34, 3)} />
        <AnimatedCircle fill="url(#silkB)" {...circleProps(t2x, t2y, t2r, 80, 68, 10, 24, 28, 36, 3)} />
        <AnimatedCircle fill="url(#silkC)" {...circleProps(t3x, t3y, t3r, 20, 14, 75, 63, 24, 32, 2)} />
        <AnimatedCircle fill="url(#silkD)" {...circleProps(t4x, t4y, t4r, 65, 57, 70, 82, 20, 28, 2)} />
      </Svg>

      <BlurView intensity={isDark ? 32 : 40} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <LinearGradient
        colors={['transparent', isDark ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.08)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </View>
  )
}


