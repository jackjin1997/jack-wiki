/**
 * Context Parser
 *
 * Utilities for parsing, validating, and consuming Context Protocol objects.
 */
import { contextProtocolSchema } from './schema'
import type { ContextProtocol, ContextContent, Entity, Decision, Fact } from './types'

// ============================================================
// Validation
// ============================================================

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  context?: ContextProtocol
}

/**
 * Validate a Context Protocol object
 */
export function validateContext(input: unknown): ValidationResult {
  const result = contextProtocolSchema.safeParse(input)

  if (result.success) {
    return {
      valid: true,
      context: result.data as ContextProtocol,
    }
  }

  return {
    valid: false,
    errors: result.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    ),
  }
}

/**
 * Parse and validate a JSON string as Context Protocol
 */
export function parseContextJSON(json: string): ValidationResult {
  try {
    const parsed = JSON.parse(json)
    return validateContext(parsed)
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

// ============================================================
// Context Accessors (convenience methods)
// ============================================================

export class ContextAccessor {
  constructor(private context: ContextProtocol) {}

  /** Get the raw context object */
  get raw(): ContextProtocol {
    return this.context
  }

  /** Get the source information */
  get source() {
    return this.context.source
  }

  /** Get the core content */
  get content(): ContextContent {
    return this.context.context
  }

  /** Get the goal */
  get goal(): string {
    return this.context.context.goal
  }

  /** Get the summary */
  get summary(): string {
    return this.context.context.summary
  }

  /** Get the status */
  get status(): string {
    return this.context.context.status
  }

  /** Check if the context is completed */
  get isCompleted(): boolean {
    return this.context.context.status === 'completed'
  }

  /** Check if the context is blocked */
  get isBlocked(): boolean {
    return this.context.context.status === 'blocked'
  }

  /** Get all decisions */
  get decisions(): Decision[] {
    return this.context.context.decisions
  }

  /** Get all facts */
  get facts(): Fact[] {
    return this.context.context.facts
  }

  /** Get confirmed facts only */
  get confirmedFacts(): Fact[] {
    return this.context.context.facts.filter((f) => f.confidence === 'confirmed')
  }

  /** Get open questions */
  get openQuestions(): string[] {
    return this.context.context.openQuestions
  }

  /** Check if there are open questions */
  get hasOpenQuestions(): boolean {
    return this.context.context.openQuestions.length > 0
  }

  /** Get entities */
  get entities(): Entity[] {
    return this.context.context.entities || []
  }

  /** Get entities by type */
  getEntitiesByType(type: Entity['type']): Entity[] {
    return this.entities.filter((e) => e.type === type)
  }

  /** Get handoff information */
  get handoff() {
    return this.context.handoff
  }

  /** Get suggested next steps */
  get nextSteps(): string[] {
    return this.context.handoff?.nextSteps || []
  }

  /** Get warnings */
  get warnings(): string[] {
    return this.context.handoff?.warnings || []
  }

  /** Get priority */
  get priority(): string | undefined {
    return this.context.handoff?.priority
  }

  /** Check if context is expired */
  get isExpired(): boolean {
    if (!this.context.source.expiresAt) return false
    return new Date(this.context.source.expiresAt) < new Date()
  }

  /** Get age in milliseconds */
  get ageMs(): number {
    return Date.now() - new Date(this.context.source.generatedAt).getTime()
  }

  /** Convert to a prompt-friendly string for LLM consumption */
  toPrompt(): string {
    const lines: string[] = [
      '## Context Summary',
      `**Goal**: ${this.goal}`,
      `**Status**: ${this.status}`,
      '',
      '### Summary',
      this.summary,
    ]

    if (this.decisions.length > 0) {
      lines.push('', '### Key Decisions')
      this.decisions.forEach((d, i) => {
        lines.push(`${i + 1}. ${d.what}${d.why ? ` (Reason: ${d.why})` : ''}`)
      })
    }

    if (this.confirmedFacts.length > 0) {
      lines.push('', '### Confirmed Facts')
      this.confirmedFacts.forEach((f) => {
        lines.push(`- ${f.statement}`)
      })
    }

    if (this.hasOpenQuestions) {
      lines.push('', '### Open Questions')
      this.openQuestions.forEach((q) => {
        lines.push(`- ${q}`)
      })
    }

    if (this.nextSteps.length > 0) {
      lines.push('', '### Suggested Next Steps')
      this.nextSteps.forEach((s) => {
        lines.push(`- ${s}`)
      })
    }

    if (this.warnings.length > 0) {
      lines.push('', '### Warnings')
      this.warnings.forEach((w) => {
        lines.push(`- ⚠️ ${w}`)
      })
    }

    return lines.join('\n')
  }

  /** Convert to JSON string */
  toJSON(): string {
    return JSON.stringify(this.context, null, 2)
  }
}

/**
 * Create an accessor for a validated context
 */
export function createAccessor(context: ContextProtocol): ContextAccessor {
  return new ContextAccessor(context)
}

/**
 * Parse JSON and create an accessor (convenience function)
 */
export function parseAndAccess(json: string): ContextAccessor | null {
  const result = parseContextJSON(json)
  if (result.valid && result.context) {
    return createAccessor(result.context)
  }
  return null
}
