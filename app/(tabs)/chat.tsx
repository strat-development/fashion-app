import { AIChatFilters } from '@/components/outfit-constructor/AIChatFilters';
import { ChatComposer } from '@/components/outfit-constructor/ChatComposer';
import { ChatHeader } from '@/components/outfit-constructor/ChatHeader';
import { ChatMessages } from '@/components/outfit-constructor/ChatMessages';
import { aiChatStream } from '@/fetchers/aiChat';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { buildSystemPrompt as buildSystemPromptUtil, generateUserLikePrompt } from '@/utils/chatPrompt';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId, preferredCurrency, preferredLanguage } = useUserContext();
  const [outfitTag, setOutfitTag] = useState<string[]>(['']);
  const [outfitElement, setOutfitElement] = useState<string[]>(['']);
  const [outfitColor, setOutfitColor] = useState<string[]>(['']);
  const [outfitGender, setOutfitGender] = useState<string[]>(['']);
  const [outfitFit, setOutfitFit] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lowestPrice, setLowestPrice] = useState<number>(0);
  const [highestPrice, setHighestPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('');
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; created_at?: string }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const [conversationList, setConversationList] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastAutoPromptRef = useRef<string>('');
  const [selectedConversationTitle, setSelectedConversationTitle] = useState<string | undefined>(undefined);
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      try { showSub.remove(); } catch {}
      try { hideSub.remove(); } catch {}
    };
  }, []);

  function getCleanAssistantText(text: string) {
    let cleaned = text.replace(/```[\s\S]*?```/g, '').trim();
    cleaned = cleaned.replace(/^#+\s*(Summary|Items?)\s*$/gim, '').trim();

    cleaned = cleaned.replace(/\[IMAGE:\s*([^\]]+)\]/gi, '$1');

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }

  const effectiveCurrency = useMemo(() => currency || preferredCurrency || 'USD', [currency, preferredCurrency]);

  const generatePromptFromFilters = useCallback((): string => {
    return generateUserLikePrompt({
      t,
      genders: outfitGender,
      styles: outfitTag,
      fits: outfitFit,
      colors: outfitColor,
      elements: outfitElement,
      lowestPrice,
      highestPrice,
      currency: effectiveCurrency,
    });
  }, [t, outfitGender, outfitTag, outfitFit, outfitColor, outfitElement, lowestPrice, highestPrice, effectiveCurrency]);

  useEffect(() => {
    const auto = generatePromptFromFilters();
    const current = searchQuery.trim();
    const last = lastAutoPromptRef.current.trim();
    const shouldReplace = current.length === 0 || current === last;
    if (shouldReplace) {
      setSearchQuery(auto);
      lastAutoPromptRef.current = auto;
    }
  }, [generatePromptFromFilters, searchQuery, preferredLanguage]);

  function buildSystemPrompt() {
    return buildSystemPromptUtil({
      preferredLanguage,
      outfitGender,
      outfitTag,
      outfitColor,
      outfitElement,
      outfitFit,
      lowestPrice,
      highestPrice,
      currency: effectiveCurrency,
    });
  }

  async function ensureConversation() {

    if (conversationId) return conversationId;

    const dt = new Date();
    const title = `Outfit AI - ${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;

    try {
      const { data, error } = await (supabase as any)
        .from('ai_conversations')
        .insert({ user_id: userId, title })
        .select('id')
        .single();

      if (error) throw error;

      setConversationId((data as any).id);

      return (data as any).id as string;
    } catch {
      const tmp = `local-${Date.now()}`;

      setConversationId(tmp);

      return tmp;
    }
  }

  async function persistMessage(convId: string, role: 'user' | 'assistant', content: string, createdAt?: string) {
    try {
      await (supabase as any).from('ai_messages').insert({ conversation_id: convId, role, content, created_at: createdAt });
    } catch { }
  }

  async function handleSend() {
    const userText = searchQuery.trim();

    if (!userText || sending) return;

    setSending(true);
    setIsStreaming(true);
    setFiltersExpanded(false);
    setSearchQuery('');
    setHighestPrice(0);
    setLowestPrice(0);
    setCurrency('USD');
    setOutfitGender([]);
    setOutfitTag([]);
    setOutfitFit([]);
    setOutfitColor([]);
    setOutfitElement([]);

    const convId = await ensureConversation();

    const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, content: userText, created_at: new Date().toISOString() };

    setMessages((prev) => [...prev, userMsg, { id: `a-${Date.now()}`, role: 'assistant', content: '' }]);
    persistMessage(convId, 'user', userText, userMsg.created_at);

    try {
      const systemPrompt = buildSystemPrompt();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      let assembled = '';
      await aiChatStream({
        systemPrompt,
        history,
        userText,
        temperature: 0.7,
        onDelta: (delta) => {
          assembled += delta;
          setMessages((prev) => {
            const copy = [...prev];
            const lastIndex = copy.length - 1;
            if (lastIndex >= 0 && copy[lastIndex].role === 'assistant') {
              copy[lastIndex] = { ...copy[lastIndex], content: assembled };
            }
            return copy;
          });
        },
      });

      const finalText = assembled || (t('common.error') || 'Error generating response.');
      persistMessage(convId, 'assistant', finalText, new Date().toISOString());
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === 'assistant') {
          copy[lastIndex] = { ...copy[lastIndex], content: t('common.error') || 'Error generating response.' };
        }
        return copy;
      });
    } finally {
      setSending(false);
      setIsStreaming(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  }

  function handleStop() {
    try { abortRef.current?.abort(); } catch { }
    setIsStreaming(false);
    setSending(false);
  }


  useEffect(() => {
    if (!conversationId) return;

    const channel = (supabase as any)
      .channel(`ai_messages_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        const { role, content, id, created_at } = payload.new || {};
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === id);
          if (exists) return prev;
          return [...prev, { id: id || `srv-${Date.now()}`, role, content, created_at }];
        });
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      })
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setSelectedConversationTitle(undefined);
      return;
    }
    const found = conversationList.find(c => c.id === conversationId);
    if (found?.title) setSelectedConversationTitle(found.title);
  }, [conversationId, conversationList]);

  return (
    <>
      {(Platform.OS === 'ios') ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior='padding'
          keyboardVerticalOffset={insets.top}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
            <View className='flex-1' style={{ backgroundColor: colors.background }}>
              <View style={{ backgroundColor: colors.background, }}>
                <ChatHeader
                  filtersExpanded={filtersExpanded}
                  onToggleFilters={() => setFiltersExpanded((v) => !v)}
                  t={(k) => t(k)}
                  title={selectedConversationTitle}
                  conversationId={conversationId}
                  setConversationId={setConversationId}
                  setSelectedConversationTitle={setSelectedConversationTitle}
                  setMessages={setMessages}
                />
              </View>

              {filtersExpanded && (
                <AIChatFilters
                  outfitGender={outfitGender}
                  setOutfitGender={setOutfitGender}
                  outfitTag={outfitTag}
                  setOutfitTag={setOutfitTag}
                  outfitFit={outfitFit}
                  setOutfitFit={setOutfitFit}
                  outfitColor={outfitColor}
                  setOutfitColor={setOutfitColor}
                  outfitElement={outfitElement}
                  setOutfitElement={setOutfitElement}
                  lowestPrice={lowestPrice}
                  setLowestPrice={setLowestPrice}
                  highestPrice={highestPrice}
                  setHighestPrice={setHighestPrice}
                  currency={currency}
                  setCurrency={setCurrency}
                  isOpen={filtersExpanded}
                  onToggle={() => setFiltersExpanded((v) => !v)}
                />
              )}

              <View className='flex-1'>
                <ChatMessages
                  messages={messages}
                  isStreaming={isStreaming}
                  getCleanAssistantText={getCleanAssistantText}
                  t={(k) => t(k)}
                  scrollRef={scrollRef}
                />
              </View>

              <View
                className='px-4 py-3'
                style={{
                  backgroundColor: colors.background,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingBottom: 8,
                }}
              >
                <ChatComposer
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSend={handleSend}
                  onStop={handleStop}
                  sending={sending}
                  placeholder={t('chatSection.placeholders.outfitDescription')}
                  bottomSpacing={isKeyboardVisible ? 12 : 64}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior='height'
          keyboardVerticalOffset={0}
        >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
          <View className='flex-1' style={{ backgroundColor: colors.background }}>
            <View style={{ backgroundColor: colors.background, }}>
              <ChatHeader
                filtersExpanded={filtersExpanded}
                onToggleFilters={() => setFiltersExpanded((v) => !v)}
                t={(k) => t(k)}
                title={selectedConversationTitle}
                conversationId={conversationId}
                setConversationId={setConversationId}
                setSelectedConversationTitle={setSelectedConversationTitle}
                setMessages={setMessages}
              />
            </View>

            {filtersExpanded && (
              <AIChatFilters
                outfitGender={outfitGender}
                setOutfitGender={setOutfitGender}
                outfitTag={outfitTag}
                setOutfitTag={setOutfitTag}
                outfitFit={outfitFit}
                setOutfitFit={setOutfitFit}
                outfitColor={outfitColor}
                setOutfitColor={setOutfitColor}
                outfitElement={outfitElement}
                setOutfitElement={setOutfitElement}
                lowestPrice={lowestPrice}
                setLowestPrice={setLowestPrice}
                highestPrice={highestPrice}
                setHighestPrice={setHighestPrice}
                currency={currency}
                setCurrency={setCurrency}
                isOpen={filtersExpanded}
                onToggle={() => setFiltersExpanded((v) => !v)}
              />
            )}

            <View className='flex-1'>
              <ChatMessages
                messages={messages}
                isStreaming={isStreaming}
                getCleanAssistantText={getCleanAssistantText}
                t={(k) => t(k)}
                scrollRef={scrollRef}
              />
            </View>

            <View
              className='px-4 py-3'
              style={{
                backgroundColor: colors.background,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingBottom: 8,
              }}
            >
              <ChatComposer
                value={searchQuery}
                onChange={setSearchQuery}
                onSend={handleSend}
                onStop={handleStop}
                sending={sending}
                placeholder={t('chatSection.placeholders.outfitDescription')}
                bottomSpacing={isKeyboardVisible ? 12 : 64}
              />
            </View>
          </View>
        </SafeAreaView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}