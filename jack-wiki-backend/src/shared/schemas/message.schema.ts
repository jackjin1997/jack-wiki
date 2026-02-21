import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  model: z.enum([
    // Anthropic
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    // Google
    'gemini-3.1-pro',
    'gemini-3.0-pro',
    'gemini-2.5-flash',
    // OpenAI
    'gpt-4o',
    'o3-mini',
  ]),
  personaId: z.string().uuid().optional(),
})

export const listMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ListMessagesInput = z.infer<typeof listMessagesSchema>
