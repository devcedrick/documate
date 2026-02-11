"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

interface ChatConversation {
  id: string
  created_at: string
  document: {
    doc_title: string | null
    file_name: string
  } | null
}

interface RecentChatsProps {
  isOpen: boolean
}

export function RecentChats({ isOpen }: RecentChatsProps) {
  const pathname = usePathname()
  const [chats, setChats] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          document:documents (doc_title, file_name)
        `)
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
      <SidebarGroupContent className="flex-1 min-h-0">
        <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
          <SidebarMenu>
            {loading ? (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span className="text-muted-foreground text-sm animate-pulse">Loading...</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : chats.length === 0 ? (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <span className="text-muted-foreground text-sm">No conversations yet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              chats.map((chat) => {
                const isActive = pathname === `/c/${chat.id}`
                const title = chat.document?.doc_title || chat.document?.file_name || 'Untitled'
                
                return (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={title}
                    >
                      <Link href={`/c/${chat.id}`}>
                        <span className="truncate">{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
