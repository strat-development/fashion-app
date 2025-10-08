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
    
    if (!res.ok) {
      console.error('API request failed:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    
    const items = Array.isArray(data?.items) ? data.items : [];
    const cleaned = items.filter((it: any) => it && typeof it.url === 'string' && it.url.length > 0);
    
    return cleaned as ImageResult[];
  } catch (error) {
    console.error('Search images error:', error);
    
    return [];
  }
}


