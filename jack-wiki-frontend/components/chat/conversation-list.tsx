'use client'

import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading } = trpc.conversation.list.useQuery({
    limit: 50,
    offset: 0,
  })

  const createMutation = trpc.conversation.create.useMutation({
    onSuccess: data => {
      onSelect(data.id)
    },
  })

  const handleNewConversation = async () => {
    createMutation.mutate({})
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <Button onClick={handleNewConversation} className="w-full" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {conversations?.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                selectedId === conv.id && 'bg-accent'
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </button>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No conversations yet.
              <br />
              Create a new one to start!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
