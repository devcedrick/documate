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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"

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
              chats.map((chat) => {
                const isActive = pathname === `/c/${chat.id}`
                const title = chat.document?.doc_title || chat.document?.file_name || 'Untitled'
                
                return (
                  <SidebarMenuItem key={chat.id} className="flex items-center gap-1 min-w-0 group/item">
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={title}
                      className="flex-1 min-w-0"
                    >
                      <Link href={`/c/${chat.id}`}>
                        <span className="truncate">{title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {/* DROPDOWN MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem onClick={() => console.log('Rename', chat.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => console.log('Delete', chat.id)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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