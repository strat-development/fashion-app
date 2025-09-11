import { supabase } from '@/lib/supabase';

interface TempImage {
  tempKey: string;
  uri: string;
  fileName: string;
}

export const uploadImagesAndGetPublicUrls = async (
  tempImages: TempImage[],
  options: { userId?: string }
): Promise<Record<string, string>> => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const replacements: Record<string, string> = {};

  for (const image of tempImages) {
    const { uri, tempKey, fileName } = image;

    // Ensure the URI is a valid local file path (not temp://)
    if (!uri || uri.startsWith('temp://')) {
      console.error('Invalid URI for upload:', uri);
      continue;
    }

    // Read the file as a Blob (for web compatibility)
    const response = await fetch(uri);
    const blob = await response.blob();

    const filePath = `${options.userId || 'public'}/${Date.now()}_${fileName}`;

    // Upload the image to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('outfit-images') // Replace with your storage bucket name
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public URL for uploaded image');
    }

    replacements[tempKey] = data.publicUrl;
  }

  return replacements;
};