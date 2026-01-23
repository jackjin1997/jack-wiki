# Jack Wiki Backend - Architecture Documentation

## Overview

Jack Wiki Backend is built using **Clean Architecture** principles, ensuring high maintainability, testability, and scalability. The backend uses modern technologies including Bun, Elysia, tRPC, Drizzle ORM, and LangChain.

## Technology Stack

- **Runtime**: Bun 1.1+ (极致性能)
- **Web Framework**: Elysia (高性能Web框架)
- **API Design**: tRPC (端到端类型安全)
- **ORM**: Drizzle ORM (轻量高性能)
- **Database**: PostgreSQL 15+ with pgvector extension
- **AI Framework**: LangChain (混合模式)
- **Caching**: Upstash Redis (optional)
- **Validation**: Zod
- **Logging**: Pino

## Clean Architecture Layers

### 1. Core Layer (核心业务层)

Located in `src/core/`, this layer contains pure business logic with no external dependencies.

#### Entities
- `conversation.entity.ts` - Conversation domain entity
- `message.entity.ts` - Message domain entity
- `persona.entity.ts` - AI Persona domain entity

#### Repository Interfaces
- `conversation.repository.ts` - Conversation repository interface
- `message.repository.ts` - Message repository interface
- `persona.repository.ts` - Persona repository interface

**Key Principle**: Interfaces define contracts, implementations are in Infrastructure layer (Dependency Inversion).

#### Use Cases
- `create-conversation.use-case.ts` - Business logic for creating conversations
- `list-conversations.use-case.ts` - Business logic for listing conversations
- `send-message.use-case.ts` - Business logic for sending messages

**Use Cases are**:
- Framework-independent
- Easily testable
- Focused on single responsibility

### 2. Infrastructure Layer (基础设施层)

Located in `src/infrastructure/`, this layer implements technical details.

#### Database
- `schema.ts` - Drizzle ORM schema definitions
- `client.ts` - Database client configuration
- `seed.ts` - Database seeding scripts

#### Repository Implementations
- `drizzle-conversation.repository.ts`
- `drizzle-message.repository.ts`
- `drizzle-persona.repository.ts`

#### AI Services
- `ai.service.ts` - AI service interface
- `langchain-ai.service.ts` - LangChain implementation
- `langchain/model-factory.ts` - AI model factory (Gemini/Claude/GPT)

**LangChain Integration (Hybrid Mode)**:
- Core functionality uses LangChain for model abstraction
- Custom implementations for specific requirements
- Streaming support for real-time responses

### 3. Presentation Layer (表现层)

Located in `src/presentation/`, this layer handles external communication.

#### tRPC Setup
- `context.ts` - Request context creation
- `procedures.ts` - tRPC procedure definitions and middlewares
- `app.router.ts` - Main router aggregating all sub-routers

#### Routers
- `conversation.router.ts` - Conversation CRUD endpoints
- `message.router.ts` - Message endpoints + streaming
- `persona.router.ts` - AI persona endpoints
- `model.router.ts` - AI model information endpoints

**tRPC Benefits**:
- End-to-end type safety
- Automatic API documentation
- Built-in validation with Zod
- Subscription support for streaming

### 4. Shared Layer (共享层)

Located in `src/shared/`, contains code used across all layers.

#### Utils
- `logger.ts` - Pino logger configuration
- `env.ts` - Environment variable validation with Zod

#### Schemas
- `conversation.schema.ts` - Zod schemas for conversation validation
- `message.schema.ts` - Zod schemas for message validation
- `persona.schema.ts` - Zod schemas for persona validation

#### Errors
- `base.error.ts` - Custom error classes hierarchy

## Data Flow

```
Request → Elysia → tRPC Router → Use Case → Repository → Database
                                    ↓
                                AI Service → LangChain → AI Model
```

### Example: Send Message Flow

1. **Frontend** sends tRPC mutation `message.send`
2. **tRPC Router** validates input with Zod schema
3. **Use Case** (`SendMessageUseCase`) executes business logic:
   - Save user message to database
   - Fetch persona configuration (if specified)
   - Retrieve conversation history
   - Call AI service for response generation
   - Save AI response to database
4. **AI Service** uses LangChain to:
   - Create appropriate model (Gemini/Claude/GPT)
   - Build message history with system prompt
   - Stream or generate response
5. **Response** returns to frontend

## Database Schema

### Tables

- `conversations` - Conversation metadata
- `messages` - Chat messages with role (user/assistant/system)
- `personas` - AI character configurations
- `knowledge_items` - Documents for RAG (MVP2)
- `embeddings` - Vector embeddings using pgvector (MVP2)
- `skills` - LangChain skills configuration
- `mcp_tools` - MCP tools configuration

### Relationships

```
conversations 1→N messages
personas 1→N messages
knowledge_items 1→N embeddings
```

## AI Model Integration

### Supported Models

- **Gemini Pro** (Google)
- **Claude 3.5 Sonnet** (Anthropic)
- **GPT-4 Turbo** (OpenAI)
- **GPT-4o** (OpenAI)

### Model Factory Pattern

`AIModelFactory` creates appropriate LangChain model instances based on model ID:

```typescript
const model = AIModelFactory.create('gemini-pro')
const response = await model.invoke(messages)
```

### Streaming Support

All models support streaming for real-time response:

```typescript
const stream = await model.stream(messages)
for await (const chunk of stream) {
  yield chunk
}
```

## Error Handling

### Error Hierarchy

- `BaseError` - Base error class
  - `NotFoundError` (404)
  - `ValidationError` (400)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `InternalServerError` (500)
  - `ExternalServiceError` (502)

### Error Middleware

tRPC middleware catches and formats errors:

```typescript
const errorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    // Log and transform error
  }
})
```

## Performance Considerations

### Bun vs Node.js

- **Startup**: 4x faster than Node.js
- **HTTP Requests**: 10-20x faster than Express
- **Package Installation**: 10-20x faster than npm

### Database Optimization

- Connection pooling with postgres.js
- Prepared statements via Drizzle ORM
- Indexed queries (conversations, messages)

### Caching Strategy (Optional)

- Upstash Redis for persona configurations
- Model metadata caching
- Rate limiting (future)

## Security

### API Key Management

- Stored in environment variables
- Validated at startup with Zod
- Never exposed to frontend

### CORS Configuration

- Whitelist allowed origins
- Credentials support for future auth

### Input Validation

- All inputs validated with Zod schemas
- tRPC automatic validation
- Database constraints

## Testing Strategy

### Unit Tests

- Use Cases (pure business logic)
- Repository interfaces (mocked)
- Utility functions

### Integration Tests

- API endpoints via tRPC
- Database operations
- AI service integration

### E2E Tests

- Full conversation flow
- Multi-model switching
- Persona integration

## Deployment

### Docker

- Multi-stage build for optimization
- Health checks for each service
- Volume persistence for database

### Environment Variables

Required:
- `DATABASE_URL`
- At least one AI API key

Optional:
- `UPSTASH_REDIS_REST_URL`
- `R2_*` (Cloudflare R2 configuration)

## Future Enhancements

### MVP2: Knowledge Base
- Document upload and processing
- Vector embeddings with pgvector
- RAG (Retrieval-Augmented Generation)
- Semantic search

### MVP3: User Features
- Authentication system
- User-specific conversations
- Custom personas
- API key management

### MVP4: Advanced Features
- Skills marketplace
- MCP tool configuration UI
- Conversation sharing
- Admin dashboard

## Code Quality

### Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Clean Architecture principles

### Best Practices

- Dependency Inversion
- Single Responsibility
- Interface Segregation
- DRY (Don't Repeat Yourself)

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0 (MVP1)
