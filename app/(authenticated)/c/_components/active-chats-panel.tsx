"use client"

import React from 'react'
import { UIMessage } from '@ai-sdk/react'
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActiveChatPanelProps {
  messages: UIMessage[];
}

const ActiveChatPanel = ({
  messages
}: ActiveChatPanelProps) => {
  return (
    <ScrollArea className='flex-1 w-full min-h-0 p-2 mb-2'>
      <div className='flex flex-col gap-4 p-3'>
        {
          messages.map((msg, index) => {
            return (
              <div className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} whitespace-pre-wrap`} key={msg.id || index}>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end bg-primary/10 text-primary max-w-[70%]' : ''} p-3 rounded-lg `}>
                  {msg.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <div key={`${msg.id}-${i}`}>{part.text}</div>;
                    }
                  })}
                </div>
              </div>
            )
          })
        }
      </div>
    </ScrollArea>
  )
}

export default ActiveChatPanel
