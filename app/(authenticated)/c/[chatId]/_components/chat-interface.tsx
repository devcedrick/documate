"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import ChatSplitView from '../../_components/chat-split-view'
import { UploadedDocument } from '../../page'
import { useChatContext } from '@/hooks/use-chat-context'
import { toast } from 'sonner'
import { switchBranch } from '../../actions/chat-actions'
import type { BranchMessage } from '../page'
import type { BranchMeta } from '../../_components/chat-split-view'

interface UserConfig {
  useCase: string
  preference: string
  strictness: string
}

interface ChatInterfaceProps {
  chatId: string
  initialMessages: BranchMessage[]
  document: UploadedDocument
}

// Convert database messages to UIMessage format for useChat
function convertToUIMessages(dbMessages: BranchMessage[]): UIMessage[] {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }],
    metadata: { createdAt: new Date(msg.created_at) },
  }))
}

export default function ChatInterface({ 
  chatId, 
  initialMessages, 
  document, 
}: ChatInterfaceProps) {
  const router = useRouter()
  const [input, setInput] = useState("")

  // User Configs
  const user = useChatContext();
  const userConfig: UserConfig = {
    useCase: user?.useCase || 'general',
    preference: user?.responsePreference || 'detailed',
    strictness: user?.strictnessLevel || 'balanced',
  }

  
  const { messages, sendMessage, status, setMessages, error, regenerate } = useChat({
    id: chatId,
    messages: convertToUIMessages(initialMessages),
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onData: ({ data, type }) => {
      // Handle custom error events from stream
      if (type === 'data-error') {
        const errorData = data as { message: string; code: string };
        console.error('[Chat] Stream error:', errorData);
        toast.error('Error', { description: errorData.message });
      }
    },
    onError: (err) => {
      console.error('[Chat] Error:', err);
      toast.error('Error', { 
        description: err.message || 'Failed to send message. Please try again.' 
      });
    },
  })

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      console.error('[Chat] Hook error:', error);
      toast.error('Error', { 
        description: error.message || 'Something went wrong. Please try again.' 
      });
    }
  }, [error]);

  // HANDLE BRANCH SWITCHING
  const didSwitchRef = useRef(false);
  useEffect(() => {
    if (didSwitchRef.current && status === 'ready' && initialMessages.length > 0) {
      setMessages(convertToUIMessages(initialMessages));
      didSwitchRef.current = false;
    }
  }, [initialMessages, status, setMessages]);

  const handleSwitchBranch = async (messageId: string) => {
    const result = await switchBranch(chatId, messageId);
    if (result?.error) {
      toast.error('Failed to switch branch', { description: result.error });
      return;
    }
    didSwitchRef.current = true;
    router.refresh();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    
    sendMessage(
      { parts: [{ type: 'text', text: input }] },
      { 
        body: { 
          chatId,
          docId: document.id,
          config: userConfig
        } 
      }
    )
    setInput("")
  }

  const handleDeleteDocument = () => {
    router.push('/c')
  }

  const branchMeta = useMemo(() => {
    const map = new Map<string, BranchMeta>()
    for (const m of initialMessages) {
      if (m.sibling_count != null && m.sibling_count > 1 && m.sibling_index != null && m.sibling_ids?.length) {
        map.set(m.id, {
          sibling_count: m.sibling_count,
          sibling_index: m.sibling_index,
          sibling_ids: m.sibling_ids
        })
      }
    }
    return map
  }, [initialMessages])

  return (
    <ChatSplitView
      document={document}
      onDeleteDoc={handleDeleteDocument}
      messages={messages}
      input={input}
      handleInputChange={(e) => setInput(e.target.value)}
      handleSubmit={handleSubmit}
      disableButton={status !== 'ready' || input.trim() === ''}
      status={status}
      regenerate={async (opts) => await regenerate({
        ...opts,
        body: {
          chatId,
          docId: document.id,
          config: userConfig
        }
      })}
      branchMeta={branchMeta}
      onSwitchBranch={handleSwitchBranch}
    />
  )
}
