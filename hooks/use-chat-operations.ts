"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { deleteChat, renameChat } from "@/app/(authenticated)/c/actions/chat-actions"
import { toast } from "sonner"

export interface ChatConversation {
  id: string
  created_at: string
  document: {
    doc_title: string | null
    file_name: string
  } | null
}

export function useChatOperations(
  setChats: React.Dispatch<React.SetStateAction<ChatConversation[]>>
) {
  const pathname = usePathname()
  const router = useRouter()
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingChatId])

  const handleRenameStart = useCallback((chat: ChatConversation) => {
    const title = chat.document?.doc_title || chat.document?.file_name || 'Untitled'
    setEditTitle(title)
    setEditingChatId(chat.id)
  }, [])

  const handleRenameCancel = useCallback(() => {
    setEditingChatId(null)
    setEditTitle("")
  }, [])

  const handleRenameSubmit = useCallback(async (chatId: string) => {
    if (!editTitle.trim()) {
      handleRenameCancel()
      return
    }

    const result = await renameChat(chatId, editTitle.trim())
    
    if (result.error) {
      toast.error("Failed to rename", { description: result.error })
    } else {
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, document: chat.document ? { ...chat.document, doc_title: editTitle.trim() } : null }
          : chat
      ))
      toast.success("Chat renamed successfully")
    }
    
    handleRenameCancel()
  }, [editTitle, handleRenameCancel, setChats])

  const handleDelete = useCallback(async (chatId: string) => {
    const result = await deleteChat(chatId)
    
    if (result.error) {
      toast.error("Failed to delete", { description: result.error })
    } else {
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      toast.success("Chat deleted successfully")
      
      if (pathname === `/c/${chatId}`) {
        router.push('/c')
      }
    }
  }, [pathname, router, setChats])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRenameSubmit(chatId)
    } else if (e.key === 'Escape') {
      handleRenameCancel()
    }
  }, [handleRenameSubmit, handleRenameCancel])

  return {
    editingChatId,
    editTitle,
    setEditTitle,
    inputRef,
    handleRenameStart,
    handleRenameCancel,
    handleRenameSubmit,
    handleDelete,
    handleKeyDown,
  }
}
