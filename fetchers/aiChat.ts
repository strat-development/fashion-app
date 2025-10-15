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


