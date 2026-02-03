"use client"

import React, {useState, useEffect} from 'react'
import DocumentPreview from './document-preview'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ChatPanel from './chat-panel'
import ChatInput from "./chat-input";
import { WelcomeBanner } from "./welcome-banner";
import { UploadedDocument } from '../page'
import ActiveChatPanel from './active-chats-panel';

interface ChatSplitViewProps {
  document: UploadedDocument | null;
  messages?: any[];
  input?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteDoc?: () => void; 
  disableButton: boolean;
}

const ChatSplitView = ({
  document,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  onDeleteDoc,
  disableButton
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
        <ResizablePanel className="flex flex-col h-full overflow-hidden p-3">
          {!messages || messages.length === 0 ? (
            <div className='flex flex-col items-start justify-start w-full gap-2 mb-5 flex-1'>
              <h1 className="text-3xl font-semibold">Ready to chat with your doc!</h1>
              <h2 className="text-base text-muted-foreground ">
                {`Feel free to ask for a summary, specific details, or just start a conversation about the content. What’s on your mind?`}
              </h2>
            </div>
          ) : (
            <ActiveChatPanel messages={messages} />
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
