import { ThemedView } from '@/components/ThemedView';
import { CreatorRankItem, getTopCreators, getTopOutfits, OutfitRankItem } from '@/fetchers/ranking';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Trophy, User2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';

export default function RankingScreen() {
  const [tab, setTab] = useState<'outfits' | 'creators'>('outfits')
  const router = useRouter()

  const {
    data: outfits,
    isLoading: loadingOutfits,
    error: errorOutfits,
    refetch: refetchOutfits,
  } = useQuery<OutfitRankItem[]>({ queryKey: ['ranking', 'outfits'], queryFn: () => getTopOutfits(50) })

  const {
    data: creators,
    isLoading: loadingCreators,
    error: errorCreators,
    refetch: refetchCreators,
  } = useQuery<CreatorRankItem[]>({ queryKey: ['ranking', 'creators'], queryFn: () => getTopCreators(50) })

  const loading = tab === 'outfits' ? loadingOutfits : loadingCreators
  const error = tab === 'outfits' ? errorOutfits : errorCreators
  const list = useMemo(() => (tab === 'outfits' ? (outfits ?? []) : (creators ?? [])), [tab, outfits, creators])

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
  <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Ranking</Text>
          <Text style={{ color: '#9CA3AF', marginTop: 4 }}>Top outfits and creators</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#1f1f1fcc', borderColor: '#2a2a2a', borderWidth: 1, borderRadius: 999, padding: 4 }}>
            {(['outfits', 'creators'] as const).map((key) => {
              const active = tab === key
              return (
                <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={active ? ['#7e22ce', '#db2777'] : ['#00000000', '#00000000']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 10, borderRadius: 999 }}
                  >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: active ? '#fff' : '#9CA3AF', fontWeight: '600' }}>
                        {key === 'outfits' ? 'Outfits' : 'Creators'}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              )
            })}
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Loading {tab}…</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Failed to load {tab}.</Text>
            <Pressable onPress={() => (tab === 'outfits' ? refetchOutfits() : refetchCreators())} style={{ marginTop: 10 }}>
              <LinearGradient colors={[ '#7e22ce', '#db2777' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Try again</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={list as any[]}
            keyExtractor={(item, index) => ('outfit_id' in item ? (item as OutfitRankItem).outfit_id : (item as CreatorRankItem).user_id) ?? String(index)}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item, index }) => (
              <RankRow
                index={index}
                tab={tab}
                item={item as any}
                onPress={() => {
                  if (tab === 'outfits') {
                    const id = (item as OutfitRankItem).outfit_id
                    if (id) router.push(`/outfit/${id}`)
                  } else {
                    const id = (item as CreatorRankItem).user_id
                    if (id) router.push(`/userProfile/${id}`)
                  }
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function RankRow({ index, tab, item, onPress }: { index: number; tab: 'outfits' | 'creators'; item: OutfitRankItem | CreatorRankItem; onPress: () => void }) {
  const crownColor = index === 0 ? '#FDE047' : index === 1 ? '#9CA3AF' : index === 2 ? '#D97706' : '#6B7280'
  const isOutfit = tab === 'outfits'
  const title = isOutfit ? (item as OutfitRankItem).outfit_name ?? 'Untitled outfit' : (item as CreatorRankItem).nickname ?? 'Unknown'
  const sub = isOutfit
    ? `${(item as OutfitRankItem).likes} likes · ${(item as OutfitRankItem).saves} saves · ${(item as OutfitRankItem).ratings} ratings`
    : `${(item as CreatorRankItem).outfitsCount} outfits · ${(item as CreatorRankItem).likes} likes`

  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1fcc', borderColor: '#2a2a2a', borderWidth: 1, borderRadius: 16, padding: 12 }}>
      <View style={{ width: 40, alignItems: 'center' }}>
        <Trophy size={20} color={crownColor} />
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>#{index + 1}</Text>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' }}>
        {isOutfit ? (
          (item as OutfitRankItem).previewUrl ? (
            <Image source={{ uri: (item as OutfitRankItem).previewUrl! }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <LinearGradient colors={['#7e22ce', '#db2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
          )
        ) : (
          (item as CreatorRankItem).user_avatar ? (
            <Image source={{ uri: (item as CreatorRankItem).user_avatar! }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <User2 size={20} color="#9CA3AF" />
          )
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '600' }} numberOfLines={1}>{title}</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12 }} numberOfLines={1}>{sub}</Text>
      </View>
      <View>
        <LinearGradient colors={[ '#7e22ce', '#db2777' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{(item as any).score}</Text>
        </LinearGradient>
      </View>
    </Pressable>
  )
}
