import { ParticleLoader } from '@/components/ui/ParticleLoader';
import { TypingEffect } from '@/components/ui/TypingEffect';
import { ImageResult, searchImages } from '@/fetchers/searchImages';
import { useTheme } from '@/providers/themeContext';
import React, { useEffect, useRef, useState } from 'react';

import { Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';

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
      className='flex-1 px-4 py-2 mb-16'
      contentContainerStyle={{ paddingBottom: 10 }}
      showsVerticalScrollIndicator={false}
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

      {messages.map((m) => {
        const cleanContent = getCleanAssistantText(m.content);
        const imageQueries = m.role === 'assistant' ? extractImageDescriptions(m.content) : [];

        // Skip rendering empty assistant bubbles
        if (m.role === 'assistant' && !cleanContent.trim() && imageQueries.length === 0) {
          return null;
        }

        return (
          <View key={m.id} className={`mb-6 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Avatar */}
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

              {/* Message Content */}
              <View className='backdrop-blur-sm px-4 py-3 rounded-2xl' style={{
                backgroundColor: m.role === 'user' ? colors.accent + '26' : colors.surfaceVariant,
                borderColor: m.role === 'user' ? colors.accent + '4D' : colors.border,
                borderWidth: 1,
              }}>
                {m.role === 'assistant' ? (
                  <View>
                    {isStreaming ? (
                      <TypingEffect
                        text={getCleanAssistantText(cleanContent)}
                        speed={18}
                        isStreaming={isStreaming}
                        style={{ color: colors.text, lineHeight: 24 }}
                      />
                    ) : (
                      <View>
                        {/* Headings */}
                        <Text className='text-base font-semibold mb-2' style={{ color: colors.text }}>
                          {(() => {
                            const firstLine = getCleanAssistantText(cleanContent).split('\n')[0] || '';
                            return firstLine.length < 120 ? firstLine : 'Recommendation';
                          })()}
                        </Text>
                        {/* Body with clickable links */}
                        <LinkText text={getCleanAssistantText(cleanContent)} links={extractLinks(getCleanAssistantText(cleanContent))} />
                        {/* Bullet spacing (simple visual gap) */}
                        <View className='mt-2' />
                      </View>
                    )}
                  </View>
                ) : (
                  <LinkText text={cleanContent} links={extractLinks(cleanContent)} />
                )}
              </View>

              {/* Web image gallery (no generation) */}
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
      })}

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
                <View className='w-2 h-2 rounded-full animate-bounce' style={{ backgroundColor: colors.accent }} />
                <View className='w-2 h-2 rounded-full animate-bounce' style={{ backgroundColor: colors.accent }} />
                <View className='w-2 h-2 rounded-full animate-bounce' style={{ backgroundColor: colors.accent }} />
              </View>
              <Text style={{ color: colors.text }}>{t('common.typing') || 'Stylist is thinking…'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};


