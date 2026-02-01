import { createClient } from "@/utils/supabase/server";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getEmbeddings } from "@/lib/embedding";
import { buildSystemPrompt } from "@/lib/prompts/index";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const {docId, chatId, messages, config} = await request.json();

  let activeChatId = chatId;
  let activeDocId = docId;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // -- SCENARIO A: No active chat, create a new one --
      if (!activeChatId) {
        if (!activeDocId) throw new Error('Missing documentId');

        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert([{
            document_id: activeDocId,
            user_id: user.id,
            title: messages[messages.length - 1].content.slice(0, 30), // TEMPORARY TITLE
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
      const lastUserMessage = messages[messages.length - 1].content;
      const embeddings = await getEmbeddings([lastUserMessage], 'chat-history', 'RETRIEVAL_QUERY');

      const queryVector = embeddings[0];

      const { data: chunks } = await supabase.rpc('match_documents', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: 5,
        filter_document_id: activeDocId,
        filter_user_id: user.id,
      });

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
        model: google('gemini-2.0-flash'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        onFinish: async ({ text }) => {
           // 1. Save User Message
           await supabase.from('messages').insert({
             chat_id: activeChatId,
             role: 'user',
             content: lastUserMessage
           });

           // 2. Save Assistant Message
           await supabase.from('messages').insert({
             chat_id: activeChatId,
             role: 'assistant',
             content: text
           });
        },
      })

      writer.merge(result.toUIMessageStream());
    },
    onError: error => {
      return error instanceof Error ? error.message : String(error);
    }
  });

  return createUIMessageStreamResponse({stream});

}