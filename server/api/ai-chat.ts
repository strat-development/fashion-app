type VercelRequest = any;
type VercelResponse = any;

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string };
type Body = {
  systemPrompt: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  userText: string;
  temperature?: number;
  language?: string;
  numWebResults?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!OPENAI_API_KEY) {
      return res.status(401).json({ error: 'Missing OPENAI_API_KEY' });
    }

    let body = (req.body || {}) as Body | string;
    if (typeof body === 'string') {
      try { body = JSON.parse(body) as Body; } catch { body = {} as Body; }
    }
    const { systemPrompt, history = [], userText, temperature = 0.7, numWebResults = 5 } = (body || {}) as Body;
    if (!userText || !systemPrompt) return res.status(400).json({ error: 'Missing systemPrompt or userText' });

    const tools = [
      {
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web for the latest fashion brand pages or style guides relevant to the query.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              num: { type: 'number' },
            },
            required: ['query'],
          },
        },
      },
    ];

    const workingMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userText },
    ];

    const preResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: workingMessages,
        tools,
        tool_choice: 'auto',
        temperature,
        stream: false,
      }),
    });

    if (!preResp.ok) {
      const errText = await preResp.text().catch(() => '');
      return res.status(200).json({ content: `Sorry, I couldn't generate a response. (${preResp.status})`, error: errText });
    }

    const pre = await preResp.json();
    const preChoice = pre?.choices?.[0];
    const toolCalls = preChoice?.message?.tool_calls as Array<any> | undefined;

    if (toolCalls && toolCalls.length) {
      for (const call of toolCalls) {
        if (call.type === 'function' && call.function?.name === 'web_search') {
          let args: any = {};
          try { args = JSON.parse(call.function.arguments || '{}'); } catch { }
          const q = String(args.query || userText);
          const num = Number(args.num || numWebResults);

          const SERPER_API_KEY = process.env.EXPO_PUBLIC_SERPER_API_KEY || '';
          let results: Array<{ title: string; url: string; snippet?: string; site?: string }> = [];
          if (SERPER_API_KEY) {
            try {
              const r = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: q, num, gl: 'us', hl: 'en' }),
              });
              if (r.ok) {
                const data = await r.json();
                const organic = (data?.organic || []) as Array<any>;
                results = organic.slice(0, num).map((o) => ({
                  title: o.title,
                  url: o.link,
                  snippet: o.snippet,
                  site: (() => { try { return new URL(o.link).hostname.replace(/^www\./, ''); } catch { return undefined; } })(),
                }));
              }
            } catch {  }
          }

          workingMessages.push({ role: 'assistant', content: '' });
          workingMessages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ results }) });
        }
      }
    } else if (preChoice?.message?.content) {
      workingMessages.push({ role: 'assistant', content: preChoice.message.content });
    }

    const finalResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: workingMessages,
        temperature,
        stream: false,
      }),
    });

    if (!finalResp.ok) {
      const errText = await finalResp.text().catch(() => '');
      return res.status(200).json({ content: `Sorry, I couldn't generate a response. (${finalResp.status})`, error: errText });
    }

    const final = await finalResp.json();
    const content = final?.choices?.[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (e) {
    return res.status(200).json({ content: '' });
  }
}


