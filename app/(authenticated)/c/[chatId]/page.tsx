import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ChatInterface from './_components/chat-interface';
import { UploadedDocument } from '../page';

interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  user_id: string;
  document_id: string;
  doc_title: string;
  document: UploadedDocument;
  messages: Message[];
}

export default async function ChatPage({ 
  params 
}: { 
  params: Promise<{ chatId: string }> 
}) {
  const supabase = await createClient();
  const { chatId } = await params;

  // Fetch Chat Session + Related Document + Messages (ordered by created_at)
  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      *,
      document:documents (*), 
      messages (*)
    `)
    .eq('id', chatId)
    .order('created_at', { referencedTable: 'messages', ascending: true })
    .single();

  if (error || !chat) {
    console.error("Chat Fetch Error:", error);
    return notFound();
  }

  const typedChat = chat as Chat;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="font-medium text-lg">
        {typedChat.document?.doc_title || 'Chat'}
      </header>
      <ChatInterface 
        chatId={typedChat.id}
        initialMessages={typedChat.messages || []}
        document={typedChat.document}
      />
    </div>
  );
}