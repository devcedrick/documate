import React from 'react'
import ChatInput from './chat-input'

const ChatPanel = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full'>
      {/* WELCOME */}
      <div className="mb-8 text-center">
        <p className="text-lg">
         {` I’m here to help you with your document. Where should we start? `}
        </p>
      </div>

      {/* CHAT INPUT */}
      <ChatInput />
    </div>
  )
}

export default ChatPanel
