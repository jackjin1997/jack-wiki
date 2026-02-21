/**
 * CXP - Context eXchange Protocol
 *
 * A standard for structured context exchange between AI agents.
 *
 * @packageDocumentation
 */

// Types
export type {
  ContextProtocol,
  ContextSource,
  ContextSourceType,
  ContextContent,
  ContextStatus,
  ContextHandoff,
  Decision,
  Fact,
  FactConfidence,
  Entity,
  EntityType,
  ContextGeneratorInput,
  GeneratedContext,
} from './types'

// Schemas (for runtime validation)
export {
  cxpSchema,
  contextProtocolSchema, // deprecated alias
  contextSourceSchema,
  contextContentSchema,
  contextHandoffSchema,
  decisionSchema,
  factSchema,
  entitySchema,
} from './schema'

// Generator
export {
  ContextGenerator,
  createContextGenerator,
  type LLMProvider,
  type ContextGeneratorOptions,
} from './generator'

// Parser & Accessor
export {
  validateContext,
  parseContextJSON,
  ContextAccessor,
  createAccessor,
  parseAndAccess,
  type ValidationResult,
} from './parser'

// Version
export const VERSION = '0.1.0'
export const PROTOCOL_VERSION = '0.1'
