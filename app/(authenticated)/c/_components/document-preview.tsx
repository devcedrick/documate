"use client"

import { useState, useCallback } from "react"
import { FileText, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { deleteDocument } from "../actions/delete-document"

interface DocumentPreviewProps {
  doc: {
    id: string
    file_name: string
    file_path: string
    file_size: number
  }
  onDelete?: () => void
}

export default function DocumentPreview({ doc, onDelete }: DocumentPreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    const result = await deleteDocument(doc.id, doc.file_path)

    if (result.error) {
      toast.error("Delete Failed", { description: result.error })
    } else {
      toast.success("File removed")
      onDelete?.()
    }
    setIsDeleting(false)
  }, [doc, onDelete])

  return (
    <div className="relative group flex items-center w-full bg-accent p-3 rounded-md gap-4 border">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute -top-2 -right-2 p-1 bg-destructive/50 text-destructive-foreground rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-destructive/80 disabled:opacity-50"
        aria-label="Delete file"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </button>
      <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{doc.file_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
        </p>
      </div>
    </div>
  )
}
