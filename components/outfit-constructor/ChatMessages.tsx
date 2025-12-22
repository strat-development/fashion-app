import { ParticleLoader } from '@/components/ui/ParticleLoader';
import { TypingEffect } from '@/components/ui/TypingEffect';
import { ImageResult, searchImages } from '@/fetchers/searchImages';
import { useTheme } from '@/providers/themeContext';
import React, { useEffect, useRef, useState } from 'react';

import { Image, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

type ChatMessagesProps = {
  messages: Message[];
  isStreaming: boolean;
  getCleanAssistantText: (text: string) => string;
  t: (k: string) => string;
  scrollRef: React.MutableRefObject<ScrollView | null>;
};

function extractImageDescriptions(raw: string): string[] {
  const matches = raw.match(/\[IMAGE:\s*([^\]]+)\]/gi);

  return matches ? matches.map(m => m.replace(/\[IMAGE:\s*|\]/gi, '').trim()) : [];
}

function extractLinks(text: string): { text: string; url: string; start: number; end: number }[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links: { text: string; url: string; start: number; end: number }[] = [];
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[1],
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return links;
}

function LinkText({ text, links }: { text: string; links: { text: string; url: string; start: number; end: number }[] }) {
  const { colors } = useTheme();
  
  if (links.length === 0) {
    return <Text style={{ color: colors.text, lineHeight: 22 }}>{text}</Text>;
  }

  const parts: { text: string; isLink: boolean; url?: string }[] = [];
  let lastIndex = 0;

  links.forEach((link) => {
    if (link.start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, link.start), isLink: false });
    }
    parts.push({ text: link.text, isLink: true, url: link.url });
    
    lastIndex = link.end;
  });

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isLink: false });
  }

  return (
    <Text style={{ color: colors.text, lineHeight: 22 }}>
      {parts.map((part, index) =>
        part.isLink ? (
          <Text
            key={index}
            style={{ color: colors.accent, textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(part.url!)}
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index} style={{ color: colors.text }}>{part.text}</Text>
        )
      )}
    </Text>
  );
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'kv'; items: { key: string; value: string }[] }
  | { type: 'quote'; text: string };

function parseBlocks(raw: string): Block[] {
  const lines = (raw || '').split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  const isList = (s: string) => /^\s*([-*]|\d+[.)])\s+/.test(s);
  const isKV = (s: string) => /^\s*[A-Z][A-Za-z0-9\s]+:\s+.+$/.test(s);
  const isQuote = (s: string) => /^\s*>\s+/.test(s);
  const isH1 = (s: string) => /^\s*#\s+/.test(s);
  const isH2 = (s: string) => /^\s*##\s+/.test(s);
  const isH3 = (s: string) => /^\s*###\s+/.test(s);

  while (i < lines.length) {
    
    const line = lines[i];
    
    if (!line.trim()) { i++; continue; }

    if (isH1(line) || isH2(line) || isH3(line)) {
      const level = isH1(line) ? 1 : isH2(line) ? 2 : 3;
      const text = line.replace(/^\s*#{1,3}\s+/, '').trim();
      blocks.push({ type: 'heading', level, text });
      i++; continue;
    }

    if (isList(line)) {
     
      const items: string[] = [];
     
      while (i < lines.length && isList(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, '').trim());
        i++;
      }
      
      const ordered = /^\s*\d+[.)]/.test(line);
      
      blocks.push({ type: 'list', ordered, items });
      
      continue;
    }

    if (isKV(line)) {
      const items: { key: string; value: string }[] = [];
      
      while (i < lines.length && isKV(lines[i])) {
        const m = lines[i].match(/^(\s*[A-Z][A-Za-z0-9\s]+):\s+(.+)$/);
      
        if (m) { items.push({ key: m[1].trim(), value: m[2].trim() }); }
      
        i++;
      }
      
      if (items.length) { blocks.push({ type: 'kv', items }); }
      
      continue;
    }

    if (isQuote(line)) {
      const parts: string[] = [];

      while (i < lines.length && isQuote(lines[i])) {
        parts.push(lines[i].replace(/^\s*>\s+/, ''));
        i++;
      }

      blocks.push({ type: 'quote', text: parts.join('\n') });
      
      continue;
    }

    const para: string[] = [line];
    
    i++;
    
    while (i < lines.length && lines[i].trim() && !isList(lines[i]) && !isKV(lines[i]) && !isQuote(lines[i]) && !isH1(lines[i]) && !isH2(lines[i]) && !isH3(lines[i])) {
      para.push(lines[i]); i++;
    }
    
    blocks.push({ type: 'paragraph', text: para.join(' ') });
  }

  return blocks;
}

function RichMessage({ text }: { text: string }) {
  const { colors } = useTheme();
  const blocks = parseBlocks(text);

  return (
    <View>
      {blocks.map((b, idx) => {
        if (b.type === 'heading') {
          const size = b.level === 1 ? 16 : b.level === 2 ? 15 : 14;
          const weight = b.level === 1 ? '700' as const : '600' as const;
          
          return (
            <Text key={idx} style={{ color: colors.text, fontSize: size, fontWeight: weight, marginBottom: 6 }}>
              {b.text}
            </Text>
          );
        }
        if (b.type === 'paragraph') {
          const links = extractLinks(b.text);
          
          return (
            <View key={idx} style={{ marginBottom: 8 }}>
              <LinkText text={b.text} links={links} />
            </View>
          );
        }
        
        if (b.type === 'list') {
          return (
            <View key={idx} style={{ marginVertical: 6, paddingLeft: 8 }}>
              {b.items.map((it, i2) => (
                <View key={i2} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text style={{ color: colors.textMuted, marginRight: 6 }}>{b.ordered ? `${i2 + 1}.` : '•'}</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, flex: 1 }}>{it}</Text>
                </View>
              ))}
            </View>
          );
        }
        
        if (b.type === 'kv') {
          return (
            <View key={idx} style={{ marginVertical: 6 }}>
              {b.items.map((pair, i2) => (
                <View key={i2} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '600', width: 110 }}>{pair.key}</Text>
                  <Text style={{ color: colors.text, flex: 1 }}>{pair.value}</Text>
                </View>
              ))}
            </View>
          );
        }
        
        if (b.type === 'quote') {
          return (
            <View key={idx} style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 10, marginVertical: 8 }}>
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>{b.text}</Text>
            </View>
          );
        }
        
        return null;
      })}
    </View>
  );
}

function WebImageCard({ query, id }: { query: string; id: string }) {
  const { colors } = useTheme();
  const [img, setImg] = useState<ImageResult>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    
    started.current = true;
    
    (async () => {
      try {
        setLoading(true);
        
        const results = await searchImages({ queries: [query] });
        const firstValid = (results || []).find((r) => r && (r as any).url);
        
        if (firstValid && (firstValid as any).url) setImg(firstValid); else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, id]);

  if (loading) return (
    <View style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }} className='rounded-xl p-3 w-[180px] h-[240px] relative overflow-hidden'>
      <ParticleLoader />
    </View>
  );
  
  if (error || !img?.url) return (
    <View style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }} className='rounded-xl p-3 w-[180px] h-[240px] items-center justify-center'>
      <Text style={{ color: colors.textMuted }} className='text-xs text-center'>No image found</Text>
    </View>
  );
  
  return (
    <Pressable
      onPress={() => { if (img?.pageUrl) Linking.openURL(img.pageUrl); }}
      className='rounded-xl p-3 w-[180px] h-[240px]'
      style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}
    >
      <View className='relative flex-1'>
        <Image
          source={{ uri: img.url as string }}
          className='w-full h-36 rounded-lg mb-2'
          resizeMode='cover'
        />
        {!!img?.source && (
          <View style={{ backgroundColor: colors.black + 'b3', borderColor: colors.white + '33', borderWidth: 1 }} className='absolute top-1 right-1 px-2 py-1 rounded-full'>
            <Text className='text-[10px] font-medium' style={{ color: colors.white }} numberOfLines={1}>{img.source}</Text>
          </View>
        )}
      </View>

      <View className='flex-1 justify-between'>
        <Text className='text-xs font-medium mb-1' style={{ color: colors.text }} numberOfLines={2}>
          {img?.title || query}
        </Text>

        {img?.pageUrl && (
          <View className='flex-row items-center justify-between'>
            <Text className='text-[10px] font-medium' style={{ color: colors.accent }} numberOfLines={1}>View Product</Text>
            <Text className='text-[10px]' style={{ color: colors.textMuted }}>→</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const ChatMessages = ({ messages, isStreaming, getCleanAssistantText, t, scrollRef }: ChatMessagesProps) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      ref={scrollRef}
      className='flex-1 px-4 py-2'
      contentContainerStyle={{ paddingBottom: 10 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
    >
      {messages.length === 0 && (
        <View className='flex-1 items-center justify-center py-20'>
          <View className='rounded-2xl p-8 max-w-sm overflow-hidden' >
            <Text className='text-center text-lg font-medium mb-2' style={{ color: colors.text }}>
              Welcome to your Personal Stylist
            </Text>
            <Text className='text-center text-sm' style={{ color: colors.textMuted }}>
              Describe your outfit needs and I&apos;ll provide professional styling advice with visual references.
            </Text>
          </View>
        </View>
      )}

      {(() => {
        const lastAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant');
        const lastAssistantId = lastAssistant?.id;
        return messages.map((m) => {
        const cleanContent = getCleanAssistantText(m.content);
        const imageQueries = m.role === 'assistant' ? extractImageDescriptions(m.content) : [];
        const displayText = (cleanContent && cleanContent.trim().length > 0) ? cleanContent : (m.content || '');
          const shouldAnimate = isStreaming && m.role === 'assistant' && m.id === lastAssistantId;

        return (
          <View key={m.id} className={`mb-6 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
             
              <View className={`flex-row items-center mb-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <View className={`w-8 h-8 rounded-full ${m.role === 'user' ? '' : ''} items-center justify-center`} style={{ backgroundColor: m.role === 'user' ? colors.accent : colors.secondary }}>
                  <Text className='text-sm font-bold' style={{ color: colors.white }}>
                    {m.role === 'user' ? 'U' : 'S'}
                  </Text>
                </View>
                <Text className={`text-xs ml-2 ${m.role === 'user' ? 'mr-2 ml-0' : 'ml-2'}`} style={{ color: colors.textMuted }}>
                  {m.role === 'user' ? 'You' : 'Stylist'}
                </Text>
              </View>

              <View className='backdrop-blur-sm px-4 py-3 rounded-2xl' style={{
                backgroundColor: m.role === 'user' ? colors.accent + '26' : colors.surfaceVariant,
                borderColor: m.role === 'user' ? colors.accent + '4D' : colors.border,
                borderWidth: 1,
              }}>
                  {m.role === 'assistant'
                    ? shouldAnimate
                      ? (
                        <TypingEffect
                          text={displayText}
                          speed={18}
                          isStreaming={true}
                          style={{ color: colors.text, lineHeight: 24 }}
                        />
                      ) : (
                        <RichMessage text={displayText} />
                      )
                    : (
                      <LinkText text={cleanContent} links={extractLinks(cleanContent)} />
                    )}
              </View>

              {m.role === 'assistant' && imageQueries.length > 0 && (
                <View className='mt-3 flex-row flex-wrap gap-3'>
                  {imageQueries.map((q, idx) => (
                    <View key={`${m.id}-${idx}`} className='w-[180px]'>
                      <WebImageCard query={q} id={`${m.id}-${idx}`} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
        });
      })()}

      {isStreaming && (
        <View className='items-start mb-6'>
          <View className='flex-row items-center mb-2'>
            <View className='w-8 h-8 rounded-full items-center justify-center' style={{ backgroundColor: colors.secondary }}>
              <Text className='text-sm font-bold' style={{ color: colors.white }}>S</Text>
            </View>
            <Text className='text-xs ml-2' style={{ color: colors.textMuted }}>Stylist</Text>
          </View>
          <View className='backdrop-blur-sm px-4 py-3 rounded-2xl' style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1 }}>
            <View className='flex-row items-center'>
              <View className='flex-row space-x-1 mr-3'>
                <View className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
                <View className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
                <View className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
              </View>
              <Text style={{ color: colors.text }}>{t('common.typing') || 'Stylist is thinking…'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};


