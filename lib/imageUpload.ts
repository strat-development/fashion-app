import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface LocalImageDescriptor {
  tempKey: string; 
  uri: string;
  fileName?: string; 
  type?: string; 
}

const BUCKET = process.env.EXPO_PUBLIC_SUPABASE_OUTFIT_BUCKET || 'outfit-elements';

function guessExtension(mime?: string, fileName?: string) {
  if (fileName && fileName.includes('.')) return fileName.split('.').pop();
  if (!mime) return 'jpg';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadImagesAndGetPublicUrls(images: LocalImageDescriptor[], opts?: { userId?: string }) {
  const results: Record<string, string> = {};
  for (const img of images) {
    try {
      const fileExt = guessExtension(img.type, img.fileName);
      const folder = opts?.userId ? `${opts.userId}` : 'public';
      const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      if (!BUCKET) {
        throw new Error('Brak nazwy bucketa do uploadu');
      }

      if (Platform.OS === 'web') {
        const resp = await fetch(img.uri);
        if (!resp.ok) throw new Error(`Fetch blob failed: ${resp.status}`);
        const blob = await resp.blob();
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
          contentType: blob.type || img.type || 'image/jpeg',
          upsert: false,
        });
        if (uploadError) {
          if ((uploadError as any)?.message?.includes('Bucket not found')) {
            console.error('Bucket not found. Upewnij się że bucket "' + BUCKET + '" istnieje w Supabase Storage.');
          }
          throw uploadError;
        }
      } else {
        const base64 = await FileSystem.readAsStringAsync(img.uri.replace('file://', ''), { encoding: FileSystem.EncodingType.Base64 }).catch(async () => {
          return await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
        });
        const bytes = Buffer.from(base64, 'base64');
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, bytes, {
          contentType: img.type || 'image/jpeg',
          upsert: false,
        });
        if (uploadError) {
          if ((uploadError as any)?.message?.includes('Bucket not found')) {
            console.error('Bucket not found. Upewnij się że bucket "' + BUCKET + '" istnieje w Supabase Storage.');
          }
          throw uploadError;
        }
      }

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      results[img.tempKey] = publicUrlData.publicUrl;
    } catch (e) {
      console.error('Upload image failed', img.tempKey, e);
      throw e;
    }
  }
  return results;
}
