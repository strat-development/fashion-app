import { ChatComposer } from '@/components/outfit-constructor/ChatComposer';
import { ChatHeader } from '@/components/outfit-constructor/ChatHeader';
import { ChatMessages } from '@/components/outfit-constructor/ChatMessages';
import { FiltersOverlay } from '@/components/outfit-constructor/FiltersOverlay';
import { Button, ButtonText } from '@/components/ui/button';
import { webSearch } from '@/fetchers/webSearch';
import { openAiClient } from '@/lib/openAiClient';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { buildSystemPrompt as buildSystemPromptUtil, generateUserLikePrompt } from '@/utils/chatPrompt';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; created_at?: string }>>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const [conversationList, setConversationList] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastAutoPromptRef = useRef<string>('');

  function getCleanAssistantText(text: string) {
    let cleaned = text.replace(/```[\s\S]*?```/g, '').trim();
    cleaned = cleaned.replace(/^#+\s*(Summary|Items?)\s*$/gim, '').trim();

    cleaned = cleaned.replace(/\[IMAGE:\s*([^\]]+)\]/gi, '$1');

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }

  const effectiveCurrency = useMemo(() => currency || preferredCurrency || 'USD', [currency, preferredCurrency]);

  function generatePromptFromFilters(): string {
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
  }

  useEffect(() => {
    const auto = generatePromptFromFilters();
    const current = searchQuery.trim();
    const last = lastAutoPromptRef.current.trim();
    const shouldReplace = current.length === 0 || current === last;
    if (shouldReplace) {
      setSearchQuery(auto);
      lastAutoPromptRef.current = auto;
    }
  }, [outfitGender, outfitTag, outfitFit, outfitColor, outfitElement, lowestPrice, highestPrice, effectiveCurrency, preferredLanguage]);

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

    const convId = await ensureConversation();

    const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, content: userText, created_at: new Date().toISOString() };

    setMessages((prev) => [...prev, userMsg, { id: `a-${Date.now()}`, role: 'assistant', content: '' }]);
    persistMessage(convId, 'user', userText, userMsg.created_at);

    try {
      const systemPrompt = buildSystemPrompt();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const tools = [
        {
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for the latest fashion brand pages or style guides relevant to the query.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                num: { type: 'number' },
              },
              required: ['query'],
            },
          },
        },
      ];

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const pre = await (openAiClient as any).chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userText },
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        stream: false
      });

      const preChoice = pre.choices?.[0];
      const toolCalls = preChoice?.message?.tool_calls as Array<any> | undefined;

      const workingMessages: Array<any> = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userText },
      ];

      if (toolCalls && toolCalls.length) {
        for (const call of toolCalls) {
          if (call.type === 'function' && call.function?.name === 'web_search') {
            let args: any = {};
            try { args = JSON.parse(call.function.arguments || '{}'); } catch { }
            const q = String(args.query || userText);
            const num = Number(args.num || 5);
            const results = await webSearch(q, num);
            
            workingMessages.push({
              role: 'assistant',
              tool_calls: [call],
              content: '',
            });
            workingMessages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify({ results }),
            });
          }
        }
      } else if (preChoice?.message?.content) {
        workingMessages.push({ role: 'assistant', content: preChoice.message.content });
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const finalStream = await (openAiClient as any).chat.completions.create({
        model: 'gpt-4o',
        messages: workingMessages,
        temperature: 0.7,
        stream: true
      });

      let assembled = '';
      let updateCount = 0;
      // @ts-ignore for-await in RN
      for await (const chunk of finalStream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (!delta) continue;
        assembled += delta;
        updateCount++;
        if (updateCount % 3 === 0) {
          setMessages((prev) => {
            const copy = [...prev];
            const lastIndex = copy.length - 1;
            if (lastIndex >= 0 && copy[lastIndex].role === 'assistant') {
              copy[lastIndex] = { ...copy[lastIndex], content: assembled };
            }
            return copy;
          });
        }
      }

      setMessages((prev) => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === 'assistant') {
          copy[lastIndex] = { ...copy[lastIndex], content: assembled };
        }
        return copy;
      });

      persistMessage(convId, 'assistant', assembled, new Date().toISOString());
    } catch (err) {
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

                return (
                  <>


      <View className='flex-1' style={{ backgroundColor: colors.background }}>
        {/* Header Section - Fixed at top */}
        <View style={{ backgroundColor: colors.background,}}>
          <ChatHeader
            onShowConversations={async () => {
              try {
                const { data } = await (supabase as any)
                  .from('ai_conversations')
                  .select('id,title,created_at')
                  .order('created_at', { ascending: false });
                setConversationList(data || []);
              } catch { }
            }}
            onNewChat={() => { setConversationId(null); setMessages([]); }}
            filtersExpanded={filtersExpanded}
            onToggleFilters={() => setFiltersExpanded((v) => !v)}
            t={(k) => t(k)}
          />
        </View>

        {/* Conversations List - Overlay */}
        {conversationList.length > 0 && (
          <View className='absolute inset-0 z-50'>
            <Pressable className='absolute inset-0' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setConversationList([])} />
            <View className='absolute top-32 left-4 right-4 rounded-2xl p-4 shadow-2xl' style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className='text-sm font-medium mb-3' style={{ color: colors.text }}>Recent Conversations</Text>
              {conversationList.map((c) => (
                <Button key={c.id} variant='link' action='primary' size='sm' className='justify-start mb-2' onPress={async () => {
                  setConversationId(c.id);
                  try {
                    const { data } = await (supabase as any)
                      .from('ai_messages')
                      .select('id,role,content,created_at')
                      .eq('conversation_id', c.id)
                      .order('created_at', { ascending: true });
                    const mapped = (data || []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at }));
                    setMessages(mapped);
                  } catch { }
                  setConversationList([]);
                }}>
                  <ButtonText className='text-left' style={{ color: colors.textSecondary }}>{c.title || c.id}</ButtonText>
                </Button>
                ))}
              </View>
          </View>
        )}

        {/* Main Chat Area */}
        <View className='flex-1 pb-24'>
          <ChatMessages
            messages={messages}
            isStreaming={isStreaming}
            getCleanAssistantText={getCleanAssistantText}
            t={(k) => t(k)}
            scrollRef={scrollRef}
          />
        </View>

        {/* Input Section - Fixed at bottom with proper z-index */}
        <View className='absolute bottom-0 left-0 right-0 px-4 py-3 z-20' style={{ backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 34 }}>
          <ChatComposer
          value={searchQuery}
            onChange={setSearchQuery}
            onSend={handleSend}
            onStop={handleStop}
            sending={sending}
          placeholder={t('chatSection.placeholders.outfitDescription')}
        />
      </View>

        {/* Filters Overlay */}
        <FiltersOverlay
          visible={filtersExpanded}
          onClose={() => setFiltersExpanded(false)}
          t={(k) => t(k)}
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
        />
    </View>
    </>
  );
}