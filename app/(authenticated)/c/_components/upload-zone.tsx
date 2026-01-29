"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils" 
import { toast } from "sonner"  
import { uploadDocument } from "../actions/upload-document"
import { useChat } from "@/hooks/use-chat"

interface UploadZoneProps {
  onUploadComplete: (doc: any) => void
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const user = useChat();
  const useCase = user?.useCase;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("useCase", useCase || "general");

    const result = await uploadDocument(formData)

    if (result.error) {
      toast.error("Upload Failed", { description: result.error })
    } else {
      toast.success("File uploaded", { description: "Processing document..." })
      onUploadComplete(result.doc)
    }

    setIsUploading(false)
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/msword': ['.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1, 
    maxSize: 25 * 1024 * 1024, // 25MB limit
  })

  // Handle file type errors immediately
  if (fileRejections.length > 0) {
    const error = fileRejections[0].errors[0]
    if (error.code === "file-invalid-type") {
      toast.error("Invalid File", { description: "Only PDF, Doc/Docx, Txt are allowed." })
    }
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed transition-all cursor-pointer p-5",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isUploading && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />

      <div className="text-center space-y-4 p-4">
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium animate-pulse">Analyzing Document...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-10 w-10 text-primary animate-bounce" />
            <p className="text-sm font-medium text-primary">Drop PDF to start chat</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 bg-muted rounded-full">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Files up to 25MB (Strict Mode Active)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}