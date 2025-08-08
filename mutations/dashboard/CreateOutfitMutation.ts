import { OutfitState } from "@/components/dashboard/modals/OutfitCreateModal";
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
      // Wyszukaj elementy z tymczasowymi obrazami (temp://)
      const tempImages = outfitData.outfit_elements_data
        .filter(el => el.imageUrl.startsWith('temp://'))
        .map(el => ({ tempKey: el.imageUrl, uri: (el as any)._localUri || (el as any).uri || el.imageUrl, fileName: 'image.jpg' }));

      // Map tempKey -> localUri (musimy mieć localUri z formularza, więc zakładamy że w OutfItCreateModal ref trzyma pendingImagesRef i podmieni _localUri przed wywołaniem mutacji – jeśli nie, to fallback poniżej nie zadziała w pełni)
      // Upload obrazów jeżeli istnieją
      let replacements: Record<string, string> = {};
      if (tempImages.length) {
        replacements = await uploadImagesAndGetPublicUrls(tempImages, { userId: outfitData.created_by || undefined });
      }

      const finalElements = outfitData.outfit_elements_data.map(el => {
        if (replacements[el.imageUrl]) {
          return { ...el, imageUrl: replacements[el.imageUrl] };
        }
        return el;
      });

      const { data, error } = await supabase
        .from('created-outfits').insert({
          outfit_name: outfitData.outfit_name || null,
          description: outfitData.description || null,
          outfit_tags: outfitData.outfit_tags,
          outfit_elements_data: finalElements,
          created_at: new Date().toISOString(),
          created_by: outfitData.created_by,
        }).select();

      if (error) {
        console.error('Insert outfit error', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['created-outfits']
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
};