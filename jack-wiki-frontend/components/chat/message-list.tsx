'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const visible = messages.filter(m => m.role !== 'system')

  if (visible.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">还没有消息，开始对话吧</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {visible.map(message => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.role === 'assistant' && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          )}

          <div
            className={cn(
              'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              message.role === 'user'
                ? 'rounded-tr-sm bg-primary text-primary-foreground'
                : 'rounded-tl-sm bg-card border border-border text-foreground'
            )}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1">
                <ReactMarkdown
                  components={{
                    code(props) {
                      const { children, className } = props
                      const match = /language-(\w+)/.exec(className || '')
                      const isBlock = String(children).includes('\n')
                      return isBlock && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ borderRadius: '0.5rem', margin: '0.5rem 0', fontSize: '0.78rem' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
