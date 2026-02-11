"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatSplitView from "./_components/chat-split-view"
import UploadZone from "./_components/upload-zone"
import { WelcomeBanner } from "./_components/welcome-banner"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useChatContext } from "@/hooks/use-chat-context"
import { toast } from "sonner"

export interface UploadedDocument {
  id: string
  file_name: string
  file_path: string
  file_size: number
  doc_title: string
  [key: string]: unknown
}

// NEW CHAT PAGE
const Page = () => {
  const router = useRouter();
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null)
  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const user = useChatContext();
  const userConfig = {
    useCase: user?.useCase || 'general',
    preference: user?.responsePreference || 'detailed',
    strictness: user?.strictnessLevel || 'balanced',
  }


  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onData: ({ data, type }) => {
      if (type === 'data-chat_created') {
        const chatData = data as { chatId: string };
        setChatId(chatData.chatId);
      }
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
  });

  // Show error toast when status becomes error
  useEffect(() => {
    if (error) {
      console.error('[Chat] Hook error:', error);
      toast.error('Error', { 
        description: error.message || 'Something went wrong. Please try again.' 
      });
    }
  }, [error]);

  useEffect(() => {
    if (chatId && status === 'ready' && messages.length > 0) {
      router.push(`/c/${chatId}`);
    }
  }, [router, chatId, status, messages.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(
      { parts: [{ type: 'text', text: input }] },
      { 
        body: { 
        docId: uploadedDoc?.id ,
        config: userConfig
        } 
      }
    );
    setInput("");
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3">
      <header className="font-medium text-lg">New Chat</header>
      {!uploadedDoc ? (
        <div className="flex w-full h-full">
          <WelcomeBanner />
          <UploadZone onUploadComplete={setUploadedDoc} />
        </div>
      ): (
        <ChatSplitView 
          document={uploadedDoc}
          onDeleteDoc={() => setUploadedDoc(null)}  
          messages={messages}
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          disableButton={status !== 'ready' || input.trim() === ''}
          status={status}
        />
      )}
    </div>
  )
}

export default Page