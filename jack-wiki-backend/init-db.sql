-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  title text DEFAULT 'New Conversation' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  system_prompt text NOT NULL,
  avatar text,
  category text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  conversation_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  model text,
  persona_id uuid,
  metadata jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE cascade,
  CONSTRAINT messages_persona_id_personas_id_fk FOREIGN KEY (persona_id) REFERENCES personas(id)
);

-- Create knowledge_items table
CREATE TABLE IF NOT EXISTS knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  file_url text,
  source_type text NOT NULL,
  metadata jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  knowledge_item_id uuid NOT NULL,
  embedding vector(1536),
  chunk_text text NOT NULL,
  chunk_index text,
  metadata jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT embeddings_knowledge_item_id_knowledge_items_id_fk FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_items(id) ON DELETE cascade
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL UNIQUE,
  description text,
  config jsonb NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

-- Create mcp_tools table
CREATE TABLE IF NOT EXISTS mcp_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL UNIQUE,
  server text NOT NULL,
  config jsonb,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
