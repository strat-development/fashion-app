import { useTheme } from '@/providers/themeContext';
import { BlurView } from 'expo-blur';
import { MessageSquare, Plus, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type ChatHeaderProps = {
  onShowConversations: () => void;
  onNewChat: () => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  title?: string;
  t: (k: string) => string;
};

export const ChatHeader = ({ onShowConversations, onNewChat, filtersExpanded, onToggleFilters, t }: ChatHeaderProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: isDark ? 'transparent' : colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <BlurView
        intensity={70}
        tint={isDark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />

      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={onShowConversations}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: 44,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
          }}
        >
          <MessageSquare size={18} color={colors.textSecondary} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginLeft: 8 }}>
            {t('chatSection.conversations')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={onNewChat}
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleFilters}
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              backgroundColor: filtersExpanded ? colors.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: filtersExpanded ? 0 : 1,
              borderColor: filtersExpanded ? 'transparent' : colors.border,
            }}
          >
            <SlidersHorizontal
              size={18}
              color={filtersExpanded ? colors.white : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};