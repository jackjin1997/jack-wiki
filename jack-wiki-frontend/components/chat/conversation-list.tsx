'use client'

import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading, refetch } = trpc.conversation.list.useQuery({
    limit: 50,
    offset: 0,
  })

  const createMutation = trpc.conversation.create.useMutation({
    onSuccess: data => {
      void refetch()
      onSelect(data.id)
    },
  })

  const deleteMutation = trpc.conversation.delete.useMutation({
    onSuccess: () => { void refetch() },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs text-muted-foreground">加载中…</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={() => createMutation.mutate({})}
          disabled={createMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          新建对话
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2 pb-2">
          {conversations?.map(conv => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors cursor-pointer',
                selectedId === conv.id
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate text-xs">{conv.title}</span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  if (confirm('删除这个对话？')) {
                    deleteMutation.mutate({ id: conv.id })
                  }
                }}
                className="hidden shrink-0 rounded p-0.5 text-muted-foreground/40 hover:text-destructive group-hover:block"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">
              还没有对话
              <br />
              点击上方新建
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
