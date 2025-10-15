import { supabase } from "@/lib/supabase";

export async function fetchConversations() {
  try {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id,title,created_at')
      .order('created_at', { ascending: false });
    return (data || [])
  } catch {
    return [];
  }
}

export async function fetchConversationMessages(conversationId: string) {
try {
    const { data } = await supabase
      .from('ai_messages')
      .select('id,role,content,created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return (data || []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at }));
  } catch {
    return [];
  }
}


