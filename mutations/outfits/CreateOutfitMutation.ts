import { OutfitState } from "@/components/modals/OutfitCreateModal";
import { uploadImagesAndGetPublicUrls } from "@/lib/imageUpload";
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

      // Mapping of temp images, ensuring _localUri is being used
      const tempImages = outfitData.outfit_elements_data
        .filter((el) => el.imageUrl.startsWith('temp://'))
        .map((el) => ({
          tempKey: el.imageUrl,
          uri: (el as any)._localUri || el.imageUrl,
          fileName: (el as any)._fileName || 'image.jpg',
          type: (el as any)._type,
        }));

      let replacements: Record<string, string> = {};
      if (tempImages.length) {
        replacements = await uploadImagesAndGetPublicUrls(tempImages, {
          userId: outfitData.created_by || undefined,
        });
      }

      // Replacing temp:// URLs with public URLs
      const finalElements = outfitData.outfit_elements_data.map((el) => {
        if (replacements[el.imageUrl]) {
          return { ...el, imageUrl: replacements[el.imageUrl] };
        }
        return el;
      });

      const { data, error } = await supabase
        .from('created-outfits')
        .insert({
          outfit_name: outfitData.outfit_name || null,
          description: outfitData.description || null,
          outfit_tags: outfitData.outfit_tags,
          outfit_elements_data: finalElements,
          created_at: new Date().toISOString(),
          created_by: outfitData.created_by,
        })
        .select();

      if (error) {
        console.error('Insert outfit error', error);
        throw error;
      }

      if (data && data.length > 0 && outfitData.created_by) {
        const outfitId = data[0].outfit_id;
        await supabase.from('activities').insert({
          user_id: outfitData.created_by,
          activity_type: 'created_post',
          outfit_id: outfitId,
          created_at: new Date().toISOString(),
        });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['created-outfits', variables.created_by],
      });
      queryClient.refetchQueries({
        queryKey: ['created-outfits', variables.created_by],
      });
      queryClient.invalidateQueries({
        queryKey: ['userStatistics', variables.created_by],
      });
      queryClient.invalidateQueries({
        queryKey: ['recent-activity', variables.created_by],
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
};