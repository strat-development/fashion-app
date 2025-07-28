import { OutfitState } from "@/components/dashboard/modals/OutfitCreateModal";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateOutfitMutation = (
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfitData: OutfitState) => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      const { data, error } = await supabase.from('created-outfits').insert({
        outfit_name: outfitData.outfit_name || null,
        description: outfitData.description || null,
        outfit_tags: outfitData.outfit_tags,
        outfit_elements_data: outfitData.outfit_elements_data,
        created_at: new Date().toISOString(),
        created_by: outfitData.created_by,
      }).select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['created-outfits']
      });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
};