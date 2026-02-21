/**
 * CXP - Context eXchange Protocol v0.1
 *
 * A standard for structured context exchange between AI agents.
 * Designed to be minimal, self-describing, extensible, and human-readable.
 */

// ============================================================
// Core Protocol Types
// ============================================================

/**
 * The root Context Protocol structure
 */
export interface ContextProtocol {
  /** Protocol identifier */
  protocol: 'cxp'

  /** Protocol version (semver) */
  version: '0.1'

  /** Source information - where this context came from */
  source: ContextSource

  /** Core context content */
  context: ContextContent

  /** Optional handoff guidance for downstream agents */
  handoff?: ContextHandoff

  /** Extension fields for domain-specific data */
  extensions?: Record<string, unknown>
}

// ============================================================
// Source Information
// ============================================================

export type ContextSourceType = 'conversation' | 'document' | 'task' | 'agent-output'

export interface ContextSource {
  /** Type of source that generated this context */
  type: ContextSourceType

  /** Unique identifier of the source */
  id: string

  /** Agent/system that generated this context */
  agent?: string

  /** ISO 8601 timestamp when context was generated */
  generatedAt: string

  /** Optional: when this context expires */
  expiresAt?: string

  /** Optional: human-readable title */
  title?: string
}

// ============================================================
// Core Context Content
// ============================================================

export type ContextStatus = 'in_progress' | 'completed' | 'blocked' | 'abandoned'

export interface ContextContent {
  /** The core goal or objective */
  goal: string

  /** Constraints or limitations */
  constraints?: string[]

  /** Condensed summary of the context (recommended < 500 words) */
  summary: string

  /** Current status */
  status: ContextStatus

  /** Key decisions that have been made */
  decisions: Decision[]

  /** Confirmed facts and information */
  facts: Fact[]

  /** Unresolved questions */
  openQuestions: string[]

  /** Key entities referenced in this context */
  entities?: Entity[]
}

// ============================================================
// Supporting Types
// ============================================================

export interface Decision {
  /** What was decided */
  what: string

  /** Why this decision was made */
  why?: string

  /** Alternatives that were considered but rejected */
  alternatives?: string[]

  /** When this decision was made (ISO 8601) */
  madeAt?: string
}

export type FactConfidence = 'confirmed' | 'inferred' | 'assumed'

export interface Fact {
  /** The factual statement */
  statement: string

  /** Confidence level */
  confidence: FactConfidence

  /** Source of this fact */
  source?: string
}

export type EntityType = 'person' | 'concept' | 'code' | 'file' | 'url' | 'tool' | 'other'

export interface Entity {
  /** Entity name */
  name: string

  /** Entity type */
  type: EntityType

  /** Brief description */
  description?: string

  /** Reference link or path */
  reference?: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

// ============================================================
// Handoff Guidance
// ============================================================

export interface ContextHandoff {
  /** Suggested next steps for downstream agent */
  nextSteps?: string[]

  /** Warnings or risks to be aware of */
  warnings?: string[]

  /** Capabilities required by downstream agent */
  requiredCapabilities?: string[]

  /** Suggested agent/model for continuation */
  suggestedAgent?: string

  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================
// Builder Input Types (for generator)
// ============================================================

export interface ContextGeneratorInput {
  /** Source type */
  sourceType: ContextSourceType

  /** Source identifier */
  sourceId: string

  /** Agent identifier */
  agent?: string

  /** Title for the context */
  title?: string

  /** Raw content to be processed (e.g., conversation messages) */
  rawContent: string

  /** Additional hints for the generator */
  hints?: {
    focusOn?: string[]
    ignore?: string[]
    maxSummaryLength?: number
  }
}

export interface GeneratedContext {
  context: ContextProtocol
  /** Token count of the generated context */
  tokenCount?: number
  /** Processing time in ms */
  processingTime?: number
}
