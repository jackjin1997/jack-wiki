'use client'

import { useState, useRef, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ModelSelector } from './model-selector'
import { PersonaSelector } from './persona-selector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Sparkles, FileJson } from 'lucide-react'

interface ChatInterfaceProps {
  conversationId: string | null
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages, refetch } = trpc.message.list.useQuery(
    { conversationId: conversationId!, limit: 50, offset: 0 },
    { enabled: !!conversationId }
  )

  const sendMutation = trpc.message.send.useMutation({
    onSuccess: () => { void refetch() },
  })

  const exportCXPMutation = trpc.conversation.exportCXP.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.cxp, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cxp-${conversationId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    onError: (error) => alert(`Export CXP failed: ${error.message}`),
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">Jack Wiki</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            从左侧选择或新建对话开始
          </p>
        </div>
      </div>
    )
  }

  const handleSend = async (message: string) => {
    if (!conversationId || !message.trim()) return
    await sendMutation.mutateAsync({
      conversationId,
      message,
      model: selectedModel,
      personaId: selectedPersona,
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card/50 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <PersonaSelector value={selectedPersona} onChange={setSelectedPersona} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportCXPMutation.mutate({ id: conversationId, model: selectedModel })}
          disabled={exportCXPMutation.isPending || !messages?.length}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <FileJson className="h-3.5 w-3.5" />
          {exportCXPMutation.isPending ? '导出中…' : 'Export CXP'}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <MessageList messages={messages ?? []} />
        {sendMutation.isPending && (
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card/30 p-4">
        <MessageInput onSend={handleSend} isLoading={sendMutation.isPending} />
      </div>
    </div>
  )
}
