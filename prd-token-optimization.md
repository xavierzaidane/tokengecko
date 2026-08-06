# PRD — Token Optimization (Prompt/Context Savings in CLI Proxy)

**Status:** Draft v1
**Type:** Feature addition to `@tokengecko/cli` proxy (see `prd-cli-proxy.md` — prerequisite)
**Phase:** **Explicitly a separate, later phase.** Not part of the initial CLI proxy release. The proxy must ship first as a pure inspection/observability tool (read-only, non-mutating) before any token-modifying behavior is introduced.
**Last updated:** 2026-08-06

---

## 1. Overview

The CLI proxy (`tokengecko proxy`) sits between a developer's AI coding tool (Claude Code, Aider, etc.) and the upstream API, giving live visibility into token usage and cost. This PRD extends that proxy with **optional, opt-in token-saving transformations** — modifying outgoing requests to reduce token count/cost before they reach the upstream API.

This is a **higher-risk, trust-sensitive feature** compared to the base proxy, because it changes what the model actually receives rather than just observing it. It must be built and shipped as a clearly separated phase, disabled by default, with full transparency into what was changed.

---

## 2. Goals & Non-Goals

### Goals
- Reduce token usage/cost for long agentic coding sessions where context bloat (repeated file contents, stale history) is the dominant cost driver
- Give users full visibility into any transformation applied — nothing silently altered without a visible diff
- Ship the lowest-risk optimizations first; gate higher-risk ones behind explicit opt-in and clear warnings
- Keep every optimization independently toggleable — a user should be able to enable "history trimming" without also enabling "LLM-based compression"

### Non-Goals (this phase)
- Not a replacement for the base proxy's inspection functionality — optimization builds on top of it, not instead of it
- Not enabled by default under any circumstances — the base proxy install/setup must never silently start modifying requests
- Not attempting semantic-preserving guarantees for LLM-based compression (§5.4) — that technique is explicitly flagged as best-effort and experimental, not production-safe by default
- No cross-session persistent caching/state beyond what's needed for within-session deduplication (§5.3) in this phase — no long-term memory store

---

## 3. Why This Is a Separate Phase

1. **Trust:** the base proxy's value proposition is accurate observability. If early users can't trust that the proxy shows them the *real* prompt/cost, that undermines the core product. Optimization must be introduced only after inspection is proven reliable.
2. **Risk profile is different:** inspection is read-only and can't break a user's coding session. Optimization mutates requests and can degrade output quality, break agentic tool behavior (e.g. a coding tool expecting its full context to be present), or introduce latency.
3. **Debuggability:** if a user gets a bad response from their coding tool, they need to be able to instantly rule out "did the proxy change my prompt?" as a variable. Shipping this later, opt-in, with clear diffs, keeps that debugging path clean.

---

## 4. Techniques, Ranked by Risk

| Technique | Risk | Expected Impact | Default State |
|---|---|---|---|
| Whitespace/comment stripping | Low | Small | Opt-in, safe to suggest enabling early |
| History/context trimming | Medium | **Large** (primary driver for agentic sessions) | Opt-in |
| File/context deduplication | Medium | Large (in long sessions with repeated file reads) | Opt-in |
| LLM-based prompt compression | High | Medium, highly variable | Opt-in, requires explicit acknowledgment/warning on enable |

### 4.1 Whitespace & Redundancy Stripping
Strip excess blank lines, redundant whitespace, and boilerplate that doesn't affect meaning. Deterministic, reversible-in-spirit (doesn't change semantic content), lowest risk.

### 4.2 History/Context Trimming
For tools that resend full conversation history each request (a common pattern), detect and drop turns/context that are no longer relevant to the current request — e.g. file contents referenced early in a session that haven't been touched since and aren't part of the current diff/turn.

- Requires a heuristic for "relevance" (recency-weighted, or reference-tracking — does the current turn still reference this file/symbol?)
- This is the single highest-impact optimization for agentic coding tools, where context window fill from accumulated history is the dominant cost driver — but also the one most likely to remove something the model actually needed. Needs careful heuristics and a visible trim log.

### 4.3 File/Context Deduplication
When the same file content is sent multiple times within a session (common when agentic tools re-send full file state per turn), detect exact or near-duplicate blocks already seen in a prior request within the same session and either drop them or replace with a short reference marker, depending on what the upstream API/tool supports.

- In-memory only, scoped to the current proxy session — no persistent cross-session cache in this phase (see Non-Goals)

### 4.4 LLM-Based Prompt Compression (Experimental)
Use a small/cheap model to summarize or compress verbose prompt text before forwarding to the primary model.

- **Explicitly flagged high-risk:** precision matters for code — variable names, file paths, exact instructions, and stated edge cases can be lost in compression
- Adds a synchronous API call (latency cost) before the real request goes out, working against the proxy's "live/fast" value proposition
- Must never run on code blocks/diffs themselves — text-only, and even then, off by default with a required explicit warning acknowledgment on first enable (e.g. `tokengecko proxy --optimize=compress --i-understand-the-risk`)
- Consider deferring entirely past this phase pending user demand — included here for completeness, not as a committed deliverable

---

## 5. Technical Requirements

### 5.1 Activation & Configuration
- All optimizations off by default: `tokengecko proxy` alone behaves exactly as the base (inspection-only) proxy
- Enabled via explicit flags or config file, individually toggleable:
  ```
  tokengecko proxy --optimize=whitespace,history,dedup
  ```
- Config file equivalent (e.g. `tokengecko.config.json`) for persistent per-project settings, so flags don't need to be retyped every run
- Each optimization independently toggleable — no bundled "optimize=all" shortcut that silently includes the high-risk compression technique

### 5.2 Transparency / Diff Visibility
- Every applied transformation must be logged to the live terminal feed alongside the existing token/cost stats, showing at minimum: which optimization fired, and how many tokens it removed
- A `--verbose-diff` mode should show the actual before/after content removed (not just a count), so users can audit exactly what was dropped before trusting the feature long-term
- Dashboard (if `--dashboard` is running) should surface a "tokens saved" metric distinct from "tokens used," never merging the two silently

### 5.3 Safety Rails
- History trimming and dedup must never touch the **current/latest** user turn or the most recent file state relevant to it — only prior, stale context is eligible for trimming
- A kill switch: any optimization can be disabled mid-session without restarting the proxy (e.g. a runtime command or hotkey in the terminal UI), for fast recovery if a user notices degraded output quality
- Session-scoped only (§4.3) — no optimization state persists or affects a different coding session

### 5.4 Measuring Effectiveness / Quality Impact
- This phase should include a way to compare output quality with optimization on vs. off for the same underlying task, even if informal (e.g. side-by-side session replay) — since token savings that come at the cost of broken agentic tool behavior isn't a net win
- Recommend an internal beta/dogfooding period before promoting any optimization beyond "experimental" labeling, especially history trimming (§4.2) given its impact-to-risk ratio

---

## 6. Open Questions

1. Does the relevance heuristic for history trimming (§4.2) need to be tool-aware (different logic for Claude Code vs. Aider's context format), or can one general heuristic work across tools in v1?
2. Should file/context dedup (§4.3) attempt cross-request diffing (only send the changed lines of a re-sent file) rather than binary include/exclude — bigger engineering lift, but likely much better savings-to-risk ratio than dropping whole file blocks?
3. Is LLM-based compression (§4.4) worth building at all in a near-term phase, or should it stay unscheduled pending explicit user demand post-launch of the safer optimizations?
4. What upstream API behavior needs verification per-tool — does dropping context ever cause a tool to detect an inconsistent state and error out, rather than just producing a worse response? Needs empirical testing against real Claude Code/Aider sessions before shipping history trimming beyond experimental status.

---

## 7. Implementation Notes for Coding Agent

- **Do not implement any part of this PRD until the base CLI proxy (inspection-only) has shipped and been validated.** This PRD depends on that proxy's request-interception plumbing already existing and being stable.
- Build order within this phase, if greenlit:
  1. Whitespace/comment stripping (lowest risk, validates the request-mutation pipeline works end-to-end)
  2. Transparency/diff logging (§5.2) — build this before any higher-impact optimization, so every subsequent technique is visible/auditable from day one
  3. File/context deduplication (§4.3)
  4. History/context trimming (§4.2) — highest impact, ship behind an "experimental" label and gather real usage data before promoting to stable
  5. LLM-based compression (§4.4) — do not build without explicit product sign-off given the risk profile; treat as unscheduled by default
- All optimization logic should be isolated in its own module (e.g. `src/optimize/`) separate from the core proxy/inspection code, so it can be entirely disabled or removed without touching the stable inspection path.
