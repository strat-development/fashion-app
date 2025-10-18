import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const useFetchRecentActivity = (userId: string) => {
  return useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
