/**
 * Context Generator
 *
 * Generates structured Context Protocol from raw content (conversations, documents, etc.)
 * Uses an abstract LLM interface to allow any AI provider.
 */
import type {
  ContextProtocol,
  ContextGeneratorInput,
  GeneratedContext,
  ContextContent,
  ContextHandoff,
} from './types'

// ============================================================
// LLM Interface (to be implemented by consumers)
// ============================================================

export interface LLMProvider {
  /**
   * Generate a completion from the given prompt
   * @param prompt - The prompt to send to the LLM
   * @returns The LLM's response as a string
   */
  generate(prompt: string): Promise<string>
}

// ============================================================
// Generator Options
// ============================================================

export interface ContextGeneratorOptions {
  /** LLM provider for generating context */
  llm: LLMProvider

  /** Default agent identifier */
  defaultAgent?: string

  /** Custom prompt template (advanced) */
  customPromptTemplate?: string
}

// ============================================================
// Default Prompt Template
// ============================================================

const DEFAULT_PROMPT_TEMPLATE = `You are a context extraction assistant. Your task is to analyze the provided content and extract a structured context summary following the Context Protocol format.

## Input Content
{content}

## Instructions
Analyze the content above and extract:
1. **Goal**: The main objective or purpose
2. **Summary**: A concise summary (under 500 words)
3. **Status**: Current status (in_progress, completed, blocked, or abandoned)
4. **Decisions**: Key decisions made (what, why, alternatives considered)
5. **Facts**: Confirmed information with confidence levels
6. **Open Questions**: Unresolved questions
7. **Entities**: Key people, concepts, code, files, or tools mentioned
8. **Next Steps**: Suggested follow-up actions
9. **Warnings**: Any risks or concerns

## Output Format
Respond ONLY with valid JSON matching this structure:
{
  "goal": "string",
  "summary": "string",
  "status": "in_progress" | "completed" | "blocked" | "abandoned",
  "constraints": ["string"],
  "decisions": [{"what": "string", "why": "string", "alternatives": ["string"]}],
  "facts": [{"statement": "string", "confidence": "confirmed" | "inferred" | "assumed", "source": "string"}],
  "openQuestions": ["string"],
  "entities": [{"name": "string", "type": "person" | "concept" | "code" | "file" | "url" | "tool" | "other", "description": "string", "reference": "string"}],
  "handoff": {
    "nextSteps": ["string"],
    "warnings": ["string"],
    "priority": "low" | "medium" | "high" | "critical"
  }
}

{hints}

Respond with JSON only, no markdown code blocks or explanations.`

// ============================================================
// Context Generator Class
// ============================================================

export class ContextGenerator {
  private llm: LLMProvider
  private defaultAgent?: string
  private promptTemplate: string

  constructor(options: ContextGeneratorOptions) {
    this.llm = options.llm
    this.defaultAgent = options.defaultAgent
    this.promptTemplate = options.customPromptTemplate || DEFAULT_PROMPT_TEMPLATE
  }

  /**
   * Generate a Context Protocol object from raw input
   */
  async generate(input: ContextGeneratorInput): Promise<GeneratedContext> {
    const startTime = Date.now()

    // Build the prompt
    const hintsText = this.buildHintsText(input.hints)
    const prompt = this.promptTemplate
      .replace('{content}', input.rawContent)
      .replace('{hints}', hintsText)

    // Call LLM
    const llmResponse = await this.llm.generate(prompt)

    // Parse the response
    const parsed = this.parseResponse(llmResponse)

    // Build the full context
    const context: ContextProtocol = {
      protocol: 'cxp',
      version: '0.1',
      source: {
        type: input.sourceType,
        id: input.sourceId,
        agent: input.agent || this.defaultAgent,
        generatedAt: new Date().toISOString(),
        title: input.title,
      },
      context: parsed.context,
      handoff: parsed.handoff,
    }

    return {
      context,
      processingTime: Date.now() - startTime,
    }
  }

  /**
   * Generate context from a conversation (convenience method)
   */
  async fromConversation(
    conversationId: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      title?: string
      agent?: string
    }
  ): Promise<GeneratedContext> {
    // Format messages into readable content
    const rawContent = messages
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n\n')

    return this.generate({
      sourceType: 'conversation',
      sourceId: conversationId,
      agent: options?.agent,
      title: options?.title,
      rawContent,
    })
  }

  private buildHintsText(
    hints?: ContextGeneratorInput['hints']
  ): string {
    if (!hints) return ''

    const parts: string[] = []

    if (hints.focusOn?.length) {
      parts.push(`Focus especially on: ${hints.focusOn.join(', ')}`)
    }
    if (hints.ignore?.length) {
      parts.push(`You can ignore: ${hints.ignore.join(', ')}`)
    }
    if (hints.maxSummaryLength) {
      parts.push(`Keep summary under ${hints.maxSummaryLength} words`)
    }

    return parts.length > 0 ? `\n## Additional Hints\n${parts.join('\n')}` : ''
  }

  private parseResponse(response: string): {
    context: ContextContent
    handoff?: ContextHandoff
  } {
    // Clean up response (remove markdown code blocks if present)
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
    cleaned = cleaned.trim()

    try {
      const parsed = JSON.parse(cleaned)

      const context: ContextContent = {
        goal: parsed.goal || 'Unknown',
        summary: parsed.summary || '',
        status: parsed.status || 'in_progress',
        constraints: parsed.constraints || [],
        decisions: parsed.decisions || [],
        facts: parsed.facts || [],
        openQuestions: parsed.openQuestions || [],
        entities: parsed.entities || [],
      }

      const handoff: ContextHandoff | undefined = parsed.handoff
        ? {
            nextSteps: parsed.handoff.nextSteps,
            warnings: parsed.handoff.warnings,
            priority: parsed.handoff.priority,
          }
        : undefined

      return { context, handoff }
    } catch (error) {
      // If parsing fails, create a minimal context
      return {
        context: {
          goal: 'Context extraction failed',
          summary: response.slice(0, 500),
          status: 'blocked',
          decisions: [],
          facts: [],
          openQuestions: ['Failed to parse LLM response'],
        },
      }
    }
  }
}

// ============================================================
// Factory function
// ============================================================

export function createContextGenerator(
  options: ContextGeneratorOptions
): ContextGenerator {
  return new ContextGenerator(options)
}
