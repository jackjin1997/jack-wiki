export interface MessageEntity {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  personaId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface CreateMessageData {
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  personaId?: string
  metadata?: Record<string, unknown>
}
