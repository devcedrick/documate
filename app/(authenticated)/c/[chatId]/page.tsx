import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChatInterface } from './_components/chat-interface'; // We will create this next

export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const supabase = await createClient();
  const { chatId } = params;

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 2. Fetch Chat Session + Related Document + Messages
  // We use a single query with joins for efficiency
  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      *,
      document:documents (*), 
      messages (*)
    `)
    .eq('id', chatId)
    .single();

  if (error || !chat) {
    console.error("Chat Fetch Error:", error);
    return notFound();
  }

  // 3. Security: Ensure User Owns this Chat
  if (chat.user_id !== user.id) {
    return notFound(); // Hide it completely (Security by Obscurity)
  }

  // 4. Render the Client Interface
  return (
    <div className="flex h-screen w-full bg-background">
      <ChatInterface 
        chatId={chat.id}
        initialMessages={chat.messages || []}
        document={chat.document} // Pass file metadata for the FilePanel
        userConfig={user.user_metadata?.config || {}} // Optional: Load saved user preferences
      />
    </div>
  );
}