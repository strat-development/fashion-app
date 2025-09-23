type WebResult = { title: string; url: string; snippet?: string; site?: string };
import { buildApiUrl } from '@/utils/api';

export async function webSearch(query: string, num = 5): Promise<WebResult[]> {
  const apiUrl = buildApiUrl('/api/web-search');
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, num }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.results || []) as WebResult[];
  } catch {
    return [];
  }
}


