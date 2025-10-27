import { fetchConversationMessages, fetchConversations } from '@/fetchers/fetchConversations';
import { deleteConversationMutation } from '@/mutations/DeleteConversationMutation';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { BlurView } from 'expo-blur';
import { MessageSquare, Plus, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type ChatHeaderProps = {
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  title?: string;
  t: (k: string) => string;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  setSelectedConversationTitle: (title: string | undefined) => void;
  setMessages: (msgs: { id: string; role: 'user' | 'assistant'; content: string; created_at?: string }[]) => void;
};

export const ChatHeader = ({ filtersExpanded, onToggleFilters, t, title, conversationId, setConversationId, setSelectedConversationTitle, setMessages }: ChatHeaderProps) => {
  const { colors, isDark } = useTheme();
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [list, setList] = React.useState<{ id: string; title: string; created_at: string }[]>([]);
  const { userId } = useUserContext();

  async function handleShowConversations() {
    const data = await fetchConversations(userId || '');
    const sanitized = (data || []).map((c: any) => ({ id: c.id, title: c.title || '', created_at: c.created_at || '' }));
    setList(sanitized);
    setShowOverlay(true);
  }

  async function handlePickConversation(c: { id: string; title: string }) {
    setConversationId(c.id);
    setSelectedConversationTitle(c.title);
    const mapped = await fetchConversationMessages(c.id);
    setMessages(mapped);
    setShowOverlay(false);
  }

  async function handleNewChat() {
    setConversationId(null);
    setSelectedConversationTitle(undefined);
    setMessages([]);
  }

  async function handleDeleteCurrent() {
    if (!conversationId) return;
    const confirmed = true;
    if (!confirmed) return;
    try {
      await deleteConversationMutation({ supabase: (require('@/lib/supabase').supabase as any), conversationId });
    } catch { }
    setConversationId(null);
    setSelectedConversationTitle(undefined);
    setMessages([]);
    const data = await fetchConversations(userId || '');
    const sanitized = (data || []).map((c: any) => ({ id: c.id, title: c.title || '', created_at: c.created_at || '' }));
    setList(sanitized);
  }

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
          onPress={handleShowConversations}
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
            {title || t('chatSection.conversations')}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!!title && (
            <TouchableOpacity
              onPress={handleDeleteCurrent}
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
              <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNewChat}
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
            activeOpacity={1}
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

      <Modal visible={showOverlay} transparent animationType="fade" onRequestClose={() => setShowOverlay(false)}>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDark ? '#000000B3' : '#00000066' }} />
          <BlurView
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowOverlay(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
          />
          <View style={{ marginTop: 128, marginHorizontal: 16, borderRadius: 16, padding: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>{t('chatSection.conversations')}</Text>
              <TouchableOpacity onPress={() => setShowOverlay(false)} style={{ paddingVertical: 8 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 18 }}>X</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {list.map((c) => (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => handlePickConversation({ id: c.id, title: c.title })} style={{ paddingVertical: 6, flex: 1 }}>
                    <Text style={{ color: colors.text }}>{c.title || c.id}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await deleteConversationMutation({ supabase: (require('@/lib/supabase').supabase as any), conversationId: c.id });
                      } catch { }
                      const refreshed = await fetchConversations(userId || '');
                      const sanitized = (refreshed || []).map((cc: any) => ({ id: cc.id, title: cc.title || '', created_at: cc.created_at || '' }));
                      setList(sanitized);
                      if (conversationId === c.id) {
                        setConversationId(null);
                        setSelectedConversationTitle(undefined);
                        setMessages([]);
                      }
                    }}
                    style={{ paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
                  >
                    <Text style={{ color: colors.textSecondary }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};