import { createClient } from "@/utils/supabase/server";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getEmbeddings } from "@/lib/embedding";
import { buildSystemPrompt } from "@/lib/prompts/index";
import { google } from "@ai-sdk/google";

// Helper to extract text from message (handles both parts[] and content formats)
function getMessageText(message: any): string {
  if (typeof message.content === 'string') return message.content;
  if (message.parts && Array.isArray(message.parts)) {
    const textPart = message.parts.find((p: any) => p.type === 'text');
    return textPart?.text || '';
  }
  return '';
}

export const maxDuration = 60 * 5; // 5 minutes

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const {docId, chatId, messages, config} = await request.json();

  if (!docId) {
    return new Response('Bad Request: Missing documentId', { status: 400 });
  }

  let activeChatId = chatId;
  let activeDocId = docId;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // -- SCENARIO A: No active chat, create a new one --
      if (!activeChatId) {
        if (!activeDocId) throw new Error('Missing documentId');

        const lastMessageText = getMessageText(messages[messages.length - 1]);
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert([{
            document_id: activeDocId,
            user_id: user.id,
            title: lastMessageText.slice(0, 30),
          }])
          .select()
          .single();

        if (chatError || !newChat) throw chatError || new Error('Failed to create chat');

        activeChatId = newChat.id;

        writer.write({
          type: 'data-chat_created',
          data: { chatId: activeChatId },
        })
      }
      // SCENARIO B: Active chat, derive documentId from it
      else {
        const { data: chatData, error: chatFetchError } = await supabase
          .from('chats')
          .select('document_id')
          .eq('id', activeChatId)
          .single();

        if (chatFetchError || !chatData) throw chatFetchError || new Error('Failed to fetch chat data');

        activeDocId = chatData.document_id;
      }

      // RAG PIPELINE
      const lastUserMessage = getMessageText(messages[messages.length - 1]);
      const embeddings = await getEmbeddings([lastUserMessage], 'chat-history', 'RETRIEVAL_QUERY');

      const queryVector = embeddings[0];

      const { data: chunks, error: matchingError } = await supabase.rpc('match_documents', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: 5,
        filter_document_id: activeDocId,
        filter_user_id: user.id,
      });

      if (matchingError) throw matchingError;

      const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

      // SYSTEM PROMPT
      const systemPrompt = buildSystemPrompt({
        useCase: config?.useCase || 'general',
        preference: config?.preference || 'detailed',
        strictness: config?.strictness || 'balanced',
        context: contextText
      });

      // MESSAGE STREAM RESPONSE
      const result = streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        onFinish: async ({ text }) => {
           // Save User Message
           await supabase.from('messages').insert({
             chat_id: activeChatId,
             role: 'user',
             content: lastUserMessage
           });

           // Save Assistant Message
           await supabase.from('messages').insert({
             chat_id: activeChatId,
             role: 'assistant',
             content: text
           });
        },
      });

      await writer.merge(result.toUIMessageStream());
    },
    onError: error => {
      return error instanceof Error ? error.message : String(error);
    }
  });

  return createUIMessageStreamResponse({stream});

}