'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationList } from '@/components/chat/conversation-list'
import { KnowledgePanel } from '@/components/knowledge/knowledge-panel'
import { KnowledgeSidebar } from '@/components/knowledge/knowledge-sidebar'
import { MessageSquare, BookOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'chat' | 'knowledge'

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="flex w-60 shrink-0 flex-col border-r bg-card">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Jack Wiki</span>
        </div>

        {/* Mode nav */}
        <div className="flex gap-1 border-b p-2">
          <button
            onClick={() => setMode('chat')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors',
              mode === 'chat'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            onClick={() => setMode('knowledge')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors',
              mode === 'knowledge'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Wiki
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          {mode === 'chat' ? (
            <ConversationList
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
            />
          ) : (
            <KnowledgeSidebar />
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {mode === 'chat' ? (
          <ChatInterface conversationId={selectedConversationId} />
        ) : (
          <KnowledgePanel />
        )}
      </div>
    </div>
  )
}
