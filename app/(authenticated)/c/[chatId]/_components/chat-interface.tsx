"use client"

import { useState, useEffect } from 'react'
import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import ChatSplitView from '../../_components/chat-split-view'
import { UploadedDocument } from '../../page'
import { useChatContext } from '@/hooks/use-chat-context'

// Types
interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface UserConfig {
  useCase: string
  preference: string
  strictness: string
}

interface ChatInterfaceProps {
  chatId: string
  initialMessages: Message[]
  document: UploadedDocument
}

// Convert database messages to UIMessage format for useChat
function convertToUIMessages(dbMessages: Message[]): UIMessage[] {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }],
    metadata: {createdAt: new Date(msg.created_at)},
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
  
  // Convert DB messages to UI format
  const convertedInitialMessages = convertToUIMessages(initialMessages)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  // Set initial messages on mount
  useEffect(() => {
    if (convertedInitialMessages.length > 0 && messages.length === 0) {
      setMessages(convertedInitialMessages)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    />
  )
}
