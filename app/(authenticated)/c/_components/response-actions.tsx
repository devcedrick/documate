"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy, Repeat } from 'lucide-react'
import { UIMessage } from '@ai-sdk/react'
import { ChatRequestOptions } from 'ai'

interface ResponseActionsProps {
  message: UIMessage
  handleRegeneration: (options?: {messageId?: string} & ChatRequestOptions) => Promise<void>;
}

const ResponseActions = ({
  message,
  handleRegeneration
}: ResponseActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = async () => {
    const textParts = message.parts.filter(part => part.type === 'text') as { text: string }[];
    const fullText = textParts.map(part => part.text).join('\n');
    await navigator.clipboard.writeText(fullText);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="flex gap-1 mt-1">
      <Button 
        variant='ghost' 
        size='icon'
        onClick={handleCopy}
      >
        {isCopied ? 
          <Check className="h-4 w-4 text-green-400" strokeWidth={3}/> : 
          <Copy className="h-4 w-4" />
        }
      </Button>
      <Button 
        variant='ghost' size='icon' 
        onClick={
          async () => await handleRegeneration({ messageId: message.id })
        }>
          <Repeat className="h-10 w-10" />
      </Button>
    </div>
  )
}

export default ResponseActions
