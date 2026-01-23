'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ModelSelector } from './model-selector'
import { PersonaSelector } from './persona-selector'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatInterfaceProps {
  conversationId: string | null
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState('gemini-pro')
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages, refetch } = trpc.message.list.useQuery(
    {
      conversationId: conversationId!,
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!conversationId,
    }
  )

  const sendMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      void refetch()
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Welcome to Jack Wiki</h2>
          <p className="mt-2 text-muted-foreground">
            Select a conversation or create a new one to start chatting
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
      {/* Header with selectors */}
      <div className="flex items-center gap-4 border-b p-4">
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        <PersonaSelector value={selectedPersona} onChange={setSelectedPersona} />
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <MessageList messages={messages || []} />
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <MessageInput onSend={handleSend} isLoading={sendMutation.isPending} />
      </div>
    </div>
  )
}
