"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { SidebarTrigger, SidebarMenuButton, SidebarMenu } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"
import { Plus, ChevronUp, Settings, LogOut } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatContext } from "@/hooks/use-chat-context"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { usePathname } from "next/navigation"

interface ChatConversation {
  id: string
  created_at: string
  document: {
    doc_title: string | null
    file_name: string
  } | null
}

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  const user = useChatContext();
  const firstName = user?.firstName ?? "Unknown";
  const lastName = user?.lastName ?? "Profile";
  const pathname = usePathname();

  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          document:documents (doc_title, file_name)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const transformed = data.map(chat => {
          const doc = Array.isArray(chat.document) 
            ? chat.document[0] 
            : chat.document;
          return {
            ...chat,
            document: doc || null
          };
        });
        setChats(transformed as ChatConversation[]);
      }
      setLoading(false);
    };

    fetchChats();
  }, [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* ROW 1 - Header: Logo + App Name + SidebarTrigger */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center justify-start gap-1.5 ${open ? '': 'hidden'}`}>
            <Image src='/icon.png' alt="DocuMate Logo" width={22} height={22}/>
            <span className="font-semibold">DocuMate</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger size="lg" />
            </TooltipTrigger>
            <TooltipContent side="right" className={open ? 'hidden' : ''}>
              {!open && "Expand"}
            </TooltipContent>
          </Tooltip>
        </div>
        {/* ROW 2 - Header: New Chat Button */}
        <SidebarMenuButton className="mt-3" tooltip='New Chat' asChild>
          <Link href={'/c'}>
            <Plus/> 
            <span className="text-base">New Chat</span>
          </Link>
        </SidebarMenuButton>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className={!open ? 'hidden' : ''}>
          <SidebarGroupLabel className="truncate">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-muted-foreground text-sm">No conversations yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                chats.map((chat) => {
                  const isActive = pathname === `/c/${chat.id}`;
                  const title = chat.document?.doc_title || chat.document?.file_name || 'Untitled';
                  
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
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={!open ? 'hidden' : ''}>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className='font-medium truncate' >
                  {firstName} {lastName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-60"
                side="top"
                align="end"
              >
                <DropdownMenuItem>
                  <Settings/>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <LogOut className="text-destructive" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}