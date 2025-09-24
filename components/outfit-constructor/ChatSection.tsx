import { Button, ButtonText } from '@/components/ui/button';
import { webSearch } from '@/fetchers/webSearch';
import { openAiClient } from '@/lib/openAiClient';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/providers/userContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChatComposer } from './ChatComposer';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatSwitch } from './ChatSwitch';
import { FiltersOverlay } from './FiltersOverlay';

export const ChatSection = () => {
  const { t } = useTranslation();
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

  function getCleanAssistantText(text: string) {
    let cleaned = text.replace(/```[\s\S]*?```/g, '').trim();
    cleaned = cleaned.replace(/^#+\s*(Summary|Items?)\s*$/gim, '').trim();

    cleaned = cleaned.replace(/\[IMAGE:\s*([^\]]+)\]/gi, '$1');

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }

  const effectiveCurrency = useMemo(() => currency || preferredCurrency || 'USD', [currency, preferredCurrency]);

  function buildSystemPrompt() {
    const gender = outfitGender.filter(Boolean).join(', ');
    const styles = outfitTag.filter(Boolean).join(', ');
    const colors = outfitColor.filter(Boolean).join(', ');
    const elements = outfitElement.filter(Boolean).join(', ');
    const fit = outfitFit.filter(Boolean).join(', ');

    return [
      `You are a professional fashion stylist and image consultant.`,
      `User language: ${preferredLanguage || 'en'}. Always respond in this language.`,
      gender && `Target audience: ${gender}.`,
      styles && `Style preferences: ${styles}.`,
      fit && `Fit preferences: ${fit}.`,
      colors && `Color palette: ${colors}.`,
      elements && `Key elements to include: ${elements}.`,
      (lowestPrice || highestPrice) && `Budget range: ${lowestPrice || 0} to ${highestPrice || '∞'} ${effectiveCurrency}.`,
      `Provide professional styling advice with these components:`,
      `1. A brief outfit concept and overall styling philosophy`,
      `2. Detailed breakdown of each clothing item with styling tips`,
      `3. Color coordination advice and why these combinations work`,
      `4. Accessory suggestions and finishing touches`,
      `5. Occasion-appropriate styling notes`,
      `6. Provide concise, readable tips without extra JSON or code blocks.`,
      `For each clothing item you recommend, append a bracketed marker like [IMAGE: concise search query] that captures the item (brand-neutral). Keep it short and specific (e.g., "white canvas slip-on sneakers minimal" or "beige linen shorts tailored").`,
      `End with a short section titled "Helpful links" listing 3-6 reputable brand or style-guide URLs relevant to your advice. Use real URLs from major retailers like Amazon, ASOS, Uniqlo, Zara, Nike, Adidas, H&M, etc. Format as: Brand Name - https://real-url.com.`,
      `Focus on timeless principles, versatility, and helping users understand the "why" behind each choice.`,
      `Be encouraging and educational in your tone.`,
      `Do not explain the [IMAGE: ...] markers; they are for internal use and will not be shown to the user.`,
    ].filter(Boolean).join(' ');
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
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userText },
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        stream: false,
        signal: (abortRef.current as any)?.signal,
      });

      const preChoice = pre.choices?.[0];
      const toolCalls = preChoice?.message?.tool_calls as Array<any> | undefined;

      // Build the message list we'll stream from
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
            // Append assistant tool-call and tool result
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
        // If the model already produced a direct answer in pre-pass, include it as context
        workingMessages.push({ role: 'assistant', content: preChoice.message.content });
      }

      // 2) Final streaming answer with tool results in context (if any)
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const finalStream = await (openAiClient as any).chat.completions.create({
        model: 'gpt-4o',
        messages: workingMessages,
        temperature: 0.7,
        stream: true,
        signal: (abortRef.current as any)?.signal,
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
    // Subscribe to realtime message inserts for this conversation (if configured)
    const channel = (supabase as any)
      .channel(`ai_messages_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        const { role, content, id, created_at } = payload.new || {};
        setMessages((prev) => {
          // Skip if we already have an assistant placeholder being filled locally
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


      <View className='flex-1 bg-gray-900'>
        <ChatSwitch />
        {/* Header Section - Fixed at top */}
        <View className='bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-4 py-3 z-10'>

          <View className='mt-3'>
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
        </View>

        {/* Conversations List - Overlay */}
        {conversationList.length > 0 && (
          <View className='absolute inset-0 z-50'>
            <Pressable className='absolute inset-0 bg-black/40' onPress={() => setConversationList([])} />
            <View className='absolute top-32 left-4 right-4 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-2xl p-4 shadow-2xl'>
              <Text className='text-white text-sm font-medium mb-3'>Recent Conversations</Text>
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
                  <ButtonText className='text-gray-300 text-left'>{c.title || c.id}</ButtonText>
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
        <View className='absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-4 py-3 z-20' style={{ paddingBottom: 34 }}>
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