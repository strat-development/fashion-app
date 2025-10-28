import { fetchConversationMessages, fetchConversations } from '@/fetchers/fetchConversations';
import { deleteConversationMutation } from '@/mutations/DeleteConversationMutation';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { BlurView } from 'expo-blur';
import { MessageSquare, Plus, SlidersHorizontal, AlertTriangle, X } from 'lucide-react-native';
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
  const [confirmDeleteVisible, setConfirmDeleteVisible] = React.useState(false);
  const [toDeleteConversationId, setToDeleteConversationId] = React.useState<string | null>(null);

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
    setToDeleteConversationId(conversationId);
    setConfirmDeleteVisible(true);
  }

  async function confirmDeleteConversation(id?: string | null) {
    const cid = id || toDeleteConversationId;
    if (!cid) return;
    try {
      await deleteConversationMutation({ supabase: (require('@/lib/supabase').supabase as any), conversationId: cid });
    } catch { }
    if (conversationId === cid) {
      setConversationId(null);
      setSelectedConversationTitle(undefined);
      setMessages([]);
    }
    const data = await fetchConversations(userId || '');
    const sanitized = (data || []).map((c: any) => ({ id: c.id, title: c.title || '', created_at: c.created_at || '' }));
    setList(sanitized);
    setConfirmDeleteVisible(false);
    setToDeleteConversationId(null);
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
              <X size={18} color={colors.textSecondary} />
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
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {list.map((c) => (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => handlePickConversation({ id: c.id, title: c.title })} style={{ paddingVertical: 6, flex: 1 }}>
                    <Text style={{ color: colors.text }}>{c.title || c.id}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // open confirm modal for this conversation
                      setToDeleteConversationId(c.id);
                      setConfirmDeleteVisible(true);
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

      <Modal
        visible={confirmDeleteVisible}
        animationType={'fade'}
        transparent={true}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '100%', maxWidth: 520, borderRadius: 18, padding: 18, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: `${colors.error}20` }}>
                  <AlertTriangle size={18} color={colors.error} />
                </View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{t('deleteModalOutfit.title')}</Text>
              </View>
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={{ padding: 6 }}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, marginBottom: 18 }}>{t('deleteModalOutfit.message')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>{t('deleteModalOutfit.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeleteConversation()} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center' }}>
                <Text style={{ color: colors.white }}>{t('deleteModalOutfit.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};