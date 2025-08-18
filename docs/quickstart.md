# Quick Start Guide

Get up and running with CodexOS in under 5 minutes! This guide will walk you through creating your first autonomous AI agent.

## Prerequisites

- Node.js 18+ or Python 3.11+
- Docker (for self-hosted deployment)
- An LLM API key (OpenAI, Anthropic, or local Ollama)

## 1. Sign Up for CodexOS

Visit [codexos.dev](https://codexos.dev) and create your free account. You'll get:
- 3 active agents
- 1,000 executions per month
- 100MB RAG storage
- Access to free marketplace agents

## 2. Install the CLI

### Using npm
```bash
npm install -g @codexos/cli
```

### Using pip
```bash
pip install codexos-cli
```

### Verify installation
```bash
codexos --version
# Output: CodexOS CLI v1.0.0
```

## 3. Authenticate

```bash
codexos auth login
# Opens browser for authentication
```

## 4. Create Your First Agent

### Option A: Using the Visual Editor (Recommended)

1. Go to [dashboard.codexos.dev](https://dashboard.codexos.dev)
2. Click "Create New Agent"
3. Drag an LLM node onto the canvas
4. Configure the prompt: "You are a helpful coding assistant"
5. Connect Entry → LLM → Exit nodes
6. Save and name your agent

### Option B: Using Code

Create a file `hello-agent.py`:

```python
from codexos import Agent, LLMNode, ToolNode

# Create an agent
agent = Agent(name="Hello World Agent")

# Add nodes
agent.add_node(LLMNode(
    id="llm1",
    prompt="You are a helpful assistant. Answer the user's question.",
    model="gpt-4"
))

# Connect nodes
agent.connect("entry", "llm1")
agent.connect("llm1", "exit")

# Save the agent
agent.save()

# Run the agent
result = agent.run("What is CodexOS?")
print(result)
```

Run it:
```bash
python hello-agent.py
```

## 5. Add RAG Capabilities

Enhance your agent with knowledge retrieval:

```python
from codexos import RAGNode

# Add a RAG node
agent.add_node(RAGNode(
    id="rag1",
    collection="my-docs",
    top_k=5
))

# Update connections
agent.connect("entry", "rag1")
agent.connect("rag1", "llm1")

# Ingest documents
agent.ingest_documents([
    "https://docs.codexos.dev",
    "./my-docs.pdf"
])
```

## 6. Deploy Your Agent

### As an API
```bash
codexos deploy hello-agent --type api
# Returns: https://api.codexos.dev/agents/hello-agent
```

### As a Webhook
```bash
codexos deploy hello-agent --type webhook --endpoint https://myapp.com/webhook
```

### Self-Hosted
```bash
codexos export hello-agent --format docker
docker run -p 8080:8080 hello-agent:latest
```

## 7. Monitor and Iterate

View your agent's performance in the dashboard:
- Execution logs
- Success rates
- Response times
- Token usage

## Example: Code Review Agent

Here's a complete example of a code review agent:

```python
from codexos import Agent, LLMNode, ToolNode, RAGNode

# Create agent
agent = Agent(name="Code Review Assistant")

# Add RAG for coding standards
agent.add_node(RAGNode(
    id="standards",
    collection="coding-standards",
    query="Find relevant coding standards for: {code_snippet}"
))

# Add LLM for review
agent.add_node(LLMNode(
    id="reviewer",
    prompt="""Review this code:
    {code_snippet}
    
    Standards to consider:
    {rag_results}
    
    Provide:
    1. Issues found
    2. Security concerns
    3. Performance suggestions
    4. Best practice recommendations
    """,
    model="gpt-4"
))

# Add tool for formatting
agent.add_node(ToolNode(
    id="formatter",
    tool="code_formatter",
    language="{language}"
))

# Connect nodes
agent.connect("entry", "standards")
agent.connect("standards", "reviewer")
agent.connect("reviewer", "formatter")
agent.connect("formatter", "exit")

# Deploy as API
deployment = agent.deploy(type="api")
print(f"API endpoint: {deployment.url}")
```

## Next Steps

- [Build more complex agents](./guides/advanced-agents.md)
- [Explore the marketplace](https://codexos.dev/marketplace)
- [Read the API documentation](./api/rest.md)
- [Join our Discord community](https://discord.gg/codexos)

## Troubleshooting

### Common Issues

**Authentication failed**
```bash
codexos auth logout
codexos auth login
```

**Node.js/Python version mismatch**
```bash
# Check versions
node --version  # Should be 18+
python --version  # Should be 3.11+
```

**Docker not running**
```bash
# Start Docker
# macOS: open -a Docker
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop
```

### Getting Help

- Documentation: [docs.codexos.dev](https://docs.codexos.dev)
- Discord: [discord.gg/codexos](https://discord.gg/codexos)
- Email: support@codexos.dev

---

**Congratulations!** 🎉 You've created and deployed your first CodexOS agent. The possibilities are endless from here!
