'use client'

import { useState, useRef, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Jack 擅长哪些技术？',
  'jack-wiki 是什么项目？',
  '怎么联系 Jack？',
]

export function AIChatWidget() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const createConversation = trpc.conversation.create.useMutation({
    onSuccess: (conv) => setConversationId(conv.id),
  })

  const askJack = trpc.profile.askJack.useMutation({
    onSuccess: (reply) => {
      setMessages(prev => [...prev, { id: reply.id, role: 'assistant', content: reply.content }])
    },
  })

  const isPending = createConversation.isPending || askJack.isPending

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: trimmed }])

    let convId = conversationId
    if (!convId) {
      const conv = await createConversation.mutateAsync({})
      convId = conv.id
    }
    await askJack.mutateAsync({ conversationId: convId, message: trimmed })
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend(input)
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b px-4 py-3 bg-primary/5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-xs font-semibold">Ask about Jack</p>
          <p className="text-[10px] text-muted-foreground">由 AI + 知识库驱动</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-72">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center pt-2">
                有任何问题，直接问我
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => void handleSend(s)}
                    disabled={isPending}
                    className="rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm bg-muted text-foreground'
                )}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-0.5 prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问我关于 Jack 的任何问题…"
            disabled={isPending}
            className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <Button
            onClick={() => void handleSend(input)}
            disabled={!input.trim() || isPending}
            size="icon"
            className="h-6 w-6 shrink-0 rounded-md"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
