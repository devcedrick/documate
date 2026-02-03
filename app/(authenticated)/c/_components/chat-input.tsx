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

interface ChatInputProps {
  className?: string;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSendDisabled: boolean;
}

const ChatInput = ({
  className,
  input,
  handleInputChange,
  handleSubmit,
  isSendDisabled
}: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <InputGroup className={cn(className)}>
      <InputGroupTextarea
        placeholder='Ask a question about your document…' className='min-w-full max-h-35' 
        value={input}
        onChange={handleInputChange}
      />
        <InputGroupAddon align='block-end' >
          <InputGroupButton variant='default' className='px-2! py-4! ml-auto ' type='submit' disabled={isSendDisabled}>
            <Send /> Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

export default ChatInput
