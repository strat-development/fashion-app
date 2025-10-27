type Message = { role: 'user' | 'assistant'; content: string };

import { buildApiUrl } from '@/utils/api';

export async function aiChatRequest(params: {
  systemPrompt: string;
  history: Message[];
  userText: string;
  temperature?: number;
}) {
  const apiUrl = buildApiUrl('/api/ai-chat');

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) return { content: '', error: `HTTP ${res.status}` } as { content: string; error?: string };

    const data = await res.json();
    return { content: data?.content || '', error: data?.error } as { content: string; error?: string };
  } catch (e: any) {
    return { content: '', error: String(e?.message || e) } as { content: string; error?: string };
  }
}

export async function aiChatStream(params: {
  systemPrompt: string;
  history: Message[];
  userText: string;
  temperature?: number;
  onDelta: (delta: string) => void;
}) {
  const apiUrl = buildApiUrl('/api/ai-chat-stream');
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok || !res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (!part.startsWith('data:')) continue;
      const data = part.replace(/^data:\s*/, '').trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content || '';
        if (delta) params.onDelta(delta);
      } catch {}
    }
  }
}


