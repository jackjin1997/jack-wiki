export interface PersonaEntity {
  id: string
  name: string
  nameEn?: string
  description?: string
  systemPrompt: string
  avatar?: string
  category: string
  isActive: boolean
  createdAt: Date
}
