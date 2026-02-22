'use client'

import { trpc } from '@/lib/trpc'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Trash2 } from 'lucide-react'

const SOURCE_LABELS: Record<string, string> = {
  text: '文本',
  markdown: 'Markdown',
  pdf: 'PDF',
  url: 'URL',
}

export function KnowledgeSidebar() {
  const { data: items, isLoading, refetch } = trpc.knowledge.list.useQuery({
    limit: 50,
    offset: 0,
  })

  const deleteMutation = trpc.knowledge.delete.useMutation({
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
      <div className="border-b px-3 py-2.5">
        <p className="text-xs font-medium text-muted-foreground">
          知识库 · {items?.length ?? 0} 条
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2 py-2">
          {items?.map(item => (
            <div
              key={item.id}
              className="group flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors"
            >
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {SOURCE_LABELS[item.sourceType] ?? item.sourceType}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`删除「${item.title}」？`)) {
                    deleteMutation.mutate({ id: item.id })
                  }
                }}
                className="hidden shrink-0 rounded p-0.5 text-muted-foreground/40 hover:text-destructive group-hover:block mt-0.5"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {(!items || items.length === 0) && (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">
              还没有知识
              <br />
              在右侧上传添加
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
