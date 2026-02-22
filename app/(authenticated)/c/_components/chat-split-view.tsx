"use client"

import React, {useState, useEffect} from 'react'
import DocumentPreview from './document-preview'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ChatInput from "./chat-input";
import { WelcomeBanner } from "./welcome-banner";
import { UploadedDocument } from '../page'
import ActiveChatPanel from './active-chats-panel';
import { ChatRequestOptions } from 'ai';

interface ChatSplitViewProps {
  document: UploadedDocument | null;
  messages?: any[];
  input?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteDoc?: () => void; 
  disableButton: boolean;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  regenerate: (options?: {
      messageId?: string
    } & ChatRequestOptions) => Promise<void>;
}

const ChatSplitView = ({
  document,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  onDeleteDoc,
  disableButton,
  status,
  regenerate
}: ChatSplitViewProps) => {
  if(!document) return;

  return (
    <div className='flex items-center justify-center w-full h-full'>
      <ResizablePanelGroup className='border-2 rounded-lg p-3'>
        <ResizablePanel defaultSize={300} minSize={250} maxSize={500} className='p-3'>
          <h3 className="font-medium mb-3">Files</h3>
          <DocumentPreview 
            doc={document} 
            onDelete={onDeleteDoc} 
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className={`flex flex-col overflow-hidden p-3 ${!messages || messages.length === 0 ? 'justify-center' : ''}`}>
          {!messages || messages.length === 0 ? (
            <div className='mb-10'>
              <h1 className="text-3xl font-semibold">Ready to chat with your doc!</h1>
              <h2 className="text-base text-muted-foreground ">
                {`Feel free to ask for a summary, specific details, or just start a conversation about the content. What’s on your mind?`}
              </h2>
            </div>
          ) : (
            <ActiveChatPanel messages={messages} status={status}  handleRegeneration={regenerate}/>
          )}
          <ChatInput 
            className="mt-auto shrink-0"
            input={input || ""}
            handleInputChange={handleInputChange!}
            handleSubmit={handleSubmit!}
            isSendDisabled={disableButton}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ChatSplitView
