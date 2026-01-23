import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  model: z.enum(['gemini-pro', 'claude-3-sonnet', 'gpt-4-turbo', 'gpt-4o']),
  personaId: z.string().uuid().optional(),
})

export const listMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ListMessagesInput = z.infer<typeof listMessagesSchema>
