import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { Currencies, Languages } from '@/consts/userSettings';
import { useUpdatePreferredCurrency } from '@/mutations/dashboard/UpdatePreferredCurrency';
import { useUpdatePreferredLanguage } from '@/mutations/dashboard/UpdatePreferredLanguage';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { router } from 'expo-router';
import { ChevronLeft, Moon, Smartphone, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ThemeSettings() {
  const { userId } = useUserContext();
  const { mode, setMode, colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();


  const [selectedCurrency, setSelectedCurrency] = useState(Currencies[0].name);
  const [selectedLanguage, setSelectedLanguage] = useState(Languages[0].code);

  const { mutate: preferredLanguage } = useUpdatePreferredLanguage({
    userId: userId || '',
    language: selectedLanguage,
  })

  const { mutate: preferredCurrency } = useUpdatePreferredCurrency({
    userId: userId || '',
    currency: selectedCurrency,
  })

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
          {/* Theme Section */}
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
                  backgroundColor: isSelected
                    ? colors.surfaceVariant
                    : colors.surface,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.accent : colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.surfaceVariant,
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
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
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
                  <Text
                    style={{ fontSize: 16, fontWeight: '600', color: colors.text }}
                  >
                    Fashion App
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>
                    {isDark ? 'Dark' : 'Light'} theme preview
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                This is how your outfit feed and other content will look with the
                selected theme.
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
                  <Text
                    style={{
                      color: colors.white,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
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
                  <Text
                    style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}
                  >
                    Secondary
                  </Text>
                </View>
              </View>
            </View>
            {/* Language & Currency Section */}
            <View style={{ marginTop: 32 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Language & Currency
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  marginBottom: 16,
                }}
              >
                Select your preferred language and currency for the app.
              </Text>

              {/* Language Select */}
              <View
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Select
                  selectedValue={selectedLanguage}
                  onValueChange={(value: string) => {
                    setSelectedLanguage(value);

                    preferredLanguage();
                  }}
                >
                  <SelectTrigger
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <SelectInput
                      placeholder="Select Language"
                      className='p-2 text-white'
                    />
                    <SelectIcon className="ml-2" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent
                      style={{
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {Languages.map((lang) => (
                        <SelectItem
                          key={lang.code}
                          label={lang.name}
                          value={lang.code}
                          style={{
                            padding: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          }}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </View>

              {/* Currency Select */}
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Select
                  selectedValue={selectedCurrency}
                  onValueChange={(value: string) => {
                    setSelectedCurrency(value)

                    preferredCurrency();
                  }}
                >
                  <SelectTrigger
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <SelectInput
                      placeholder="Select Currency"
                      className='p-2 text-white'
                    />
                    <SelectIcon className="ml-2" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent
                      style={{
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {Currencies.map((currency) => (
                        <SelectItem
                          key={currency.name}
                          label={`${currency.name} (${currency.symbol})`}
                          value={currency.name}
                          style={{
                            padding: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          }}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
