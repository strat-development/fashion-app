import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { ThemedGradient, useTheme } from '@/providers/themeContext';

interface FullScreenLoaderProps {
  message?: string;
  testID?: string;
}

export function FullScreenLoader({ message, testID }: FullScreenLoaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const fallbackMessage = message ?? t('common.loading');

  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 999,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.border,
          borderWidth: colors.background === colors.black ? 0 : 1,
          backgroundColor: colors.surface,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.16,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <ThemedGradient
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            opacity: 0.9,
          }}
        />
        <ActivityIndicator size="large" color={colors.white} />
      </View>
      {fallbackMessage ? (
        <Text
          style={{
            color: colors.textSecondary,
            marginTop: 24,
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {fallbackMessage}
        </Text>
      ) : null}
    </View>
  );
}
