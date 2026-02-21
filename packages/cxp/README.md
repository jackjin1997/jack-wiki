# CXP - Context eXchange Protocol

> A standard for structured context exchange between AI agents.

## Why?

When AI agents collaborate, they need to pass context to each other. Currently, this is done through unstructured text, leading to:

- **Information loss**: Important decisions and facts get buried
- **Inconsistent formats**: Each agent interprets context differently
- **No semantic structure**: Hard to programmatically extract key information

**CXP** defines a **minimal, self-describing, extensible** format for context exchange.

## Installation

```bash
npm install cxp
# or
bun add cxp
```

## Quick Start

### Generate Context from a Conversation

```typescript
import { createContextGenerator, type LLMProvider } from 'cxp'

// Implement your LLM provider
const myLLM: LLMProvider = {
  async generate(prompt: string) {
    // Call your preferred LLM (Claude, GPT, Gemini, etc.)
    return await callYourLLM(prompt)
  }
}

// Create generator
const generator = createContextGenerator({
  llm: myLLM,
  defaultAgent: 'my-agent/v1'
})

// Generate context from conversation
const result = await generator.fromConversation(
  'conversation-123',
  [
    { role: 'user', content: 'Help me design a REST API' },
    { role: 'assistant', content: 'Sure! Let\'s start with...' },
    // ... more messages
  ],
  { title: 'API Design Discussion' }
)

console.log(result.context)
```

### Parse and Consume Context

```typescript
import { parseContextJSON, createAccessor } from 'cxp'

// Parse incoming context
const result = parseContextJSON(jsonString)

if (result.valid) {
  const ctx = createAccessor(result.context!)

  // Easy access to key information
  console.log(ctx.goal)           // Main objective
  console.log(ctx.summary)        // Condensed summary
  console.log(ctx.decisions)      // Key decisions made
  console.log(ctx.openQuestions)  // Unresolved questions
  console.log(ctx.nextSteps)      // Suggested next actions

  // Convert to LLM-friendly prompt
  const prompt = ctx.toPrompt()
}
```

## Protocol Structure

```typescript
interface CXP {
  protocol: 'cxp'
  version: '0.1'

  source: {
    type: 'conversation' | 'document' | 'task' | 'agent-output'
    id: string
    agent?: string
    generatedAt: string  // ISO 8601
  }

  context: {
    goal: string
    summary: string
    status: 'in_progress' | 'completed' | 'blocked' | 'abandoned'
    decisions: Decision[]
    facts: Fact[]
    openQuestions: string[]
    entities?: Entity[]
  }

  handoff?: {
    nextSteps?: string[]
    warnings?: string[]
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }
}
```

## Use Cases

| Scenario | How Context Protocol Helps |
|----------|---------------------------|
| **Agent Handoff** | Structured summary for the next agent |
| **Long Conversations** | Compress history without losing key info |
| **Multi-Agent Collaboration** | Standard format all agents understand |
| **Knowledge Persistence** | Store conversation insights in a database |

## Relationship to Other Protocols

| Protocol | Focus | Relationship |
|----------|-------|--------------|
| **MCP** (Anthropic) | Agent ↔ Tool | Complementary |
| **A2A** (Google) | Agent ↔ Agent communication | CXP can be the "payload" |
| **CXP** | What context to exchange | Content/Semantic layer |

## License

MIT
