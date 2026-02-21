import { pgTable, uuid, text, timestamp, vector, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull().default('New Conversation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  model: text('model'), // AI model used (e.g., 'gemini-pro', 'claude-3', 'gpt-4')
  personaId: uuid('persona_id').references(() => personas.id),
  metadata: jsonb('metadata'), // Additional metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Personas (AI Characters) table
export const personas = pgTable('personas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  avatar: text('avatar'),
  category: text('category').notNull(), // e.g., 'philosopher', 'psychologist', 'investor'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Knowledge items table
export const knowledgeItems = pgTable('knowledge_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  fileUrl: text('file_url'),
  sourceType: text('source_type').notNull(), // 'pdf', 'markdown', 'text', 'url'
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Embeddings table (pgvector for semantic search)
export const embeddings = pgTable('embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  knowledgeItemId: uuid('knowledge_item_id')
    .references(() => knowledgeItems.id, { onDelete: 'cascade' })
    .notNull(),
  embedding: vector('embedding', { dimensions: 3072 }), // Google gemini-embedding-001 dimensions
  chunkText: text('chunk_text').notNull(), // The actual text chunk
  chunkIndex: text('chunk_index'), // Index within the document
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Skills table (for LangChain skills)
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  config: jsonb('config').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// MCP Tools table
export const mcpTools = pgTable('mcp_tools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  server: text('server').notNull(),
  config: jsonb('config'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  persona: one(personas, {
    fields: [messages.personaId],
    references: [personas.id],
  }),
}))

export const personasRelations = relations(personas, ({ many }) => ({
  messages: many(messages),
}))

export const knowledgeItemsRelations = relations(knowledgeItems, ({ many }) => ({
  embeddings: many(embeddings),
}))

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  knowledgeItem: one(knowledgeItems, {
    fields: [embeddings.knowledgeItemId],
    references: [knowledgeItems.id],
  }),
}))

// Types exported for use in the application
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type Persona = typeof personas.$inferSelect
export type NewPersona = typeof personas.$inferInsert

export type KnowledgeItem = typeof knowledgeItems.$inferSelect
export type NewKnowledgeItem = typeof knowledgeItems.$inferInsert

export type Embedding = typeof embeddings.$inferSelect
export type NewEmbedding = typeof embeddings.$inferInsert

export type Skill = typeof skills.$inferSelect
export type NewSkill = typeof skills.$inferInsert

export type McpTool = typeof mcpTools.$inferSelect
export type NewMcpTool = typeof mcpTools.$inferInsert
