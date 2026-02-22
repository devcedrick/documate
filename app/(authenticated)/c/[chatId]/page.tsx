import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ChatInterface from './_components/chat-interface';
import { UploadedDocument } from '../page';

export interface BranchMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sibling_count?: number;
  sibling_index?: number;
  sibling_ids?: string[];
}

interface Chat {
  id: string;
  user_id: string;
  document_id: string;
  doc_title: string;
  document: UploadedDocument;
}

export default async function ChatPage({
  params
}: {
  params: Promise<{ chatId: string }>;
}) {
  const supabase = await createClient();
  const { chatId } = await params;

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select(`
      *,
      document:documents (*)
    `)
    .eq('id', chatId)
    .single();

  if (chatError || !chat) {
    console.error('Chat Fetch Error:', chatError);
    return notFound();
  }

  const typedChat = chat as Chat;
  let branchMessages: BranchMessage[] = [];

  const { data: branchRows } = await supabase.rpc('get_chat_branch', {
    p_chat_id: chatId
  });

  if (branchRows && Array.isArray(branchRows)) {
    branchMessages = branchRows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      chat_id: String(row.chat_id),
      role: row.role as 'user' | 'assistant',
      content: String(row.content ?? ''),
      created_at: String(row.created_at ?? ''),
      ...(row.sibling_count != null && Number(row.sibling_count) > 1 && {
        sibling_count: Number(row.sibling_count),
        sibling_index: Number(row.sibling_index),
        sibling_ids: (row.sibling_ids as number[] | null)?.map(String) ?? []
      })
    }));
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="font-medium text-base">
        {typedChat.document?.doc_title || 'Chat'}
      </header>
      <ChatInterface
        chatId={typedChat.id}
        initialMessages={branchMessages}
        document={typedChat.document}
      />
    </div>
  );
}