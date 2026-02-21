/**
 * Zod schemas for runtime validation of Context Protocol
 */
import { z } from 'zod'

// ============================================================
// Supporting Schemas
// ============================================================

export const decisionSchema = z.object({
  what: z.string().min(1),
  why: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
  madeAt: z.string().datetime().optional(),
})

export const factConfidenceSchema = z.enum(['confirmed', 'inferred', 'assumed'])

export const factSchema = z.object({
  statement: z.string().min(1),
  confidence: factConfidenceSchema,
  source: z.string().optional(),
})

export const entityTypeSchema = z.enum([
  'person',
  'concept',
  'code',
  'file',
  'url',
  'tool',
  'other',
])

export const entitySchema = z.object({
  name: z.string().min(1),
  type: entityTypeSchema,
  description: z.string().optional(),
  reference: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================
// Source Schema
// ============================================================

export const contextSourceTypeSchema = z.enum([
  'conversation',
  'document',
  'task',
  'agent-output',
])

export const contextSourceSchema = z.object({
  type: contextSourceTypeSchema,
  id: z.string().min(1),
  agent: z.string().optional(),
  generatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  title: z.string().optional(),
})

// ============================================================
// Content Schema
// ============================================================

export const contextStatusSchema = z.enum([
  'in_progress',
  'completed',
  'blocked',
  'abandoned',
])

export const contextContentSchema = z.object({
  goal: z.string().min(1),
  constraints: z.array(z.string()).optional(),
  summary: z.string().min(1),
  status: contextStatusSchema,
  decisions: z.array(decisionSchema),
  facts: z.array(factSchema),
  openQuestions: z.array(z.string()),
  entities: z.array(entitySchema).optional(),
})

// ============================================================
// Handoff Schema
// ============================================================

export const contextHandoffSchema = z.object({
  nextSteps: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  suggestedAgent: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

// ============================================================
// Root Context Protocol Schema
// ============================================================

export const cxpSchema = z.object({
  protocol: z.literal('cxp'),
  version: z.literal('0.1'),
  source: contextSourceSchema,
  context: contextContentSchema,
  handoff: contextHandoffSchema.optional(),
  extensions: z.record(z.unknown()).optional(),
})

// ============================================================
// Type Exports (inferred from schemas)
// ============================================================

export type CXPSchema = z.infer<typeof cxpSchema>

/** @deprecated Use cxpSchema instead */
export const contextProtocolSchema = cxpSchema
export type ContextSourceSchema = z.infer<typeof contextSourceSchema>
export type ContextContentSchema = z.infer<typeof contextContentSchema>
export type ContextHandoffSchema = z.infer<typeof contextHandoffSchema>
export type DecisionSchema = z.infer<typeof decisionSchema>
export type FactSchema = z.infer<typeof factSchema>
export type EntitySchema = z.infer<typeof entitySchema>
