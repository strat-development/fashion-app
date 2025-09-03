
import { supabase } from '@/lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { Lock, Mail, User } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
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
    outputRange: ['#374151', '#d946ef']
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
        color: '#9CA3AF',
        fontSize: 11,
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        transform: [{ translateY }],
        opacity: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] })
      }}>{label}</Animated.Text>
      <Animated.View style={{
        borderWidth: 1,
        borderColor,
        borderRadius: 14,
        backgroundColor: 'rgba(31,41,55,0.55)',
        overflow: 'hidden'
      }}>
        {/* Glow layer */}
        <Animated.View style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#db2777',
          opacity: glowOpacity,
          filter: Platform.OS === 'web' ? 'blur(14px)' as any : undefined
        }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
          <View style={{ opacity: 0.85 }}>{icon}</View>
          <TextInput
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            secureTextEntry={secure}
            autoCapitalize='none'
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChangeText={onChange}
            style={{ flex: 1, marginLeft: 10, color: 'white', fontSize: 15, paddingVertical: 0 }}
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  async function signInWithEmail() {
    setLoading(true)
    if (!supabase) {
      Alert.alert('Supabase client is not initialized.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    if (!supabase) {
      Alert.alert('Supabase client is not initialized.')
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

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <LinearGradient colors={["#050505", "#111827", "#1f2937"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-6 pt-10 pb-12 justify-between">
              <View>
                <View className="items-center mb-10">
                  <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 items-center justify-center mb-4">
                    <User size={32} color="#fff" />
                  </View>
                  <Text className="text-white text-3xl font-extrabold tracking-tight">Welcome</Text>
                  <Text className="text-gray-400 mt-2 text-sm">{mode === 'signin' ? 'Sign in to continue' : 'Create an account'}</Text>
                </View>

                {/* FORM CARD */}
                <View className="bg-gradient-to-b from-gray-900/70 to-gray-800/40 border border-gray-700/40 rounded-2xl p-5 space-y-6">
                  <FocusInput
                    icon={<Mail size={18} color="#9CA3AF" />}
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                  />
                  <FocusInput
                    icon={<Lock size={18} color="#9CA3AF" />}
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    secure
                  />

                  <Pressable
                    disabled={loading}
                    onPress={mode === 'signin' ? signInWithEmail : signUpWithEmail}
                    className={`mt-2 rounded-xl py-4 items-center justify-center ${loading ? 'opacity-60' : ''}`}
                  >
                    <LinearGradient
                      colors={["#7e22ce", "#db2777"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={{ position: 'absolute', inset: 0, borderRadius: 12 }}
                    />
                    {loading ? <ActivityIndicator color="#fff" /> : (
                      <Text className="text-white font-semibold tracking-wide">
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </Text>
                    )}
                  </Pressable>

                  <View className="flex-row justify-center mt-1">
                    <Text className="text-gray-400 text-xs">{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}</Text>
                    <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                      <Text className="text-pink-500 text-xs font-medium">
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className="items-center mt-10">
                <Text className="text-gray-600 text-[10px]">By continuing you agree to our Terms & Privacy.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}