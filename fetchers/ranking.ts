import { supabase } from '@/lib/supabase'

export type OutfitRankItem = {
  outfit_id: string
  created_by: string | null
  outfit_name: string | null
  previewUrl: string | null
  likes: number
  saves: number
  ratings: number
  score: number
}

export type CreatorRankItem = {
  user_id: string
  nickname: string | null
  user_avatar: string | null
  likes: number
  saves: number
  ratings: number
  outfitsCount: number
  score: number
}

const computeScore = (likes: number, saves: number, ratings: number) => likes * 3 + saves * 2 + ratings * 1

function firstImageUrl(elements: any): string | null {
  if (!Array.isArray(elements)) return null
  const urls = (elements as any[]).map((el) => (typeof el === 'string' ? el : el?.imageUrl)).filter(Boolean)
  return (urls[0] as string) || null
}


// Internal: fetch base outfits
async function fetchOutfitsBase(limit = 1000): Promise<any[]> {
  const { data, error } = await ((supabase as any)
    .from('created-outfits')
    .select('outfit_id, created_by, outfit_name, outfit_elements_data')
    .limit(limit))
  if (error) throw error
  return (data || []) as any[]
}

async function countsByOutfit(table: 'liked-outfits' | 'saved-outfits' | 'outfits-rating', outfitIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!outfitIds.length) return map
  // Primary path: read raw relation rows
  const { data, error } = await ((supabase as any)
    .from(table)
    .select('outfit_id')
    .in('outfit_id', outfitIds))
  if (!error && Array.isArray(data)) {
    for (const row of data as any[]) {
      const id = row.outfit_id as string | null
      if (!id) continue
      map.set(id, (map.get(id) || 0) + 1)
    }
    return map
  }

  if (table === 'liked-outfits') {
    const { data: agg } = await ((supabase as any)
      .from('outfit_like_counts')
      .select('outfit_id, likes')
      .in('outfit_id', outfitIds))
    if (Array.isArray(agg)) {
      for (const row of agg as any[]) {
        const id = row.outfit_id as string | null
        const cnt = (row.likes as number) ?? 0
        if (!id) continue
        map.set(id, cnt)
      }
    }
  }
  return map
}

async function countsPositiveRatingsByOutfit(outfitIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!outfitIds.length) return map
  const { data, error } = await ((supabase as any)
    .from('outfits-rating')
    .select('outfit_id, top_rated')
    .in('outfit_id', outfitIds)
    .eq('top_rated', true))
  if (error || !Array.isArray(data)) return map
  for (const row of data as any[]) {
    const id = row.outfit_id as string | null
    if (!id) continue
    map.set(id, (map.get(id) || 0) + 1)
  }
  return map
}

export async function getTopOutfits(limit = 50): Promise<OutfitRankItem[]> {
  const rows = await fetchOutfitsBase(limit)
  const ids = rows.map((r: any) => r.outfit_id).filter(Boolean) as string[]
  const [likesMap, savesMap, ratingsMap] = await Promise.all([
  countsPositiveRatingsByOutfit(ids),
    countsByOutfit('saved-outfits', ids),
    countsByOutfit('outfits-rating', ids),
  ])

  const items: OutfitRankItem[] = (rows || []).map((row: any) => {
    const id = row.outfit_id as string
    const likes = likesMap.get(id) || 0
    const saves = savesMap.get(id) || 0
    const ratings = ratingsMap.get(id) || 0
    return {
      outfit_id: id,
      created_by: row.created_by ?? null,
      outfit_name: row.outfit_name ?? null,
      previewUrl: firstImageUrl(row.outfit_elements_data),
      likes,
      saves,
      ratings,
      score: computeScore(likes, saves, ratings),
    }
  })

  items.sort((a, b) => (b.score - a.score) || (b.likes - a.likes))
  return items
}

export async function getTopCreators(limit = 50): Promise<CreatorRankItem[]> {
  const rows = await fetchOutfitsBase(1000)
  const ids = rows.map((r: any) => r.outfit_id).filter(Boolean) as string[]
  const [likesMap, savesMap, ratingsMap] = await Promise.all([
  countsPositiveRatingsByOutfit(ids),
    countsByOutfit('saved-outfits', ids),
    countsByOutfit('outfits-rating', ids),
  ])

  const byCreator = new Map<string, Omit<CreatorRankItem, 'user_id' | 'nickname' | 'user_avatar'>>()
  const creatorIds = new Set<string>()

  for (const row of (rows || []) as any[]) {
    const userId = (row.created_by ?? null) as string | null
    if (!userId) continue
    creatorIds.add(userId)
    const id = row.outfit_id as string
    const likes = likesMap.get(id) || 0
    const saves = savesMap.get(id) || 0
    const ratings = ratingsMap.get(id) || 0
    const prev = byCreator.get(userId) || { likes: 0, saves: 0, ratings: 0, outfitsCount: 0, score: 0 }
    const newLikes = prev.likes + likes
    const newSaves = prev.saves + saves
    const newRatings = prev.ratings + ratings
    byCreator.set(userId, {
      likes: newLikes,
      saves: newSaves,
      ratings: newRatings,
      outfitsCount: prev.outfitsCount + 1,
      score: computeScore(newLikes, newSaves, newRatings),
    })
  }

  let profiles: Record<string, { nickname: string | null, user_avatar: string | null }> = {}
  if (creatorIds.size) {
    const ids = Array.from(creatorIds)
    const { data: usersData } = await supabase
      .from('users')
      .select('user_id, nickname, user_avatar')
      .in('user_id', ids)

    profiles = (usersData || []).reduce((acc: any, u: any) => {
      acc[u.user_id] = { nickname: u.nickname ?? null, user_avatar: u.user_avatar ?? null }
      return acc
    }, {})
  }

  const list: CreatorRankItem[] = Array.from(byCreator.entries()).map(([user_id, agg]) => ({
    user_id,
    nickname: profiles[user_id]?.nickname ?? null,
    user_avatar: profiles[user_id]?.user_avatar ?? null,
    likes: agg.likes,
    saves: agg.saves,
    ratings: agg.ratings,
    outfitsCount: agg.outfitsCount,
    score: agg.score,
  }))

  list.sort((a, b) => (b.score - a.score) || (b.likes - a.likes))
  return list.slice(0, limit)
}
