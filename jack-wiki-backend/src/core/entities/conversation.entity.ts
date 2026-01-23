export interface ConversationEntity {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateConversationData {
  title?: string
}

export interface UpdateConversationData {
  title?: string
}
