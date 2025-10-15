type SupabaseClient = any;

export async function deleteConversationMutation(params: {
  supabase: SupabaseClient;
  conversationId: string;
}) {
  const { supabase, conversationId } = params;
  if (!conversationId) throw new Error('conversationId is required');

  // Delete messages first (FK constraints) then conversation
  await supabase.from('ai_messages').delete().eq('conversation_id', conversationId);
  await supabase.from('ai_conversations').delete().eq('id', conversationId);
}


