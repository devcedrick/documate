"use client"

import React, { useEffect, useRef } from 'react'
import { UIMessage } from '@ai-sdk/react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from 'lucide-react'
import MarkdownRenderer from './markdown-renderer'

interface ActiveChatPanelProps {
  messages: UIMessage[];
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
}

const ThinkingIndicator = () => (
  <div className="w-full flex justify-start">
    <div className="flex items-center gap-2 p-3 rounded-lg text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Thinking...</span>
    </div>
  </div>
);

const ActiveChatPanel = ({
  messages,
  status
}: ActiveChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isThinking = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

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
                        return msg.role === 'assistant' 
                          ? <MarkdownRenderer key={`${msg.id}-${i}`} content={part.text} />
                          : <div key={`${msg.id}-${i}`}>{part.text}</div>;
                    }
                  })}
                </div>
              </div>
            )
          })
        }
        {isThinking && messages[messages.length - 1]?.role === 'user' && (
          <ThinkingIndicator />
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
}

export default ActiveChatPanel
