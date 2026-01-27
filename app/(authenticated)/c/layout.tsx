"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React, { useState, useEffect } from 'react'
import UploadZone from './_components/upload-zone'
import DocumentPreview from './_components/document-preview'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ChatPanel from './_components/chat-panel'
import ChatInput from "./_components/chat-input";
import ChatContextProvider from '@/contexts/chat-context'
import { WelcomeBanner } from "./_components/welcome-banner";

interface UploadedDocument {
  id: string
  file_name: string
  file_path: string
  file_size: number
  [key: string]: unknown
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Warn user before refreshing/leaving if a file is uploaded
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadedDoc) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [uploadedDoc])

  if (!isMounted) {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ChatContextProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-dvh max-h-dvh p-5">
          <header>This is the header part</header>
          <div className='flex items-center justify-center w-full h-full'>
            {uploadedDoc ? (
              <ResizablePanelGroup className='border-2 rounded-lg p-3'>
                <ResizablePanel defaultSize={300} minSize={250} maxSize={500} className='p-3'>
                  <h3 className="font-medium mb-3">Files</h3>
                  <DocumentPreview 
                    doc={uploadedDoc} 
                    onDelete={() => setUploadedDoc(null)} 
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel className="flex flex-col items-center justify-center flex-1 p-5">
                  {children}
                  <ChatInput />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <>
                <WelcomeBanner />
                <UploadZone onUploadComplete={setUploadedDoc} />
              </>
            )}
          </div>
        </main>
      </SidebarProvider>
    </ChatContextProvider>
  );
}
