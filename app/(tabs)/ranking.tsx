import { ThemedView } from '@/components/ThemedView';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { CreatorRankItem, getTopCreators, getTopOutfits, OutfitRankItem } from '@/fetchers/ranking';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Trophy, User2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'outfits' | 'creators'>('outfits');
  const router = useRouter();
  const { colors } = useTheme();

  const {
    data: outfits,
    isLoading: loadingOutfits,
    error: errorOutfits,
    refetch: refetchOutfits,
  } = useQuery<OutfitRankItem[]>({ queryKey: ['ranking', 'outfits'], queryFn: () => getTopOutfits(50) });

  const {
    data: creators,
    isLoading: loadingCreators,
    error: errorCreators,
    refetch: refetchCreators,
  } = useQuery<CreatorRankItem[]>({ queryKey: ['ranking', 'creators'], queryFn: () => getTopCreators(50) });

  const loading = tab === 'outfits' ? loadingOutfits : loadingCreators;
  const error = tab === 'outfits' ? errorOutfits : errorCreators;
  const list = useMemo(() => (tab === 'outfits' ? (outfits ?? []) : (creators ?? [])), [tab, outfits, creators]);

  return (
    <ThemedView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, marginTop: -32 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{t('rankingScreen.title')}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{t('rankingScreen.subtitle')}</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderColor: colors.border, borderWidth: 1, borderRadius: 999, padding: 4 }}>
            {(['outfits', 'creators'] as const).map((key) => {
              const active = tab === key;
              return (
                <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }}>
                  <ThemedGradient
                    active={active}
                    style={{ paddingVertical: 10, borderRadius: 999 }}
                  >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: active ? colors.white : colors.textMuted, fontWeight: '600' }}>
                        {t(`rankingScreen.tabs.${key}`)}
                      </Text>
                    </View>
                  </ThemedGradient>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading ? (
          <FullScreenLoader message={t('rankingScreen.loading', { tab: t(`rankingScreen.tabs.${tab}`) })} />
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Text style={{ color: colors.error, fontWeight: '600' }}>
              {t('rankingScreen.error', { tab: t(`rankingScreen.tabs.${tab}`) })}
            </Text>
            <Pressable onPress={() => (tab === 'outfits' ? refetchOutfits() : refetchCreators())} style={{ marginTop: 10 }}>
              <ThemedGradient style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                <Text style={{ color: colors.white, fontWeight: '600' }}>{t('rankingScreen.tryAgain')}</Text>
              </ThemedGradient>
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
                    router.push(`/outfit/${(item as OutfitRankItem).outfit_id}`);
                  } else {
                    router.push(`/userProfile/${(item as CreatorRankItem).user_id}`);
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const crownColor = index === 0 ? '#FDE047' : index === 1 ? '#9CA3AF' : index === 2 ? '#D97706' : '#6B7280';
  const isOutfit = tab === 'outfits';
  const title = isOutfit
    ? (item as OutfitRankItem).outfit_name ?? t('rankingScreen.rankRow.untitledOutfit')
    : (item as CreatorRankItem).nickname ?? t('rankingScreen.rankRow.unknownCreator');

  const outfitStatsLabels = t('rankingScreen.rankRow.outfitStats').split(' · ');
  const creatorStatsLabels = t('rankingScreen.rankRow.creatorStats').split(' · ');

  const stats = isOutfit
    ? [
      { label: outfitStatsLabels[0], value: (item as OutfitRankItem).likes },
      { label: outfitStatsLabels[1], value: (item as OutfitRankItem).saves },
      { label: outfitStatsLabels[2], value: (item as OutfitRankItem).ratings },
    ]
    : [
      { label: creatorStatsLabels[0], value: (item as CreatorRankItem).outfitsCount },
      { label: creatorStatsLabels[1], value: (item as CreatorRankItem).likes },
    ];

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <View style={{ width: 40, alignItems: 'center' }}>
        <Trophy size={20} color={crownColor} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
           {t('rankingScreen.rankRow.rank')}{index + 1} 
        </Text>
      </View>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.surfaceVariant,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {isOutfit ? (
          (item as OutfitRankItem).previewUrl ? (
            <Image source={{ uri: (item as OutfitRankItem).previewUrl! }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <ThemedGradient style={{ flex: 1 }} />
          )
        ) : (
          (item as CreatorRankItem).user_avatar ? (
            <Image source={{ uri: (item as CreatorRankItem).user_avatar! }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <User2 size={20} color={colors.textMuted} />
          )
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {stats.map((stat, idx) => (
            <Text key={idx} style={{ color: colors.textMuted, fontSize: 12, marginRight: 8 }}>
              {stat.value} {stat.label}
            </Text>
          ))}
        </View>
      </View>
      <View>
        <ThemedGradient style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: colors.white, fontWeight: '700' }}>{(item as any).score}</Text>
        </ThemedGradient>
      </View>
    </Pressable>
  );
}