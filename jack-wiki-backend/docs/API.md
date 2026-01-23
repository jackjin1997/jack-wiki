# Jack Wiki Backend - API Documentation

## Base URL

```
http://localhost:8000
```

## tRPC Endpoint

All API calls go through the tRPC endpoint:

```
POST http://localhost:8000/trpc
```

## Authentication

MVP1 does not require authentication. All endpoints are publicly accessible.

## Frontend Integration

### TypeScript Client

```typescript
import { trpc } from '@/lib/trpc'

// Query example
const conversations = await trpc.conversation.list.useQuery({
  limit: 20,
  offset: 0
})

// Mutation example
const newConversation = await trpc.conversation.create.useMutation()
```

## API Routes

### Conversation Routes

#### `conversation.create`

Create a new conversation.

**Type**: `mutation`

**Input**:
```typescript
{
  title?: string  // Optional, defaults to "New Conversation"
}
```

**Output**:
```typescript
{
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}
```

**Example**:
```typescript
const conversation = await trpc.conversation.create.mutate({
  title: "Chat with Nietzsche"
})
```

---

#### `conversation.list`

List all conversations, ordered by most recent.

**Type**: `query`

**Input**:
```typescript
{
  limit?: number   // Default: 20, Max: 100
  offset?: number  // Default: 0
}
```

**Output**:
```typescript
Array<{
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}>
```

**Example**:
```typescript
const conversations = await trpc.conversation.list.query({
  limit: 50,
  offset: 0
})
```

---

#### `conversation.get`

Get a single conversation by ID.

**Type**: `query`

**Input**:
```typescript
{
  id: string  // UUID
}
```

**Output**:
```typescript
{
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}
```

**Errors**:
- `NOT_FOUND`: Conversation not found

---

#### `conversation.delete`

Delete a conversation and all its messages.

**Type**: `mutation`

**Input**:
```typescript
{
  id: string  // UUID
}
```

**Output**:
```typescript
{
  success: boolean
}
```

---

### Message Routes

#### `message.send`

Send a message and get AI response (non-streaming).

**Type**: `mutation`

**Input**:
```typescript
{
  conversationId: string  // UUID
  message: string         // 1-10000 characters
  model: 'gemini-pro' | 'claude-3-sonnet' | 'gpt-4-turbo' | 'gpt-4o'
  personaId?: string      // Optional AI persona UUID
}
```

**Output**:
```typescript
{
  id: string
  conversationId: string
  role: 'assistant'
  content: string
  model: string
  personaId?: string
  createdAt: Date
}
```

**Example**:
```typescript
const response = await trpc.message.send.mutate({
  conversationId: 'abc-123',
  message: 'What is the meaning of life?',
  model: 'claude-3-sonnet',
  personaId: 'nietzsche-id'
})
```

---

#### `message.stream`

Send a message and get streaming AI response.

**Type**: `subscription`

**Input**: Same as `message.send`

**Output Stream**:
```typescript
// Token events
{
  type: 'token'
  content: string  // Partial response chunk
}

// Done event
{
  type: 'done'
  messageId: string  // Saved message ID
}
```

**Example**:
```typescript
const subscription = trpc.message.stream.subscribe({
  conversationId: 'abc-123',
  message: 'Tell me a story',
  model: 'gpt-4o'
}, {
  onData: (data) => {
    if (data.type === 'token') {
      console.log(data.content)  // Stream partial response
    } else if (data.type === 'done') {
      console.log('Complete!', data.messageId)
    }
  },
  onError: (err) => {
    console.error('Stream error:', err)
  }
})

// Unsubscribe when done
subscription.unsubscribe()
```

---

#### `message.list`

List messages in a conversation.

**Type**: `query`

**Input**:
```typescript
{
  conversationId: string
  limit?: number   // Default: 50, Max: 100
  offset?: number  // Default: 0
}
```

**Output**:
```typescript
Array<{
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  personaId?: string
  createdAt: Date
}>
```

**Messages are returned in chronological order (oldest first).**

---

### Persona Routes

#### `persona.list`

List available AI personas.

**Type**: `query`

**Input**:
```typescript
{
  category?: string      // Filter by category
  isActive?: boolean     // Filter by active status
}
```

**Output**:
```typescript
Array<{
  id: string
  name: string
  nameEn?: string
  description?: string
  systemPrompt: string
  avatar?: string
  category: string
  isActive: boolean
  createdAt: Date
}>
```

**Categories**:
- `philosopher` - 哲学家 (Aristotle, Nietzsche, Kant, Camus)
- `psychologist` - 心理学家 (Freud, Adler)
- `thinker` - 思想家 (毛泽东, 鲁迅)
- `investor` - 投资家 (Buffett, Munger, 段永平)
- `special` - 特殊角色 (周媛)

**Example**:
```typescript
// Get all active personas
const personas = await trpc.persona.list.query({ isActive: true })

// Get only philosophers
const philosophers = await trpc.persona.list.query({ category: 'philosopher' })
```

---

#### `persona.get`

Get a single persona by ID.

**Type**: `query`

**Input**:
```typescript
{
  id: string  // UUID
}
```

**Output**:
```typescript
{
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
```

**Errors**:
- `NOT_FOUND`: Persona not found

---

### Model Routes

#### `model.list`

List available AI models.

**Type**: `query`

**Input**: None

**Output**:
```typescript
Array<{
  id: string
  name: string
  provider: string
}>
```

**Example Output**:
```json
[
  { "id": "gemini-pro", "name": "Gemini Pro", "provider": "Google" },
  { "id": "claude-3-sonnet", "name": "Claude 3.5 Sonnet", "provider": "Anthropic" },
  { "id": "gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "OpenAI" },
  { "id": "gpt-4o", "name": "GPT-4o", "provider": "OpenAI" }
]
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: {
    message: string
    code: string
    data?: {
      zodError?: ZodError  // For validation errors
    }
  }
}
```

### Common Error Codes

- `BAD_REQUEST` (400): Invalid input
- `NOT_FOUND` (404): Resource not found
- `INTERNAL_SERVER_ERROR` (500): Server error
- `EXTERNAL_SERVICE_ERROR` (502): AI model API error

### Error Handling Example

```typescript
try {
  const response = await trpc.message.send.mutate({...})
} catch (error) {
  if (error.data?.code === 'NOT_FOUND') {
    console.error('Conversation not found')
  } else if (error.data?.code === 'EXTERNAL_SERVICE_ERROR') {
    console.error('AI model error:', error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

---

## Rate Limiting

MVP1 does not implement rate limiting. Future versions will include:
- Per-IP rate limiting
- Per-conversation rate limiting
- AI model usage quotas

---

## Health Check

### `GET /health`

Check server health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T10:00:00.000Z",
  "environment": "development"
}
```

---

## WebSocket Support

tRPC subscriptions use WebSocket for real-time streaming. The connection is established automatically when using `subscription()`.

**Connection URL**: `ws://localhost:8000/trpc`

---

## Best Practices

### 1. Use Subscriptions for Streaming

For better UX, use `message.stream` instead of `message.send` to show real-time responses.

### 2. Handle Errors Gracefully

Always implement error handlers for mutations and queries.

### 3. Paginate Large Lists

Use `limit` and `offset` for conversations and messages to avoid loading too much data.

### 4. Cache Persona List

Personas rarely change, cache them on the frontend.

### 5. Cleanup Subscriptions

Always unsubscribe from subscriptions when component unmounts.

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0 (MVP1)
