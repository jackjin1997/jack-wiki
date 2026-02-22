'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void | Promise<void>
  isLoading?: boolean
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea up to 200px
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [message])

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return
    const text = message
    setMessage('')
    await onSend(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="relative flex items-end gap-2 rounded-xl border border-input bg-card px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring transition-shadow">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="发消息… (Enter 发送，Shift+Enter 换行)"
        disabled={isLoading}
        rows={1}
        className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed min-h-[24px]"
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
