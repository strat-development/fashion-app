import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchIsFollowed = (userId: string, followedAccountId: string) => {
  return useQuery({
    queryKey: ['followers', userId, followedAccountId],
    queryFn: async () => {
      if (!userId || !followedAccountId) {
        return { isFollowed: false, isPending: false };
      }

      const { data, error } = await supabase
        .from('followers')
        .select('is_approved')
        .eq('followed_account', followedAccountId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { isFollowed: false, isPending: false };
      }

      if (data.is_approved) {
        return { isFollowed: true, isPending: false };
      }

      return { isFollowed: false, isPending: true };
    },
    enabled: !!userId && !!followedAccountId,
  });
};

export type PendingFollower = {
  user_id: string;
  followed_account: string;
  is_approved: boolean | null;
  created_at?: string;
};

export const useFetchPendingFollowers = (followedAccountId: string) => {
  return useQuery({
    queryKey: ['pending-followers', followedAccountId],
    queryFn: async () => {
      if (!followedAccountId) return [] as PendingFollower[];

      const { data, error } = await supabase
        .from('followers')
        .select('user_id, followed_account, is_approved, created_at')
        .eq('followed_account', followedAccountId)
        .eq('is_approved', false);

      if (error) throw error;
      return (data as PendingFollower[]) || [];
    },
    enabled: !!followedAccountId,
  });
};

export type PendingFollowerDetailed = PendingFollower & {
  nickname?: string | null;
  user_avatar?: string | null;
};

export const useFetchPendingFollowersDetailed = (followedAccountId: string) => {
  return useQuery({
    queryKey: ['pending-followers-detailed', followedAccountId],
    queryFn: async () => {
      if (!followedAccountId) return [] as PendingFollowerDetailed[];

      const { data: followers, error: followersError } = await supabase
        .from('followers')
        .select('user_id, followed_account, is_approved, created_at')
        .eq('followed_account', followedAccountId)
        .eq('is_approved', false);

      if (followersError) throw followersError;
      const pending = (followers as PendingFollower[]) || [];
      if (pending.length === 0) return [] as PendingFollowerDetailed[];

      const userIds = pending.map((p) => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('user_id, nickname, user_avatar')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      const profileIndex: Record<string, { user_id: string; nickname?: string | null; user_avatar?: string | null }> = {};
      (profiles || []).forEach((p: any) => {
        profileIndex[p.user_id] = { user_id: p.user_id, nickname: p.nickname ?? null, user_avatar: p.user_avatar ?? null };
      });

      return pending.map((p) => ({
        ...p,
        nickname: profileIndex[p.user_id]?.nickname ?? null,
        user_avatar: profileIndex[p.user_id]?.user_avatar ?? null,
      }));
    },
    enabled: !!followedAccountId,
  });
};