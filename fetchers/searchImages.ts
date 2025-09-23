export type ImageResult = { url: string; title?: string; source?: string; pageUrl?: string } | null;

type RequestBody = {
  queries: string[];
  gl?: string;
  hl?: string;
};

import { buildApiUrl } from '@/utils/api';

export async function searchImages(body: RequestBody): Promise<ImageResult[]> {
  const apiUrl = buildApiUrl('/api/image-search');
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.items || []) as ImageResult[];
  } catch {
    return [];
  }
}


