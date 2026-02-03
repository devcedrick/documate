"use client"

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React from 'react'
import ChatContextProvider from '@/contexts/chat-context'


export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <ChatContextProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-dvh max-h-dvh p-5">
          {children}
        </main>
      </SidebarProvider>
    </ChatContextProvider>
  );
}
