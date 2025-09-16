import { supabase } from '@/lib/supabase'
import { useTheme } from '@/providers/themeContext'
import { LinearGradient } from 'expo-linear-gradient'
import { Lock, Mail, User } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from "react-i18next"
import { ActivityIndicator, Alert, Animated, AppState, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface FocusInputProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  secure?: boolean;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'email-address';
}

const FocusInput = ({ icon, label, value, placeholder, secure, onChange, keyboardType = 'default' }: FocusInputProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme()
  const focusAnim = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [focused, focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent]
  });

  const glowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55]
  });

  const translateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0]
  });

  return (
    <View style={{ width: '100%' }}>
      <Animated.Text style={{
        color: colors.textSecondary,
        fontSize: 11,
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        transform: [{ translateY }],
        opacity: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] })
      }}>{t(label)}</Animated.Text>
      <Animated.View style={{
        borderWidth: 1,
        borderColor,
        borderRadius: 14,
        backgroundColor: colors.surface,
        overflow: 'hidden'
      }}>
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.accent,
          opacity: glowOpacity,
        }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
          <View style={{ opacity: 0.85 }}>{icon}</View>
          <TextInput
            value={value}
            placeholder={t(placeholder)}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={secure}
            autoCapitalize='none'
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChangeText={onChange}
            style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 15, paddingVertical: 0 }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase?.auth?.startAutoRefresh && supabase.auth.startAutoRefresh()
  } else {
    supabase?.auth?.stopAutoRefresh && supabase.auth.stopAutoRefresh()
  }
})

const AnimatedGradientOverlay = () => {
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [fade])
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient
        colors={[ 'rgba(126,34,206,0.08)', 'rgba(219,39,119,0.06)' ]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: fade }}>
        <LinearGradient
          colors={[ 'rgba(219,39,119,0.08)', 'rgba(126,34,206,0.06)' ]}
          start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </Animated.View>
      <LinearGradient colors={[ 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.1)' ]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </View>
  )
}

export default function Auth() {
  const { t } = useTranslation();
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  async function signInWithEmail() {
    setLoading(true)
    if (!supabase) {
      Alert.alert(t('auth.alerts.supabaseNotInitialized.title'), t('auth.alerts.supabaseNotInitialized.message'));
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(t('auth.alerts.signInError.title'), error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    if (!supabase) {
      Alert.alert(t('auth.alerts.supabaseNotInitialized.title'), t('auth.alerts.supabaseNotInitialized.message'));
      setLoading(false)
      return
    }
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(t('auth.alerts.signUpError.title'), error.message)
    if (!session) Alert.alert(t('auth.alerts.emailVerification.title'), t('auth.alerts.emailVerification.message'))
    setLoading(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <AnimatedGradientOverlay />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 28, justifyContent: 'space-between' }}>
                <View>
                  <View style={{ alignItems: 'center', marginBottom: 28 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <LinearGradient colors={["#7e22ce", "#db2777"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                      <User size={32} color="#fff" />
                    </View>
                    <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>{t('auth.welcome')}</Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>{t(mode === 'signin' ? 'auth.signInSubtitle' : 'auth.signUpSubtitle')}</Text>
                  </View>

                  <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18 }}>
                    <FocusInput
                      icon={<Mail size={18} color={colors.textSecondary} />}
                      label="auth.labels.email"
                      value={email}
                      onChange={setEmail}
                      placeholder="auth.placeholders.email"
                      keyboardType="email-address"
                    />
                    <View style={{ height: 16 }} />
                    <FocusInput
                      icon={<Lock size={18} color={colors.textSecondary} />}
                      label="auth.labels.password"
                      value={password}
                      onChange={setPassword}
                      placeholder="auth.placeholders.password"
                      secure
                    />

                    <Pressable
                      disabled={loading}
                      onPress={mode === 'signin' ? signInWithEmail : signUpWithEmail}
                      style={{ marginTop: 18, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.6 : 1, overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={["#7e22ce", "#db2777"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }}
                      />
                      {loading ? <ActivityIndicator color="#fff" /> : (
                        <Text style={{ color: '#fff', fontWeight: '600', letterSpacing: 0.3 }}>
                          {t(mode === 'signin' ? 'auth.buttons.signIn' : 'auth.buttons.signUp')}
                        </Text>
                      )}
                    </Pressable>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t(mode === 'signin' ? 'auth.switch.signUpPrompt' : 'auth.switch.signInPrompt')}</Text>
                      <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>
                          {t(mode === 'signin' ? 'auth.switch.signUp' : 'auth.switch.signIn')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={{ alignItems: 'center', marginTop: 24 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{t('auth.termsAndPrivacy')}</Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  )
}