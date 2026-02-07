import { EmbeddingError } from "@/lib/embedding";

/**
 * Standardized error codes for streaming API responses.
 * These codes help the client identify and handle specific error scenarios.
 */
export const STREAMING_ERROR_CODES = {
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CHAT_ERROR: 'CHAT_ERROR',
  EMBEDDING_ERROR: 'EMBEDDING_ERROR',
  VECTOR_SEARCH_ERROR: 'VECTOR_SEARCH_ERROR',
  LLM_ERROR: 'LLM_ERROR',
  SAVE_ERROR: 'SAVE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type StreamingErrorCode = typeof STREAMING_ERROR_CODES[keyof typeof STREAMING_ERROR_CODES];

export interface StreamingErrorResponse {
  message: string;
  code: StreamingErrorCode;
}

/**
 * Context-specific user-friendly error messages.
 * Maps internal error contexts to messages suitable for end-user display.
 */
const CONTEXT_ERROR_MESSAGES: Record<string, string> = {
  'chat_create': 'Failed to create chat session. Please try again.',
  'chat_fetch': 'Failed to load chat data. Please refresh the page.',
  'embedding': 'Failed to process your message. Please try again.',
  'vector_search': 'Failed to search document content. Please try again.',
  'llm_stream': 'Failed to generate response. Please try again.',
  'save_messages': 'Response generated but failed to save. Your conversation may not persist.',
};

/**
 * Transforms raw errors into user-friendly streaming error responses.
 * 
 * @param error - The original error object (can be any type)
 * @param context - The operation context where the error occurred (e.g., 'embedding', 'chat_create')
 * @returns A standardized error response with user-friendly message and error code
 */

export function getStreamingError(error: unknown, context: string): StreamingErrorResponse {
  const err = error as any;
  const statusCode = err?.statusCode || err?.status;
  
  // Handle custom EmbeddingError
  if (error instanceof EmbeddingError) {
    return {
      message: error.message,
      code: STREAMING_ERROR_CODES.EMBEDDING_ERROR
    };
  }
  
  // Handle rate limiting (429)
  if (statusCode === 429) {
    return {
      message: 'Service is temporarily busy. Please wait a moment and try again.',
      code: STREAMING_ERROR_CODES.LLM_ERROR
    };
  }
  
  // Handle authentication errors (401, 403)
  if (statusCode === 401 || statusCode === 403) {
    return {
      message: 'Authentication error. Please refresh the page and try again.',
      code: STREAMING_ERROR_CODES.AUTH_ERROR
    };
  }
  
  // Handle bad request (400)
  if (statusCode === 400) {
    return {
      message: 'Invalid request. Please try rephrasing your message.',
      code: STREAMING_ERROR_CODES.VALIDATION_ERROR
    };
  }
  
  // Return context-specific message or default
  return {
    message: CONTEXT_ERROR_MESSAGES[context] || 'An unexpected error occurred. Please try again.',
    code: STREAMING_ERROR_CODES.UNKNOWN_ERROR
  };
}
