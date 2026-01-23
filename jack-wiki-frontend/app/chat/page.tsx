'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationList } from '@/components/chat/conversation-list'
import { useState } from 'react'

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="flex h-screen">
      {/* Sidebar with conversation list */}
      <div className="w-64 border-r bg-muted/30">
        <ConversationList
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        <ChatInterface conversationId={selectedConversationId} />
      </div>
    </div>
  )
}
