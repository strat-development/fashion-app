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
