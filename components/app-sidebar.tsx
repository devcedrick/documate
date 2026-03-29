"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { SidebarTrigger, SidebarMenuButton, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatContext } from "@/hooks/use-chat-context"
import { RecentChats } from "./recent-chats"

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
      <SidebarContent className="flex-1 min-h-0 overflow-hidden">
        <RecentChats isOpen={open} />
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