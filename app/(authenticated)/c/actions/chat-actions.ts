"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteChat(chatId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Delete messages first (due to foreign key constraint)
  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chatId);

  if (messagesError) {
    console.error("Messages Deletion Error:", messagesError);
    return { error: "Failed to delete chat messages" };
  }

  // Delete the chat
  const { error: chatError } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", user.id);

  if (chatError) {
    console.error("Chat Deletion Error:", chatError);
    return { error: "Failed to delete chat" };
  }

  return { success: true };
}

export async function renameChat(chatId: string, newTitle: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Find the associated document
  const { data: chat, error: chatFetchError } = await supabase
    .from("chats")
    .select("document_id")
    .eq("id", chatId)
    .eq("user_id", user.id)
    .single();

  if (chatFetchError || !chat) {
    console.error("Chat Fetch Error:", chatFetchError);
    return { error: "Chat not found" };
  }

  // Update the document title
  const { error: updateError } = await supabase
    .from("documents")
    .update({ doc_title: newTitle })
    .eq("id", chat.document_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Document Update Error:", updateError);
    return { error: "Failed to rename chat" };
  }

  revalidatePath("/c");
  return { success: true };
}

export async function syncHeadMessage(chatId: string, messageId: string) {
  const supabase = await createClient();
  await supabase
    .from("chats")
    .update({ head_message_id: messageId })
    .eq("id", chatId);
}
