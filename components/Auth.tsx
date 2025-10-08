import SilkBackground from '@/components/ui/SilkBackground'
import { supabase } from '@/lib/supabase'
import { ThemedGradient, useTheme } from '@/providers/themeContext'
import { AntDesign } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Lock, Mail } from 'lucide-react-native'
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
  const { colors, isDark } = useTheme()
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
    inputRange: [0, 3],
    outputRange: [0, 0.55]
  });

  const translateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0]
  });

  const backgroundColor = focused
    ? (isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF')
    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')

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
        backgroundColor,
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
            placeholderTextColor={isDark ? colors.textSecondary : '#6B7280'}
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

export default function Auth() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showMenu, setShowMenu] = useState(true)

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

  async function signInWithGoogle() {
    setLoading(true)
    if (!supabase) {
      Alert.alert(t('auth.alerts.supabaseNotInitialized.title'), t('auth.alerts.supabaseNotInitialized.message'))
      setLoading(false)
      return
    }
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Linking.createURL('/')
        }
      })
    } catch (error: any) {
      Alert.alert(t('auth.alerts.signInError.title'), error?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, overflow: 'hidden' }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <SilkBackground />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 100, paddingBottom: 28, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', marginBottom: 60 }}>
                  <Text style={{ color: colors.text + 'dd', fontSize: 84, fontWeight: '900', letterSpacing: 1, textAlign: 'center', fontFamily: 'InstrumentSans' }}>Versa</Text>
                  <Text style={{ color: colors.textSecondary + 'aa', fontSize: 16, fontWeight: '600', letterSpacing: 2, textAlign: 'center' }}>DISCOVER YOUR STYLE</Text>
                </View>

                {!showMenu && (
                  <View className='backdrop-blur-xl'
                    style={{
                      position: 'relative',
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 18,
                      padding: 18,
                      overflow: 'hidden',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                    }}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

                    <>
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
                        <ThemedGradient
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

                      <Pressable onPress={() => setShowMenu(true)} style={{ marginTop: 12, alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Back</Text>
                      </Pressable>
                    </>
                  </View>
                )}
              </View>

              <View style={{ padding: 24 }}>
                {showMenu && (
                  <>
                    <View style={{ position: 'relative', overflow: 'hidden' }}>
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                      <Pressable
                        disabled={loading}
                        onPress={() => { setMode('signin'); setShowMenu(false) }}
                        style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.6 : 1, overflow: 'hidden' }}
                      >
                        <ThemedGradient
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }}
                        />
                        {loading ? <ActivityIndicator color="#fff" /> : (
                          <Text style={{ color: '#fff', fontWeight: '600', letterSpacing: 0.3 }}>
                            {t('auth.buttons.signIn')}
                          </Text>
                        )}
                      </Pressable>

                      <View style={{ height: 12 }} />

                      <Pressable
                        disabled={loading}
                        onPress={() => { setMode('signup'); setShowMenu(false) }}
                        style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.6 : 1, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
                      >
                        <Text style={{ color: colors.text, fontWeight: '600', letterSpacing: 0.3 }}>
                          {t('auth.buttons.signUp')}
                        </Text>
                      </Pressable>

                      <View style={{ height: 12 }} />

                      <Pressable
                        disabled={loading}
                        onPress={signInWithGoogle}
                        style={{ borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.6 : 1, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
                      >
                        <AntDesign name="google" size={16} color="#4285F4" />
                        <View style={{ width: 8 }} />
                        <Text style={{ color: '#1F2937', fontWeight: '600', letterSpacing: 0.3 }}>
                          {t('auth.buttons.google')}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{t('auth.termsAndPrivacy')}</Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View >
    </View >
  )
}