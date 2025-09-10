import { useTheme } from '@/providers/themeContext';
import { router } from 'expo-router';
import { ChevronLeft, Moon, Smartphone, Sun } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ThemeSettings() {
  const { mode, setMode, colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const themeOptions = [
    {
      key: 'light' as const,
      label: 'Light',
      description: 'Always use light theme',
      icon: Sun,
    },
    { 
      key: 'dark' as const,
      label: 'Dark',
      description: 'Always use dark theme',
      icon: Moon,
    },
    {
      key: 'system' as const,
      label: 'System',
      description: 'Follow system settings',
      icon: Smartphone,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View 
        style={{ 
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginRight: 8,
              borderRadius: 999,
              backgroundColor: colors.surfaceVariant,
            }}
          >
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>
          <Text 
            style={{ 
              fontSize: 20, 
              fontWeight: '600', 
              color: colors.text,
              flex: 1,
            }}
          >
            Theme Settings
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text 
            style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Appearance
          </Text>
          <Text 
            style={{ 
              fontSize: 14, 
              color: colors.textMuted,
              marginBottom: 20,
            }}
          >
            Choose how Fashion App looks to you. Select a single theme, or sync with your system settings.
          </Text>

          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = mode === option.key;
            
            return (
              <Pressable
                key={option.key}
                onPress={() => setMode(option.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  backgroundColor: isSelected ? colors.surfaceVariant : colors.surface,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accent : colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isSelected ? colors.accent : colors.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Icon 
                    size={20} 
                    color={isSelected ? colors.white : colors.textMuted} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text 
                    style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 14, 
                      color: colors.textMuted,
                    }}
                  >
                    {option.description}
                  </Text>
                </View>

                {isSelected && (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.white,
                      }}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Preview Section */}
          <View style={{ marginTop: 32 }}>
            <Text 
              style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Preview
            </Text>
            
            <View
              style={{
                padding: 20,
                borderRadius: 16,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.accent,
                    marginRight: 12,
                  }}
                />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Fashion App
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
                    {isDark ? 'Dark' : 'Light'} theme preview
                  </Text>
                </View>
              </View>
              
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                This is how your outfit feed and other content will look with the selected theme.
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <View
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                    Primary
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
                    Secondary
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
