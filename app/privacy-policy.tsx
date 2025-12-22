import { privacyPolicy } from '@/consts/policies';
import { useTheme } from '@/providers/themeContext';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicy() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
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
            Privacy Policy
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: colors.textSecondary,
            }}
          >
            This page explains how we handle your personal data when you use the app.
          </Text>
        </View>

        {privacyPolicy.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 10,
              }}
            >
              {section.title}
            </Text>

           
            {section.content.map((paragraph: string, paragraphIndex: number) => {
              const isBulletPoint = paragraph.trim().startsWith('•');

              if (isBulletPoint) {
                return (
                  <View
                    key={paragraphIndex}
                    style={{
                      flexDirection: 'row',
                      marginBottom: paragraphIndex < section.content.length - 1 ? 6 : 0,
                      paddingLeft: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 22,
                        color: colors.textSecondary,
                        marginRight: 6,
                      }}
                    >
                      •
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 22,
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      {paragraph.replace(/^•\s*/, '')}
                    </Text>
                  </View>
                );
              }

              return (
                <Text
                  key={paragraphIndex}
                  style={{
                    fontSize: 14,
                    lineHeight: 22,
                    color: colors.textSecondary,
                    marginBottom: paragraphIndex < section.content.length - 1 ? 8 : 0,
                  }}
                >
                  {paragraph}
                </Text>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
