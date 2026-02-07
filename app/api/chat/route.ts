import { createClient } from "@/utils/supabase/server";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getEmbeddings } from "@/lib/embedding";
import { buildSystemPrompt } from "@/lib/prompts/index";
import { google } from "@ai-sdk/google";
import { getStreamingError, STREAMING_ERROR_CODES } from "@/lib/errors/streaming";

// Helper to extract text from message (handles both parts[] and content formats)
function getMessageText(message: any): string {
  if (typeof message.content === 'string') return message.content;
  if (message.parts && Array.isArray(message.parts)) {
    const textPart = message.parts.find((p: any) => p.type === 'text');
    return textPart?.text || '';
  }
  return '';
}

export const maxDuration = 30;

export async function POST(request: Request) {
  console.log('[Chat API] Request received');
  
  // Auth check outside stream
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('[Chat API] Unauthorized request');
    return new Response(JSON.stringify({ 
      error: 'Please log in to continue.',
      code: STREAMING_ERROR_CODES.AUTH_ERROR 
    }), { status: 401 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (err) {
    console.error('[Chat API] Invalid request body:', err);
    return new Response(JSON.stringify({ 
      error: 'Invalid request format.',
      code: STREAMING_ERROR_CODES.VALIDATION_ERROR 
    }), { status: 400 });
  }

  const { docId, chatId, messages, config } = requestBody;

  if (!docId) {
    console.error('[Chat API] Missing documentId');
    return new Response(JSON.stringify({ 
      error: 'No document selected. Please upload a document first.',
      code: STREAMING_ERROR_CODES.VALIDATION_ERROR 
    }), { status: 400 });
  }

  if (!messages || messages.length === 0) {
    console.error('[Chat API] No messages provided');
    return new Response(JSON.stringify({ 
      error: 'No message provided.',
      code: STREAMING_ERROR_CODES.VALIDATION_ERROR 
    }), { status: 400 });
  }

  let activeChatId = chatId;
  let activeDocId = docId;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      try {
        // -- SCENARIO A: No active chat --
        if (!activeChatId) {
          console.log('[Chat API] Creating new chat session...');
          
          if (!activeDocId) {
            throw { context: 'chat_create', original: new Error('Missing documentId') };
          }

          const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert([{
              document_id: activeDocId,
              user_id: user.id,
            }])
            .select()
            .single();

          if (chatError || !newChat) {
            console.error('[Chat API] Failed to create chat:', chatError);
            throw { context: 'chat_create', original: chatError || new Error('Failed to create chat') };
          }

          activeChatId = newChat.id;
          console.log('[Chat API] Chat created:', activeChatId);

          writer.write({
            type: 'data-chat_created',
            data: { chatId: activeChatId },
          });
        }
        // SCENARIO B: Active chat, derive documentId from it
        else {
          console.log('[Chat API] Fetching existing chat:', activeChatId);
          
          const { data: chatData, error: chatFetchError } = await supabase
            .from('chats')
            .select('document_id')
            .eq('id', activeChatId)
            .single();

          if (chatFetchError || !chatData) {
            console.error('[Chat API] Failed to fetch chat:', chatFetchError);
            throw { context: 'chat_fetch', original: chatFetchError || new Error('Failed to fetch chat data') };
          }

          activeDocId = chatData.document_id;
        }

        // RAG PIPELINE
        console.log('[Chat API] Starting RAG pipeline...');
        const lastUserMessage = getMessageText(messages[messages.length - 1]);
        
        let embeddings;
        try {
          embeddings = await getEmbeddings([lastUserMessage], 'chat-history', 'RETRIEVAL_QUERY');
        } catch (err) {
          console.error('[Chat API] Embedding generation failed:', err);
          throw { context: 'embedding', original: err };
        }

        const queryVector = embeddings[0];

        console.log('[Chat API] Searching for relevant content...');
        const { data: chunks, error: matchingError } = await supabase.rpc('match_documents', {
          query_embedding: queryVector,
          match_threshold: 0.5,
          match_count: 5,
          filter_document_id: activeDocId,
          filter_user_id: user.id,
        });

        if (matchingError) {
          console.error('[Chat API] Vector search failed:', matchingError);
          throw { context: 'vector_search', original: matchingError };
        }

        console.log(`[Chat API] Found ${chunks?.length || 0} relevant chunks`);
        const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

        // SYSTEM PROMPT
        const systemPrompt = buildSystemPrompt({
          useCase: config?.useCase || 'general',
          preference: config?.preference || 'detailed',
          strictness: config?.strictness || 'balanced',
          context: contextText
        });

        // MESSAGE STREAM RESPONSE
        console.log('[Chat API] Starting LLM stream...');
        
        const result = streamText({
          model: google('gemini-2.5-flash'),
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          onFinish: async ({ text }) => {
            console.log('[Chat API] Stream finished, saving messages...');
            
            // Save User Message
            const { error: userMsgError } = await supabase.from('messages').insert({
              chat_id: activeChatId,
              role: 'user',
              content: lastUserMessage
            });
            
            if (userMsgError) {
              console.error('[Chat API] Failed to save user message:', userMsgError);
              // Don't throw here - response was already sent
            }

            // Save Assistant Message
            const { error: assistantMsgError } = await supabase.from('messages').insert({
              chat_id: activeChatId,
              role: 'assistant',
              content: text
            });
            
            if (assistantMsgError) {
              console.error('[Chat API] Failed to save assistant message:', assistantMsgError);
              // Don't throw here - response was already sent
            }
            
            console.log('[Chat API] Messages saved successfully');
          },
        });

        await writer.merge(result.toUIMessageStream());
        
      } catch (err: any) {
        // Extract context and original error
        const context = err?.context || 'unknown';
        const originalError = err?.original || err;
        
        console.error(`[Chat API] Error in ${context}:`, originalError);
        
        const { message, code } = getStreamingError(originalError, context);
        
        // Write error to stream for client to handle
        writer.write({
          type: 'data-error',
          data: { message, code },
        });
        
        throw new Error(message);
      }
    },
    onError: (error) => {
      console.error('[Chat API] Stream error:', error);
      // Return user-friendly message
      return error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    }
  });

  return createUIMessageStreamResponse({ stream });
}