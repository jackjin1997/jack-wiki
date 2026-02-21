import { z } from 'zod'

export const uploadKnowledgeSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  sourceType: z.enum(['pdf', 'markdown', 'text', 'url']),
  fileUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const searchKnowledgeSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5),
})

export const getKnowledgeItemSchema = z.object({
  id: z.string().uuid(),
})

export const listKnowledgeSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const deleteKnowledgeSchema = z.object({
  id: z.string().uuid(),
})
