"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { ChatItem } from "@/components/chat-item"
import { ChatConversation, useChatOperations } from "@/hooks/use-chat-operations"

interface RecentChatsProps {
  isOpen: boolean
}

export function RecentChats({ isOpen }: RecentChatsProps) {
  const pathname = usePathname()
  const [chats, setChats] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  
  const {
    editingChatId,
    editTitle,
    setEditTitle,
    inputRef,
    handleRenameStart,
    handleRenameCancel,
    handleRenameSubmit,
    handleDelete,
    handleKeyDown,
  } = useChatOperations(setChats)

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true)
      const supabase = createClient()
      const {data: {user}} = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          document:documents (doc_title, file_name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const transformed = data.map(chat => {
          const doc = Array.isArray(chat.document) 
            ? chat.document[0] 
            : chat.document
          return {
            ...chat,
            document: doc || null
          }
        })
        setChats(transformed as ChatConversation[])
      }
      setLoading(false)
    }

    fetchChats()
  }, [pathname])

  if (!isOpen) return null

  return (
    <SidebarGroup className="flex-1 min-h-0">
      <SidebarGroupLabel className="truncate">Recent Chats</SidebarGroupLabel>
      <SidebarGroupContent className="min-h-0 overflow-hidden">
        <ScrollArea className="h-full max-h-[calc(100vh-220px)] [&>[data-slot=scroll-area-viewport]>div]:block!">
          <SidebarMenu>
            {chats.length === 0 ? (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span className="text-muted-foreground text-sm">No conversations yet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isEditing={editingChatId === chat.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  inputRef={inputRef}
                  onRenameStart={handleRenameStart}
                  onRenameCancel={handleRenameCancel}
                  onRenameSubmit={handleRenameSubmit}
                  onDelete={handleDelete}
                  onKeyDown={handleKeyDown}
                />
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}