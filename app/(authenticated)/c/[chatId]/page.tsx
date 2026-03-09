import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ChatInterface from "./_components/chat-interface";
import { UploadedDocument } from "../page";

export interface BranchMessage {
  id: string;
  chat_id: string;
  parent_id: string | null;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  user_id: string;
  document_id: string;
  doc_title: string;
  document: UploadedDocument;
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const supabase = await createClient();
  const { chatId } = await params;

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select(
      `
      *,
      document:documents (*)
    `,
    )
    .eq("id", chatId)
    .single();

  if (chatError || !chat) {
    console.error("Chat Fetch Error:", chatError);
    return notFound();
  }

  const typedChat = chat as Chat;
  let branchMessages: BranchMessage[] = [];

  const { data: branchRows } = await supabase.rpc("get_all_chat_messages", {
    p_chat_id: chatId,
  });

  if (branchRows && Array.isArray(branchRows)) {
    branchMessages = branchRows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      chat_id: String(row.chat_id),
      role: row.role as "user" | "assistant",
      content: String(row.content ?? ""),
      created_at: String(row.created_at ?? ""),
      parent_id: row.parent_id != null ? String(row.parent_id) : null,
    }));
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="font-medium text-base">
        {typedChat.document?.doc_title || "Chat"}
      </header>
      <ChatInterface
        chatId={typedChat.id}
        headMessageId={String(chat.head_message_id)}
        initialMessages={branchMessages}
        document={typedChat.document}
      />
    </div>
  );
}
