# PRD — Prompt Inspector

**Status:** Draft v1
**Owner:** [TBD]
**Last updated:** 2026-07-25

---

## 1. Overview

Prompt Inspector is a developer-focused web app that lets engineers analyze AI prompts before sending them to a language model. It estimates token usage, input/output cost, context window utilization, and remaining available context, and provides side-by-side comparisons across multiple AI models (GPT-5, Claude, Gemini, DeepSeek, Qwen, Llama, etc.).

**Vision:** Become the "JWT.io" or "Regex101" of LLM development — a daily-use utility for AI developers and prompt engineers.

---

## 2. Problem Statement

Developers building on multiple LLM providers currently have no fast, unified way to:
- Estimate token counts across different tokenizers before making a live API call
- Compare cost and context-window fit across providers in one view
- Track how a prompt's cost/size changes as they iterate

Existing tools are either provider-specific (e.g. OpenAI's own tokenizer playground) or require live API calls, burning cost and time during iteration.

---

## 3. Goals & Non-Goals

### Goals (MVP)
- Accurate, fast, primarily-offline token estimation across major model families
- Multi-model side-by-side comparison (tokens, cost, context usage)
- Account-based history and sharing of analyses
- Optional BYOK for exact token counts (Gemini, Anthropic)

### Non-Goals (MVP)
- Prompt optimization / rewriting suggestions (roadmap)
- Public SDK, CLI, VS Code extension (roadmap)
- Monetization, billing, or paid tiers (explicitly free/open-source)
- Team/org accounts or collaboration features

---

## 4. Target Users

- AI application developers integrating multiple LLM providers
- Prompt engineers iterating on prompt design for cost/context efficiency
- Technical teams evaluating which model fits a given prompt's context budget

---

## 5. User Stories

1. As a developer, I want to paste a prompt and instantly see its estimated token count for GPT-5, Claude, and Gemini side by side, so I can pick the most cost-effective model.
2. As a developer, I want to see estimated input/output cost per model, so I can budget API usage before running it live.
3. As a developer, I want to know how much of a model's context window my prompt consumes and how much remains, so I can decide if I need to trim it.
4. As a returning user, I want to log in and see my past prompt analyses, so I can revisit or compare earlier work.
5. As a user, I want to share a specific analysis via a link, so a teammate can view the same comparison without re-pasting the prompt.
6. As a power user, I want to optionally connect my own Gemini/Anthropic API key to get exact (not estimated) token counts.
7. As a security-conscious user, I want confidence that my stored API key is encrypted and I can revoke/delete it at any time.

---

## 6. Functional Requirements

### 6.1 Authentication (Required for all features)
- Sign-up / login required to use the app (per product decision)
- Auth handled via InsForge
- Session management, logout, account deletion

### 6.2 Prompt Input & Analysis
- Text area for prompt input (paste or type)
- Character, word, sentence, and line statistics
- Model selector (multi-select) from a searchable model catalog

### 6.3 Token Estimation Engine
- Local tokenizer-based estimation per model family:
  - `tiktoken` for OpenAI models
  - Hugging Face Tokenizers for Llama, Qwen, Gemma, DeepSeek, Mistral, and other open-weight models
- Optional exact counts via provider APIs:
  - Google Gemini `countTokens()`
  - Anthropic `messages/count_tokens`
- Each result normalized to the standardized output schema (see §9)

### 6.4 Multi-Model Comparison
- Side-by-side table/card view across selected models
- Per-model: input tokens, estimated output tokens, estimated cost (input/output/total), context window, remaining context, tokenizer used, estimation method (local vs exact)

### 6.5 History & Sharing
- Every analysis run is saved to the user's account (InsForge/Postgres)
- User can view a list of past analyses (prompt snippet, date, models compared)
- User can generate a shareable read-only link for a specific analysis
- Shared links do not require the viewer to log in (view-only, no re-run)

### 6.6 BYOK API Key Management
- Users can add their own Gemini / Anthropic API keys in account settings
- **Recommended approach:** keys encrypted at rest server-side (InsForge), decrypted only server-side at request time, never re-displayed in plaintext after save
- User can delete/rotate their stored key at any time
- Clear UI indication of which results used "Exact (API)" vs "Estimated (Local)" methods

### 6.7 Model Registry
- Centralized registry: model ID, provider, tokenizer type, context window, max output tokens, input/output pricing, cached-input pricing (if applicable), status (stable/preview/deprecated), last-updated timestamp
- Registry sourced/cross-checked against LiteLLM registry, OpenRouter catalog, and official provider docs
- Searchable/filterable model catalog in UI

### 6.8 UI/UX
- Responsive layout, dark mode
- Copy/share buttons on analysis results
- Data visualization (context usage bars/charts via Recharts)
- Comparison table via TanStack Table

---

## 7. Non-Functional Requirements

- **Performance:** Local tokenization should return results in near-real-time (<300ms typical) for prompts up to a reasonable size (e.g. 50k characters)
- **Security:** Encrypted storage for any persisted API keys; standard auth security practices (hashed sessions, HTTPS only)
- **Reliability:** Model registry data should be periodically refreshed/versioned to avoid stale pricing
- **Cost:** Since project is free/open-source with no monetization, infrastructure costs should stay within free/low-cost tiers where feasible (Vercel, InsForge)

---

## 8. Tech Stack

### Frontend
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui
- TanStack Query, TanStack Table
- Framer Motion
- Zustand (optional, for local UI state)
- Recharts, React Markdown

### Backend
- **InsForge** (BaaS: auth, data storage, server-side logic)
- **Inngest** (event-driven durable execution for background/scheduled jobs — see §17)
- Next.js Route Handlers (custom endpoints as needed)
- PostgreSQL (via InsForge)
- Redis (optional — caching pricing/model metadata)

### Tokenization
- `tiktoken` (OpenAI)
- Hugging Face Tokenizers (`@huggingface/tokenizers`) — Llama, Qwen, Gemma, DeepSeek, Mistral, etc.
- Google Gemini `countTokens()` (optional, BYOK)
- Anthropic `messages/count_tokens` (optional, BYOK)

### Deployment
- Vercel (frontend)
- InsForge (backend & database)
- GitHub Actions (CI/CD)

---

## 9. Standardized Output Schema

Every supported model returns a normalized result:

```json
{
  "model": "GPT-5",
  "provider": "OpenAI",
  "inputTokens": 1243,
  "estimatedOutputTokens": 512,
  "estimatedCost": {
    "input": 0.00155,
    "output": 0.00512,
    "total": 0.00667
  },
  "contextWindow": 272000,
  "remainingContext": 270757,
  "tokenizer": "o200k_base",
  "estimationMethod": "Local Tokenizer"
}
```

---

## 10. Data Model (high-level)

- **User**: id, email, auth provider, created_at
- **ApiKey**: id, user_id, provider (gemini/anthropic), encrypted_key, created_at, last_used_at
- **Analysis**: id, user_id, prompt_text, created_at, share_token (nullable), is_public
- **AnalysisResult**: id, analysis_id, model_id, normalized_output (JSON per §9)
- **ModelRegistry**: model_id, provider, tokenizer_type, context_window, max_output_tokens, pricing_input, pricing_output, pricing_cached_input, status, last_updated

---

## 11. MVP Scope Summary

**In scope:**
- Auth (required login)
- Prompt input + stats
- Multi-model token/cost/context comparison (local estimation)
- Optional BYOK exact counts (Gemini, Anthropic)
- Saved history per user
- Shareable read-only analysis links
- Model catalog (searchable)
- Dark mode, responsive UI

**Out of scope (MVP):**
- Prompt optimization suggestions
- Duplicate instruction detection
- Prompt complexity score
- Prompt version history (beyond simple save-per-run)
- SDK / CLI / VS Code extension
- Public REST API
- Monetization/billing

---

## 12. Future Roadmap

- Exact token counting expanded to more providers
- Prompt optimization suggestions
- Duplicate instruction detection
- Prompt complexity score
- Prompt version history / diffing
- JSON/CSV export
- Public SDK (`@prompt-inspector/core`)
- CLI (`prompt-inspector`)
- VS Code extension
- Public REST API

---

## 13. Success Metrics (suggested)

- Weekly active users returning to run a new analysis
- % of analyses using BYOK exact counts vs local estimation
- Number of shared-link views per analysis
- Model registry freshness (days since last pricing update)

*(Since there's no monetization, metrics should focus on usage/retention rather than revenue.)*

---

## 14. Open Questions

1. **BYOK key storage** — recommended: encrypted server-side storage via InsForge, decrypted only at request time. Confirm this is acceptable, or if session-only (never persisted) is preferred for lower liability.
2. **Sharing scope** — should shared links be fully public (anyone with the link, no auth) or restricted to logged-in viewers only?
3. **Model registry update cadence** — manual updates, scheduled job, or community-contributed (like LiteLLM)?
4. **Data retention** — how long is analysis history retained? Any user-initiated bulk delete?
5. **Rate limiting** — needed for local tokenization to prevent abuse (e.g. extremely large prompt spam)?

---

## 15. Backend Setup Instructions (InsForge) — For Coding Agent

Before implementing any backend features (§6.1, §6.5, §6.6, §6.7), the coding agent must provision InsForge for this project. Two setup paths are available — use whichever is configured in the agent's environment; the MCP path is preferred where available since it lets the agent manage InsForge interactively without shelling out.

### 15.1 Path A — InsForge MCP (preferred, already being configured)

The project is being set up with the **InsForge MCP server** wired into the coding agent. When available, the agent should:
1. Confirm the InsForge MCP tools are visible in its tool list before falling back to CLI commands.
2. Use the MCP tools to authenticate, create/link the project, and provision schema/auth directly — this replaces manual `npx @insforge/cli` invocations for day-to-day work.
3. Still respect the same secret-handling rules as Path B: no API keys hardcoded in source, config, or committed files.
4. If the MCP connection fails or isn't available in a given session, fall back to Path B (CLI).

### 15.2 Path B — InsForge CLI (fallback / initial bootstrap)

1. **Authenticate the CLI**
   ```
   npx @insforge/cli login --user-api-key $INSFORGE_USER_API_KEY
   ```
   The user API key must be supplied via the `INSFORGE_USER_API_KEY` environment variable — never hardcode it in source, config files, or commit it to version control. Ask the user to export it in their shell (`export INSFORGE_USER_API_KEY=uak_...`) before running this step, or store it in a local, git-ignored `.env` file.

2. **Create (or link) the InsForge project**
   - New project, linked to this directory:
     ```
     npx @insforge/cli create
     ```
   - Or, if a project already exists for this app:
     ```
     npx @insforge/cli link
     ```
   This installs the InsForge agent skills locally and writes an `AGENTS.md` file to the project root.

3. **Read `AGENTS.md` in full** before writing any backend code. It contains project-specific InsForge configuration (project ID, environment, generated skill locations) that supersedes generic assumptions.

4. **Follow the InsForge skills for implementation:**
   - **`insforge-cli` skill** — for backend infrastructure setup: provisioning the Postgres database/tables (User, ApiKey, Analysis, AnalysisResult, ModelRegistry per §10), configuring auth, and any InsForge project-level configuration.
   - **`insforge` skill** — for application-level code: wiring the Next.js app to InsForge's SDK for auth (§6.1), data reads/writes for history and sharing (§6.5), and encrypted storage/retrieval of BYOK keys (§6.6).

5. **Security note:** the encrypted-storage approach for BYOK keys (§6.6, §14.1) should be implemented using InsForge's server-side data storage with encryption at rest — keys must never be exposed to client-side code after initial save, and any InsForge table storing them should not be publicly readable per InsForge's row-level access rules.

6. **Do not commit** `AGENTS.md`-referenced credentials, `.env` files, or any InsForge-generated secrets to version control. Add them to `.gitignore` if not already excluded.

> **Note for the user:** the API key shared in chat during this setup should be rotated in the InsForge dashboard once initial setup is complete, since it was transmitted in plaintext through this conversation.

---

## 16. Background Jobs (Inngest)

The project is being set up with **Inngest MCP** wired into the coding agent for local dev-server introspection (listing functions, sending test events, inspecting runs) alongside Inngest's official agent skills for guided implementation.

### 16.1 Use Cases in This Project
- **Model registry refresh** — scheduled job to periodically re-sync pricing/context-window/model-status data (§6.7) against LiteLLM registry, OpenRouter catalog, and official provider docs, keeping the registry's `last_updated` field current.
- **Stale-key hygiene** — scheduled job to flag or notify users about BYOK keys unused for an extended period (supports §6.6 key lifecycle).
- **Async exact-count fallback** — if a live provider `countTokens`/`count_tokens` call is slow or rate-limited, offload it to a durable Inngest function with retries rather than blocking the request.

### 16.2 Setup Instructions for Coding Agent
1. Confirm the Inngest MCP server and dev-server MCP integration are available in the agent's tool list before implementing background functions.
2. Install and configure Inngest per its official TypeScript setup (Inngest client, `serve()` handler as a Next.js Route Handler, e.g. `app/api/inngest/route.ts`).
3. Use the Inngest agent skills (installed via its Claude Code/Codex plugin, or the standalone skills repo) for current API guidance — do not rely on possibly-outdated built-in knowledge of Inngest's function/step/event APIs.
4. Define functions for the use cases in §16.1 as separate, named Inngest functions with appropriate scheduling (cron) or event triggers.
5. Use the Inngest Dev Server MCP during local development to list registered functions, manually trigger test events, and inspect run history/failures before deploying.
6. No API keys or secrets should be hardcoded in Inngest function files — use environment variables, consistent with the InsForge secret-handling rules in §15.

---

## 17. External References

**Model metadata:** LiteLLM model registry, OpenRouter model catalog, official provider docs (OpenAI, Anthropic, Google, xAI, Mistral)

**Tokenizers:** Tiktoken, Hugging Face Tokenizers, Google Gemini Count Tokens API, Anthropic Count Tokens API

**Pricing sources:** OpenAI, Anthropic, Google AI, Groq, xAI, Mistral, Together AI, Fireworks AI, OpenRouter
