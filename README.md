# TruContext CLI

Persistent, intelligent memory for AI agents.

Your agent forgets everything. Every session starts from zero. Context compaction destroys what it learned. Memory plugins store facts but can't connect them. Your agent retrieves text snippets and hopes for the best.

**TruContext is different.** It's an intelligent knowledge graph — not flat storage, not keyword search, not GraphRAG. Your agent doesn't just *remember*. It *understands*.

## Install

```bash
npx trucontext login
```

That's it. No API keys to copy, no config files to edit. Browser-based OAuth, then you're in.

## The 30-Second Version

```bash
# Create an entity for the person your agent works with
npx trucontext entities create --id dustin --type Person \
  --properties '{"name": "Dustin", "role": "founder"}' \
  --recipe recipe:personal-assistant-memory

# Ingest what your agent learned
npx trucontext ingest "Dustin prefers async communication and dark mode. \
  He values clean code over backwards compatibility." \
  --context dustin:ABOUT --confidence 0.85 --temporal

# Ask an intelligent question
npx trucontext query "What does Dustin prefer?"
```

The response isn't a list of matching documents. It's structured understanding — concepts with confidence scores, emotional signatures, relationship context, and temporal awareness.

## What Makes TruContext Different

### Intelligent Knowledge Graph, Not Flat Storage

Memory plugins give you key-value pairs. TruContext gives you an intelligent knowledge graph where every piece of knowledge is connected to the entities, concepts, and emotions it relates to. When you ask "What does Dustin believe about AI?", the system traverses from the Person node through relationships to concepts, content, and emotional primitives — returning structured understanding, not text matches.

### Confidence + Temporal Decay

Not all memory is equal. A stated preference has higher confidence than an inferred pattern. A fact ("attended the Super Bowl") never decays. A preference ("likes morning meetings") fades if not reinforced. TruContext tracks both — so your agent knows what it's sure about and what's getting stale.

```bash
# High confidence, temporal — a strong preference that may change
npx trucontext ingest "Dustin prefers dark mode" \
  --context dustin:ABOUT --confidence 0.9 --temporal

# Low confidence, permanent — an unverified fact
npx trucontext ingest "Dustin attended the Super Bowl in 2024" \
  --context dustin:ABOUT --confidence 0.3 --no-temporal
```

### Curiosity — The System Asks What's Missing

Most memory systems only answer questions. TruContext also asks them. The heartbeat — a background intelligence layer — dreams about your data and surfaces what's missing, what's contradictory, and what needs more evidence. It generates attention directives that make every future interaction smarter.

### Recipes — Cognitive Templates

Recipes teach your agent *how to think* about a use case. Attach a recipe to a context node, and the heartbeat dreams about that data through the recipe's lens.

12 built-in recipes:

| Recipe | What It Does |
|--------|-------------|
| `personal-assistant-memory` | Persistent 1:1 user memory with preference tracking |
| `meeting-memory` | Cross-meeting decisions, action items, position tracking |
| `competitive-intelligence` | Competitor tracking, strategic early warning |
| `customer-voice` | Sentiment tracking, churn signals, feature request aggregation |
| `ai-agent-self-reflection` | The agent learns about itself — decisions, errors, feedback |
| `behavioral-observation` | Actions vs words — say-do gap analysis |
| `organizational-context` | Living org charts, relationship mapping |
| `customer-persona` | Aggregate archetypes that evolve with evidence |
| `decision-archive` | Decisions + rationale + rejected alternatives |
| `curiosity-loop` | The graph's gaps as the primary signal |
| `values-alignment` | Tension between stated values and actions |
| `temporal-drift` | Belief evolution tracking over time |

```bash
# See all recipes
npx trucontext recipes list

# Read the full recipe — WHY (how the system interprets) + HOW (implementation guide)
npx trucontext recipes get recipe:personal-assistant-memory
```

### Model-Agnostic Memory

TruContext doesn't care which LLM reads or writes to it. An OpenClaw agent using GPT can ingest. A Claude Code agent can query. A custom Gemini pipeline can recall. Switch models — keep the knowledge. The intelligent knowledge graph is the constant. The model is the variable.

### Self-Reflection

Your agent can track its own learning — what decisions it made, where it was wrong, what feedback it received. Attach the `ai-agent-self-reflection` recipe and the agent builds meta-cognition over time. It doesn't just learn about the world. It learns about itself.

### 36 Relationship Types

Content connects to entities through typed relationships — not just "related to" but *how*. BY, ABOUT, CAPTURES, RESPONDS_TO, REINFORCES, OPPOSES, DERIVED_FROM, and 29 more. Your agent speaks a rich vocabulary about how knowledge connects.

```bash
# See all relationship types
npx trucontext relationship-types

# Link content to multiple entities with different relationships
npx trucontext ingest "Session summary..." \
  --context dustin:ABOUT \
  --context agent-claude:BY \
  --context session-mar-22:CAPTURES
```

## The Lifecycle

The ideal loop for an AI agent using TruContext:

```
Observe → Capture → Sleep → Wake → Query → Observe → ...
```

1. **Observe** during the session — accumulate signal
2. **Capture** before compaction — ingest summaries, decisions, preferences
3. **Sleep** — the heartbeat dreams about your data (decay, patterns, curiosity)
4. **Wake** — query to rebuild working memory
5. **Repeat** — each cycle makes the agent smarter

## Commands

### Auth
| Command | Description |
|---------|-------------|
| `login` | Sign in via browser (OAuth + PKCE) |
| `logout` | Clear stored credentials |
| `whoami` | Show current user and active app |

### Apps
| Command | Description |
|---------|-------------|
| `init [name]` | Create a new app with AI-generated schema |
| `apps` | List your apps |
| `use <app>` | Set the active app |

### Data
| Command | Description |
|---------|-------------|
| `ingest <source>` | Ingest text or file with confidence, temporal, and context linking |
| `query <question>` | Query the intelligent knowledge graph |
| `recall <query>` | Semantic memory recall with graph expansion |

### Structure
| Command | Description |
|---------|-------------|
| `entities list` | List entities |
| `entities create` | Create entity with recipe, confidence, temporal, contexts |
| `entities get <id>` | Get entity details |
| `entities update <id>` | Update entity properties, recipe, heartbeat settings |
| `entities delete <id>` | Delete entity |
| `contexts list` | List contexts |
| `contexts create <name>` | Create a scoping context |
| `contexts delete <id>` | Delete context |

### Intelligence
| Command | Description |
|---------|-------------|
| `recipes list` | List all recipes (system + custom) |
| `recipes get <id>` | Get recipe details (WHY + HOW) |
| `recipes create` | Create a custom recipe |
| `recipes delete <id>` | Delete a custom recipe |
| `relationship-types` | List all relationship types |
| `schema show` | Show current app schema |
| `schema generate` | AI-generate a schema from description |

## API

TruContext has two API surfaces:

- **Data Plane** (`api.trucontext.ai`) — ingest, query, recall, entities, contexts. Authenticated with API keys.
- **Control Plane** (`platform.trucontext.ai`) — apps, schema, recipes, settings. Authenticated with JWT.

Full API documentation: [app.trucontext.ai/docs](https://app.trucontext.ai/docs)

## License

MIT
