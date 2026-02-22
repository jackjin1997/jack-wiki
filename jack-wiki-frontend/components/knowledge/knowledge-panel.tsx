'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Search, BookOpen, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'upload' | 'search'

export function KnowledgePanel() {
  const [tab, setTab] = useState<Tab>('upload')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-card/50 px-4 py-3">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">知识库</h1>
        <div className="ml-auto flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab('upload')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              tab === 'upload'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Upload className="h-3 w-3" />
            上传
          </button>
          <button
            onClick={() => setTab('search')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              tab === 'search'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Search className="h-3 w-3" />
            搜索
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'upload' ? <UploadTab /> : <SearchTab />}
      </div>
    </div>
  )
}

function UploadTab() {
  const utils = trpc.useUtils()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceType, setSourceType] = useState<'text' | 'markdown' | 'url'>('text')

  const uploadMutation = trpc.knowledge.upload.useMutation({
    onSuccess: () => {
      setTitle('')
      setContent('')
      void utils.knowledge.list.invalidate()
    },
  })

  const handleUpload = () => {
    if (!title.trim() || !content.trim()) return
    uploadMutation.mutate({ title, content, sourceType })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">标题</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="知识条目标题"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">内容</label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as typeof sourceType)}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">纯文本</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="粘贴要入库的文本内容…"
            rows={12}
            className="resize-y text-sm"
          />
        </div>

        {uploadMutation.isError && (
          <p className="text-xs text-destructive">{uploadMutation.error.message}</p>
        )}

        {uploadMutation.isSuccess && (
          <p className="text-xs text-emerald-500">上传成功，已完成向量化 ✓</p>
        )}

        <Button
          onClick={handleUpload}
          disabled={!title.trim() || !content.trim() || uploadMutation.isPending}
          className="w-full gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploadMutation.isPending ? '向量化中…' : '上传并索引'}
        </Button>
      </div>
    </div>
  )
}

function SearchTab() {
  const [inputQuery, setInputQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const { data: results, isFetching } = trpc.knowledge.search.useQuery(
    { query: submittedQuery, topK: 5 },
    { enabled: !!submittedQuery }
  )

  const handleSearch = () => {
    if (inputQuery.trim()) setSubmittedQuery(inputQuery.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const similarityColor = (s: number) =>
    s >= 0.7 ? 'success' : s >= 0.5 ? 'default' : 'outline'

  return (
    <div className="flex h-full flex-col">
      {/* Search input */}
      <div className="border-b p-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="语义搜索知识库…"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            onClick={handleSearch}
            disabled={!inputQuery.trim() || isFetching}
            size="icon"
            className="h-7 w-7 rounded-lg"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-3 p-4">
          {isFetching && (
            <div className="py-8 text-center text-sm text-muted-foreground">搜索中…</div>
          )}

          {!isFetching && submittedQuery && results?.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              没有找到相关内容
            </div>
          )}

          {!submittedQuery && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              输入关键词或问题，进行语义搜索
            </div>
          )}

          {results?.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Badge variant={similarityColor(r.similarity) as any}>
                  {(r.similarity * 100).toFixed(0)}% 相关
                </Badge>
                {r.chunkIndex !== undefined && (
                  <span className="text-[10px] text-muted-foreground">
                    片段 #{r.chunkIndex + 1}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {r.chunkText}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
