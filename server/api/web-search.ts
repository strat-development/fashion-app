import type { VercelRequest, VercelResponse } from '@vercel/node';

type Body = { query: string; num?: number; gl?: string; hl?: string };

const SERPER_API_KEY = process.env.EXPO_PUBLIC_SERPER_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { query, num = 5, gl = 'us', hl = 'en' } = (req.body || {}) as Body;

    if (!query || !SERPER_API_KEY) return res.status(200).json({ results: [] });

    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num, gl, hl }),
    });

    if (!r.ok) return res.status(200).json({ results: [] });

    const data = await r.json();
    const organic = (data?.organic || []) as Array<any>;
    const results = organic.slice(0, num).map((o) => ({
      title: o.title,
      url: o.link,
      snippet: o.snippet,
      site: (() => { try { return new URL(o.link).hostname.replace(/^www\./, ''); } catch { return undefined; } })(),
    }));
    
    return res.status(200).json({ results });
  } catch {
    return res.status(200).json({ results: [] });
  }
}


