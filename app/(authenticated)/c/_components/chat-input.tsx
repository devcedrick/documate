import React from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const ChatInput = ({className}:{className?: string}) => {
  return (
    <InputGroup className={cn(className)}>
      <InputGroupTextarea placeholder='Ask a question about your document…' className='min-w-full max-h-35' />
      <InputGroupAddon align='block-end' >
        <InputGroupButton variant='default' className='px-2! py-4! ml-auto'>
          <Send /> Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default ChatInput
