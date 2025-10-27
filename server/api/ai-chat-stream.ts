type VercelRequest = any;
type VercelResponse = any;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type Body = {
  systemPrompt: string;
  history: ChatMessage[];
  userText: string;
  temperature?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  if (!OPENAI_API_KEY) return res.status(401).send('Missing OPENAI_API_KEY');

  try {
    let body = (req.body || {}) as Body | string;
    if (typeof body === 'string') {
      try { body = JSON.parse(body) as Body; } catch { body = {} as Body; }
    }
    const { systemPrompt, history = [], userText, temperature = 0.7 } = (body || {}) as Body;
    if (!userText || !systemPrompt) return res.status(400).send('Missing systemPrompt or userText');

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userText },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature,
        stream: true,
      }),
    });

    if (!upstream.body) {
      res.write(`data: ${JSON.stringify({ error: 'No stream' })}\n\n`);
      return res.end();
    }

    const reader = (upstream.body as any).getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      
      res.write(chunk);
    }

    res.end();
  } catch {
    try { res.end(); } catch {}
  }
}


