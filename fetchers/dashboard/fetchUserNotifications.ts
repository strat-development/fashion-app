import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useFetchNotifications = (userId: string) => {
  return useQuery({
    queryKey: ['followed_accounts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          created_at,
          followed_account,
          is_approved,
          user_id,
          users:users!user_id (user_id, nickname, full_name, user_avatar)
        `)
        .eq('followed_account', userId)
        .eq('is_approved', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};