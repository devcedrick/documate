"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, MoreHorizontal, Check, X } from "lucide-react"
import { ChatConversation } from "@/hooks/use-chat-operations"

interface ChatItemProps {
  chat: ChatConversation
  isEditing: boolean
  editTitle: string
  setEditTitle: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onRenameStart: (chat: ChatConversation) => void
  onRenameCancel: () => void
  onRenameSubmit: (chatId: string) => void
  onDelete: (chatId: string) => void
  onKeyDown: (e: React.KeyboardEvent, chatId: string) => void
}

export function ChatItem({
  chat,
  isEditing,
  editTitle,
  setEditTitle,
  inputRef,
  onRenameStart,
  onRenameCancel,
  onRenameSubmit,
  onDelete,
  onKeyDown,
}: ChatItemProps) {
  const pathname = usePathname()
  const isActive = pathname === `/c/${chat.id}`
  const title = chat.document?.doc_title || chat.document?.file_name || 'Untitled'

  return (
    <SidebarMenuItem className="flex items-center gap-1 min-w-0 group/item">
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1 min-w-0 px-2 py-1">
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, chat.id)}
            onBlur={() => onRenameSubmit(chat.id)}
            className="h-7 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onRenameSubmit(chat.id)}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onRenameCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
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
              <DropdownMenuItem onClick={() => onRenameStart(chat)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(chat.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </SidebarMenuItem>
  )
}
