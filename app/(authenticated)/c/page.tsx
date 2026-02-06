"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatSplitView from "./_components/chat-split-view"
import UploadZone from "./_components/upload-zone"
import { WelcomeBanner } from "./_components/welcome-banner"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export interface UploadedDocument {
  id: string
  file_name: string
  file_path: string
  file_size: number
  [key: string]: unknown
}

// NEW CHAT PAGE
const Page = () => {
  const router = useRouter();
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null)
  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");


  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onData: ({ data, type }) => {
      if (type === 'data-chat_created') {
        const chatData = data as { chatId: string };
        setChatId(chatData.chatId);
      }
    },
  });

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
      { body: { docId: uploadedDoc?.id } }
    );
    setInput("");
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="font-medium text-lg">{chatId ? chatId : 'New Chat'}</header>
      {!uploadedDoc ? (
        <div className="flex w-full h-full">
          <WelcomeBanner />
          <UploadZone onUploadComplete={setUploadedDoc} />
        </div>
      ): (
        <ChatSplitView 
          document={uploadedDoc}
          onDeleteDoc={() => setUploadedDoc}  
          messages={messages}
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          disableButton={status !== 'ready' || input.trim() === ''}
        />
      )}
    </div>
  )
}

export default Page