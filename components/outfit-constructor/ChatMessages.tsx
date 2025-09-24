import { ParticleLoader } from '@/components/ui/ParticleLoader';
import { TypingEffect } from '@/components/ui/TypingEffect';
import { ImageResult, searchImages } from '@/fetchers/searchImages';
import { useEffect, useRef, useState } from 'react';
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

function WebImageCard({ query, id }: { query: string; id: string }) {
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
        const [first] = await searchImages({ queries: [query] });
        if (first && first?.url) setImg(first); else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, id]);

  if (loading) return (
    <View className='bg-gray-800/30 border border-gray-700 rounded-xl p-3 w-[150px] h-[200px] relative overflow-hidden'>
      <ParticleLoader />
    </View>
  );
  if (error || !img?.url) return (
    <View className='bg-gray-800/30 border border-gray-700 rounded-xl p-3 w-[150px] h-[200px] items-center justify-center'>
      <Text className='text-gray-400 text-xs text-center'>No image</Text>
    </View>
  );
  return (
    <Pressable onPress={() => { if (img?.pageUrl) Linking.openURL(img.pageUrl); }} className='bg-gray-800/30 border border-gray-700 rounded-xl p-3 w-[150px] h-[200px]'>
      <View className='relative'>
        <Image source={{ uri: img.url as string }} className='w-full h-32 rounded-lg mb-2' resizeMode='cover' />
        {!!img?.source && (
          <View className='absolute top-1 right-1 bg-black/60 px-2 py-0.5 rounded-full border border-white/10'>
            <Text className='text-[10px] text-gray-200' numberOfLines={1}>{img.source}</Text>
          </View>
        )}
      </View>
      <Text className='text-gray-300 text-xs text-center' numberOfLines={2}>{query}</Text>
    </Pressable>
  );
}

export const ChatMessages = ({ messages, isStreaming, getCleanAssistantText, t, scrollRef }: ChatMessagesProps) => {
  return (
    <ScrollView 
      ref={scrollRef} 
      className='flex-1 px-4 py-2 mb-16' 
      contentContainerStyle={{ paddingBottom: 10 }}
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 && (
        <View className='flex-1 items-center justify-center py-20'>
          <View className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-sm'>
            <Text className='text-gray-300 text-center text-lg font-medium mb-2'>
              Welcome to your Personal Stylist
            </Text>
            <Text className='text-gray-400 text-center text-sm'>
              Describe your outfit needs and I'll provide professional styling advice with visual references.
            </Text>
          </View>
        </View>
      )}
      
      {messages.map((m) => {
        const cleanContent = getCleanAssistantText(m.content);
        const imageQueries = m.role === 'assistant' ? extractImageDescriptions(m.content) : [];
        
        return (
          <View key={m.id} className={`mb-6 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <View className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Avatar */}
              <View className={`flex-row items-center mb-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <View className={`w-8 h-8 rounded-full ${m.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'} items-center justify-center`}>
                  <Text className='text-white text-sm font-bold'>
                    {m.role === 'user' ? 'U' : 'S'}
                  </Text>
                </View>
                <Text className={`text-gray-400 text-xs ml-2 ${m.role === 'user' ? 'mr-2 ml-0' : 'ml-2'}`}>
                  {m.role === 'user' ? 'You' : 'Stylist'}
                </Text>
              </View>
              
              {/* Message Content */}
              <View className={`${m.role === 'user' ? 'bg-blue-500/20' : 'bg-gray-800/50'} border ${m.role === 'user' ? 'border-blue-500/30' : 'border-gray-700'} backdrop-blur-sm px-4 py-3 rounded-2xl`}>
                {m.role === 'assistant' ? (
                  <TypingEffect 
                    text={getCleanAssistantText(cleanContent)}
                    speed={20}
                    isStreaming={isStreaming}
                    style={{ color: '#F3F4F6', lineHeight: 24 }}
                  />
                ) : (
                  <Text className='text-gray-100 leading-6'>{cleanContent}</Text>
                )}
              </View>
              
              {/* Web image gallery (no generation) */}
              {m.role === 'assistant' && imageQueries.length > 0 && (
                <View className='mt-3 flex-row flex-wrap gap-2'>
                  {imageQueries.map((q, idx) => (
                    <View key={`${m.id}-${idx}`} className='w-[150px]'>
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
            <View className='w-8 h-8 rounded-full bg-purple-500 items-center justify-center'>
              <Text className='text-white text-sm font-bold'>S</Text>
            </View>
            <Text className='text-gray-400 text-xs ml-2'>Stylist</Text>
          </View>
          <View className='bg-gray-800/50 border border-gray-700 backdrop-blur-sm px-4 py-3 rounded-2xl'>
            <View className='flex-row items-center'>
              <View className='flex-row space-x-1 mr-3'>
                <View className='w-2 h-2 bg-purple-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                <View className='w-2 h-2 bg-purple-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                <View className='w-2 h-2 bg-purple-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
              </View>
              <Text className='text-gray-300'>{t('common.typing') || 'Stylist is thinking…'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};


