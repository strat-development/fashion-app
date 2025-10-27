type VercelRequest = any;
type VercelResponse = any;

type SearchedImage = { url: string; title?: string; source?: string; pageUrl?: string };
type Body = { queries: string[]; gl?: string; hl?: string };

const SERPER_API_KEY = process.env.SERPER_API_KEY || process.env.EXPO_PUBLIC_SERPER_API_KEY || '';

const ALLOWED = [/amazon\./, /asos\./, /uniqlo\./, /zara\./, /nike\./, /adidas\./, /hm\.com/];
const PRODUCT_PATTERNS = [
  /amazon\..*\/dp\//, /asos\..*\/prd\//, /uniqlo\..*\/product\//, /zara\..*\/[A-Z0-9]{8}\.html/,
  /nike\..*\/t\//, /adidas\..*\/[a-z0-9-]+\.html/, /hm\.com.*\/productpage\./
];

function isAllowed(url: string) { return ALLOWED.some((r) => r.test(url)); }
function looksLikeProduct(url: string) { return PRODUCT_PATTERNS.some((r) => r.test(url)); }
function cleanUrl(u: string) {
  try {
    const url = new URL(u);
    url.hash = '';
    ['utm_source','utm_medium','utm_campaign','utm_id','gclid','fbclid','utm_term','utm_content'].forEach(p=>url.searchParams.delete(p));
    url.protocol = 'https:';
    return url.toString();
  } catch { return u; }
}

async function headOk(url: string, timeoutMs = 2500) {
  try {
    const ctl = new AbortController(); const id = setTimeout(()=>ctl.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0' }});
    clearTimeout(id); return res.ok;
  } catch { return false; }
}

async function pageOG(url: string, timeoutMs = 3500) {
  try {
    const ctl = new AbortController(); const id = setTimeout(()=>ctl.abort(), timeoutMs);
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0' }});
    clearTimeout(id); if (!res.ok) return {} as any;
    const html = await res.text();
    const get = (p:string)=>html.match(new RegExp(`<meta[^>]+property=["']${p}["'][^>]+content=["']([^"']+)`, 'i'))?.[1];
    const getName = (n:string)=>html.match(new RegExp(`<meta[^>]+name=["']${n}["'][^>]+content=["']([^"']+)`, 'i'))?.[1];
    return {
      ogTitle: get('og:title') || getName('twitter:title'),
      ogImage: get('og:image') || getName('twitter:image'),
      ogSite: get('og:site_name') || getName('twitter:site')
    } as any;
  } catch { return {} as any; }
}

async function searchSerper(q: string, gl='us', hl='en', num=10) {
  if (!SERPER_API_KEY) return [] as Array<any>;
  const r = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, gl, hl, num }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    console.error('Serper /search error', r.status, text);
    return [] as Array<any>;
  }
  const data = await r.json();
  return (data?.organic || []) as Array<any>;
}

async function imagesSerper(q: string, gl='us', hl='en', num=10) {
  if (!SERPER_API_KEY) return [] as Array<any>;
  const r = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, gl, hl, num }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    console.error('Serper /images error', r.status, text);
    return [] as Array<any>;
  }
  const data = await r.json();
  return (data?.images || []) as Array<any>;
}

async function findProductImageForQuery(query: string, gl='us', hl='en'): Promise<SearchedImage | null> {
  const limiter = 'site:amazon OR site:asos OR site:uniqlo OR site:zara OR site:nike OR site:adidas OR site:hm.com';
  const q = `${query} ${limiter}`;
  const results = await searchSerper(q, gl, hl, 10);
  for (const r of results) {
    const page = cleanUrl(r.link || r.url || '');
    if (!page || !isAllowed(page) || !looksLikeProduct(page)) continue;
    const ok = await headOk(page);
    if (!ok) continue;
    const og = await pageOG(page);
    const img = og.ogImage as string | undefined;
    if (!img) continue;
    const host = (()=>{ try { return new URL(page).hostname.replace(/^www\./,''); } catch { return undefined; } })();
    return {
      url: img,
      title: og.ogTitle || r.title,
      source: host,
      pageUrl: page,
    };
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    if (!SERPER_API_KEY) {
      return res.status(401).json({ items: [], error: 'Missing SERPER_API_KEY' });
    }
    let body = (req.body || {}) as Body | string;
    if (typeof body === 'string') {
      try { body = JSON.parse(body) as Body; } catch { body = {} as Body; }
    }
    const b = (body || {}) as Body;
    const queries = Array.isArray(b.queries) ? b.queries : [];
    if (!queries.length) return res.status(200).json({ items: [] });

    const gl = b.gl ?? 'us';
    const hl = b.hl ?? 'en';

    const results = await Promise.all(
      queries.map(async (q) => {
        try {const imgResults = await imagesSerper(q, gl, hl, 10);
          
          const firstImg = imgResults.find((it: any) => it?.imageUrl || it?.thumbnailUrl);
          if (firstImg) {
            return {
              url: firstImg.imageUrl || firstImg.thumbnailUrl,
              title: firstImg.title || q,
              source: firstImg.source || 'Web',
              pageUrl: firstImg.link || firstImg.imageUrl || firstImg.thumbnailUrl,
            } as SearchedImage;
          }
          
          const productResult = await findProductImageForQuery(q, gl, hl);
          if (productResult) {
            console.log(`Found product for "${q}":`, productResult.url);
            return productResult;
          }
          
          if (imgResults.length > 0) {
            const anyImg = imgResults[0];
            
            return {
              url: anyImg.imageUrl || anyImg.thumbnailUrl || anyImg.url,
              title: anyImg.title || q,
              source: anyImg.source || 'Web',
              pageUrl: anyImg.link || anyImg.imageUrl || anyImg.thumbnailUrl || anyImg.url,
            } as SearchedImage;
          }
          
          return null;
        } catch (error) {
          console.error(`Error searching for "${q}":`, error);
          return null;
        }
      })
    );

    const filtered = results.filter((x): x is SearchedImage => !!(x && (x as any).url));
   
    if (!filtered.length) {
      return res.status(200).json({ items: [] });
    }
    
    return res.status(200).json({ items: filtered });
  } catch {
    return res.status(200).json({ items: [] });
  }
}


