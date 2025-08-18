# 📘 CodexOS.dev — Blueprint v2: Engineering Execution Spec

> "A next-level autonomous engineering OS. Modular, agentic, real-time, and scalable."

## ⚙️ Core Philosophy
- Build an **MCP-native AI agentic system** that can ingest, reason, and act across projects
- Prioritize modularity, security, speed, and elegance (UX + DevEx)
- Empower devs to spawn, compose, debug, and deploy autonomous AI agents
- Be future-proof: local-first, multi-agent, RAG-native, private LLM optional

## 🧱 System Architecture Overview

### 🔲 Core Components
- Agent Engine (orchestrator, planner, sub-agent executor)
- RAG Engine (ingestion, chunking, embedding, reranking)
- Tool Loader (plug-and-play tools, validated schema)
- Visual Agent Flow (React Flow-based builder UI)
- Vault (encrypted API keys, secrets, tokens)
- Marketplace (share/fork agent templates)
- FastAPI Backend + WebSocket Layer
- Next.js + Tailwind + shadcn/ui Frontend

---

## 📡 API Contract Spec

### `/agent/run`
```json
{
  "agent_id": "dev-helper",
  "flow": {...},
  "context": ["summary.md", "api_docs.pdf"],
  "input": "What's the response schema?"
}
```

### `/rag/query`
```json
{
  "query": "payment retry logic",
  "project_id": "codexos-dev"
}
```

### `/vault/put`
```json
{
  "key": "openai_key",
  "value": "sk-xyz",
  "tags": ["api", "llm"]
}
```

---

## 🧠 Agent Execution Flow (LangGraph-style)

```json
{
  "id": "agent-1",
  "nodes": [
    { "id": "start", "type": "entry", "next": "planner" },
    { "id": "planner", "type": "llm", "model": "gpt-4", "next": "tool_selector" },
    { "id": "tool_selector", "type": "tool", "tool": "WebSearch", "next": "summarizer" },
    { "id": "summarizer", "type": "llm", "model": "claude-3-opus", "next": "end" },
    { "id": "end", "type": "exit" }
  ]
}
```

---

## 🧩 RAG Pipeline (Ingestion Config)

```json
{
  "sources": [
    { "type": "github", "url": "https://github.com/user/repo" },
    { "type": "upload", "path": "/docs/spec.pdf" }
  ],
  "chunking": {
    "strategy": "sliding",
    "window": 300,
    "overlap": 50
  },
  "embedding": {
    "model": "text-embedding-3-small",
    "rerank": true
  }
}
```

---

## 🔐 Vault Security Design

- AES-256 GCM encryption
- HKDF-derived master key (env or generated)
- Encrypted fields:
  - LLM API keys
  - OAuth tokens
  - Custom tool credentials

---

## 🧠 UI/UX: Agent Engine Visual Interface

### 💡 Core UI Components
- **Visual Flow Editor**: React Flow canvas for agent composition
- **Node Drawer Editor**: Config modal for each node (LLM prompt, tool params, etc.)
- **Execution Console**: WebSocket-powered logs and live output
- **Memory/Context Viewer**: View RAG context, memory, vault variables
- **Agent Settings Panel**: Controls for temperature, model, max tokens

### 🧩 Supported Node Types
| Node | Type | Purpose |
|------|------|---------|
| 🔹 Entry | entry | Start node |
| 🔷 LLM | llm | Calls LLM with system prompt/input |
| 🧰 Tool | tool | Executes a defined plugin/tool |
| 📚 RAG | rag | Pulls relevant context for prompt |
| 🔐 Vault | vault | Injects secret from vault |
| 🔁 Condition | condition | If/else logic |
| 🟢 Exit | exit | End of flow, output returned |

### 🖼 Component Tree
```
components/
├── FlowEditor/            → Canvas + graph logic
├── FlowNodeTypes/         → LLM, Tool, Vault, etc.
├── NodeConfigDrawer/      → Drawer UI for editing properties
├── ExecutionConsole/      → Logs viewer
├── AgentSettings/         → Model selection + params
├── MemoryViewer/          → RAG, context, vault memory
```

### ⚙️ State + API Integration
- Flow state: `Zustand` or `Jotai`
- Node/flow config stored in Supabase or localStorage
- Backend triggered via `/agent/run` with live WebSocket

### ➕ UX Features
- Drag-n-drop node reordering
- Inline prompt preview + validation
- RAG chunk preview (click to inspect context)
- Run + retry last failed node

---

## 📁 Monorepo Structure

```
codexos/
├── apps/
│   ├── web-ui/              → Next.js + React Flow + UI
│   └── backend/             → FastAPI + agent engine
├── packages/
│   ├── agent-engine/        → Execution planner, runner
│   ├── rag-engine/          → Embedding + chunking + retrieval
│   ├── toolkit/             → Tool definitions, schemas
│   ├── memory-core/         → Vault encryption + user memory
│   └── dev-cli/             → CLI bootstrap, tool tester
```

---

## 📦 `.env.template` Example

```bash
# LLM Providers
OPENAI_API_KEY=sk-xxxx
ANTHROPIC_API_KEY=claude-xxx
OLLAMA_MODEL=llama3

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxx

# Vector Store
CHROMA_URL=http://localhost:8000

# Vault
VAULT_MASTER_KEY=auto-generate-or-paste
```

---

## 🧪 First Execution Target: Agent Engine (CLI + API)

1. Create LangGraph-style runner
2. Accept JSON flow inputs
3. Trigger tool calls, LLM calls, context merges
4. Return structured output with logs

---

## 🧭 Result
> CodexOS.dev becomes the **platform** for autonomous engineering. 
> Not just a tool — the OS for LLM + agent-powered development.

---
