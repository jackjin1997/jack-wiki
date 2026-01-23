import { z } from 'zod'

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
})

export const getConversationSchema = z.object({
  id: z.string().uuid(),
})

export const listConversationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const deleteConversationSchema = z.object({
  id: z.string().uuid(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type GetConversationInput = z.infer<typeof getConversationSchema>
export type ListConversationsInput = z.infer<typeof listConversationsSchema>
export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>
