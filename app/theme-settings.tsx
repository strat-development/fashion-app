import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectTrigger
} from '@/components/ui/select';
import { Currencies, Languages } from '@/consts/userSettings';
import { useUpdatePreferredCurrency } from '@/features/auth/api/UpdatePreferredCurrency';
import { useUpdatePreferredLanguage } from '@/features/auth/api/UpdatePreferredLanguage';
import { useUserContext } from '@/features/auth/context/UserContext';
import i18n from '@/i18n';
import { useTheme } from '@/providers/themeContext';
import { router } from 'expo-router';
import { ChevronLeft, DollarSign, Globe, Moon, Smartphone, Sun } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ThemeSettings() {
  const { t } = useTranslation();
  const { userId, preferredLanguage: userLanguage, preferredCurrency: userCurrency } = useUserContext();
  const { mode, setMode, colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency || Currencies[0].name);
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage || Languages[0].code);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const { mutate: updateLanguage } = useUpdatePreferredLanguage({
    userId: userId || '',
  });

  const { mutate: updateCurrency } = useUpdatePreferredCurrency({
    userId: userId || '',
  });

  useEffect(() => {
    if (userLanguage) {
      setSelectedLanguage(userLanguage);
    }
  }, [userLanguage]);

  useEffect(() => {
    if (userCurrency) {
      setSelectedCurrency(userCurrency);
    }
  }, [userCurrency]);

  const themeOptions = [
    {
      key: 'light' as const,
      label: t('themeSettings.appearance.options.light.label'),
      description: t('themeSettings.appearance.options.light.description'),
      icon: Sun,
    },
    {
      key: 'dark' as const,
      label: t('themeSettings.appearance.options.dark.label'),
      description: t('themeSettings.appearance.options.dark.description'),
      icon: Moon,
    },
    {
      key: 'system' as const,
      label: t('themeSettings.appearance.options.system.label'),
      description: t('themeSettings.appearance.options.system.description'),
      icon: Smartphone,
    },
  ];

  const languageIcons = Languages.reduce((acc, lang) => ({
    ...acc,
    [lang.code]: Globe,
  }), {} as Record<string, any>);

  const currencyIcons = Currencies.reduce((acc, currency) => ({
    ...acc,
    [currency.name]: DollarSign,
  }), {} as Record<string, any>);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.push('/(tabs)/userProfile')}
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
            {t('themeSettings.title')}
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
            {t('themeSettings.appearance.title')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              marginBottom: 20,
            }}
          >
            {t('themeSettings.appearance.description')}
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
              {t('themeSettings.languageCurrency.title')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                marginBottom: 16,
              }}
            >
              {t('themeSettings.languageCurrency.description')}
            </Text>

            {/* Language Select */}
            <View
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedLanguage ? colors.accent : colors.border,
                backgroundColor: selectedLanguage ? colors.surfaceVariant : colors.surface,
                overflow: 'hidden',
              }}
            >
              {Platform.OS === 'android' ? (
                <>
                  <Pressable
                    onPress={() => setShowLanguagePicker(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      height: 72,
                      borderWidth: 0,
                      backgroundColor: "transparent"
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: selectedLanguage ? colors.accent : colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Globe
                        size={20}
                        color={selectedLanguage ? colors.white : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {Languages.find(lang => lang.code === selectedLanguage)?.name || t('themeSettings.languageCurrency.languagePlaceholder')}
                      </Text>
                    </View>
                  </Pressable>
                  <Modal
                    visible={showLanguagePicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowLanguagePicker(false)}
                  >
                    <Pressable style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }} onPress={() => setShowLanguagePicker(false)}>
                      <View style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                        <FlatList
                          data={Languages}
                          keyExtractor={(item) => item.code}
                          renderItem={({ item }) => (
                            <Pressable
                              onPress={() => {
                                setSelectedLanguage(item.code);
                                i18n.changeLanguage(item.code);
                                updateLanguage(item.code);
                                setShowLanguagePicker(false);
                              }}
                              style={{ paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: selectedLanguage === item.code ? colors.surfaceVariant : colors.surface }}
                            >
                              <Text style={{ color: colors.text }}>{item.name}</Text>
                            </Pressable>
                          )}
                        />
                      </View>
                    </Pressable>
                  </Modal>
                </>
              ) : (
                <Select
                  selectedValue={selectedLanguage}
                  onValueChange={(value: string) => {
                    setSelectedLanguage(value);
                    i18n.changeLanguage(value);
                    updateLanguage(value);
                  }}
                >
                  <SelectTrigger
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      height: 72,
                      borderWidth: 0,
                      backgroundColor: "transparent"
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: selectedLanguage ? colors.accent : colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Globe
                        size={20}
                        color={selectedLanguage ? colors.white : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {Languages.find(lang => lang.code === selectedLanguage)?.name || t('themeSettings.languageCurrency.languagePlaceholder')}
                      </Text>
                    </View>
                    <SelectIcon />
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
                      {Languages.map((lang) => {
                        const LanguageIcon = languageIcons[lang.code];
                        return (
                          <SelectItem
                            key={lang.code}
                            label={lang.name}
                            value={lang.code}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                              backgroundColor: selectedLanguage === lang.code
                                ? colors.surfaceVariant
                                : colors.surface,
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: selectedLanguage === lang.code
                                  ? colors.accent
                                  : colors.surfaceVariant,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}
                            >
                              <LanguageIcon
                                size={20}
                                color={selectedLanguage === lang.code ? colors.white : colors.textMuted}
                              />
                            </View>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text,
                                flex: 1,
                              }}
                            >
                              {lang.name}
                            </Text>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            </View>

            {/* Currency Select */}
            <View
              style={{
                marginBottom: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedCurrency ? colors.accent : colors.border,
                backgroundColor: selectedCurrency ? colors.surfaceVariant : colors.surface,
                overflow: 'hidden',
              }}
            >
              {Platform.OS === 'android' ? (
                <>
                  <Pressable
                    onPress={() => setShowCurrencyPicker(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      height: 72,
                      borderWidth: 0,
                      backgroundColor: "transparent"
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: selectedCurrency ? colors.accent : colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <DollarSign
                        size={20}
                        color={selectedCurrency ? colors.white : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {Currencies.find(currency => currency.name === selectedCurrency)?.name ?
                          `${Currencies.find(currency => currency.name === selectedCurrency)?.name} (${Currencies.find(currency => currency.name === selectedCurrency)?.symbol})` :
                          t('themeSettings.languageCurrency.currencyPlaceholder')}
                      </Text>
                    </View>
                  </Pressable>
                  <Modal
                    visible={showCurrencyPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowCurrencyPicker(false)}
                  >
                    <Pressable style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }} onPress={() => setShowCurrencyPicker(false)}>
                      <View style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                        <FlatList
                          data={Currencies}
                          keyExtractor={(item) => item.name}
                          renderItem={({ item }) => (
                            <Pressable
                              onPress={() => {
                                setSelectedCurrency(item.name);
                                updateCurrency(item.name);
                                setShowCurrencyPicker(false);
                              }}
                              style={{ paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: selectedCurrency === item.name ? colors.surfaceVariant : colors.surface }}
                            >
                              <Text style={{ color: colors.text }}>{`${item.name} (${item.symbol})`}</Text>
                            </Pressable>
                          )}
                        />
                      </View>
                    </Pressable>
                  </Modal>
                </>
              ) : (
                <Select
                  selectedValue={selectedCurrency}
                  onValueChange={(value: string) => {
                    setSelectedCurrency(value);
                    updateCurrency(value);
                  }}
                >
                  <SelectTrigger
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      height: 72,
                      borderWidth: 0,
                      backgroundColor: "transparent"
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: selectedCurrency ? colors.accent : colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <DollarSign
                        size={20}
                        color={selectedCurrency ? colors.white : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {Currencies.find(currency => currency.name === selectedCurrency)?.name ?
                          `${Currencies.find(currency => currency.name === selectedCurrency)?.name} (${Currencies.find(currency => currency.name === selectedCurrency)?.symbol})` :
                          t('themeSettings.languageCurrency.currencyPlaceholder')}
                      </Text>
                    </View>
                    <SelectIcon />
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
                      {Currencies.map((currency) => {
                        const CurrencyIcon = currencyIcons[currency.name];
                        return (
                          <SelectItem
                            key={currency.name}
                            label={`${currency.name} (${currency.symbol})`}
                            value={currency.name}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                              backgroundColor: selectedCurrency === currency.name
                                ? colors.surfaceVariant
                                : colors.surface,
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: selectedCurrency === currency.name
                                  ? colors.accent
                                  : colors.surfaceVariant,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}
                            >
                              <CurrencyIcon
                                size={20}
                                color={selectedCurrency === currency.name ? colors.white : colors.textMuted}
                              />
                            </View>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text,
                                flex: 1,
                              }}
                            >
                              {`${currency.name} (${currency.symbol})`}
                            </Text>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}