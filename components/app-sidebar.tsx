"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
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
        <SidebarMenuButton className="mt-3" tooltip='New Chat'>
          <Plus/> 
          <span className="text-base">New Chat</span>
        </SidebarMenuButton>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter className={!open ? 'hidden' : ''}>
        <Separator />
        <span className="text-sm ml-1.5">Mode: Unknown</span>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  User Profile
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