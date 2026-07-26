# PRD — Prompt Inspector: IDE Editor, Inspection Summary & Optimization Engine

**Status:** Draft v1
**Type:** Feature addition to existing Prompt Inspector app
**Last updated:** 2026-07-26

---

## 1. Overview

This PRD covers three connected upgrades to the existing Prompt Inspector app:

1. **IDE-style Prompt Editor** — replace the plain textarea with Monaco Editor, with live line numbers and live token/word/character counts, as the app's primary focus area.
2. **Inspection Summary panel** — replace the raw per-model output panel with a synthesized "dashboard" view: total tokens, estimated cost, prompt health, cheapest model, largest-context model, and top recommendations — always visible.
3. **Optimization & Recommendation Engine** — after analysis, surface concrete, actionable suggestions (cost-saving model swaps, duplicate/redundant content detection, context-fit confirmation, token-share breakdown by prompt section).

These build on the existing MVP (tokenization engine, multi-model comparison, history/sharing, BYOK, InsForge backend, Inngest jobs) — see the base `prd.md` for that foundation. This document only covers what's new.

---

## 2. Goals & Non-Goals

### Goals
- Make the editor itself feel like a professional dev tool (Monaco), not a plain form field
- Turn scattered comparison data into a single at-a-glance "so what do I do" summary
- Give users specific, actionable next steps instead of just numbers

### Non-Goals (this phase)
- Automatic prompt rewriting / one-click "apply fix" (recommendations are informational only, no auto-edit, for this phase)
- Multi-file / multi-prompt projects inside the editor
- Real-time collaborative editing

---

## 3. Feature 1 — IDE-Style Prompt Editor

### 3.1 Requirements
- Replace the current textarea with **Monaco Editor** (`@monaco-editor/react` or equivalent)
- Line numbers enabled by default
- Syntax highlighting mode: plain text / markdown by default; detect and offer JSON highlighting if the prompt looks like a JSON payload (supports the "JSON payload contributes X% of tokens" recommendation in §5)
- Live, non-blocking updates (debounced) for:
  - Character count
  - Word count
  - Line count
  - Live token count per currently-selected model(s) — reuses existing tokenization engine (base PRD §6.3)
- Editor takes primary visual real estate (majority of viewport width on desktop); summary/recommendation panels are secondary, docked to the side
- Preserve existing prompt persistence/history behavior (base PRD §6.5) — Monaco's content is the source of truth for what gets saved

### 3.2 Technical Notes
- Monaco is a large dependency (~2-3MB) — lazy-load it client-side only (no SSR) to avoid hurting initial page load
- Debounce live token/stat recalculation (e.g. 150-300ms after last keystroke) to avoid re-running tokenizers on every keypress, especially for larger open-weight tokenizers
- Keep the existing char/word/sentence/line stats logic from base PRD §6.2 — just relocate it to live-update from Monaco's change events instead of a plain textarea's `onChange`

---

## 4. Feature 2 — Inspection Summary Panel

### 4.1 Requirements
Replace/augment the raw per-model comparison table with a persistent summary panel showing:

| Field | Description |
|---|---|
| **Total tokens** | Token count for the currently-focused/primary model (or an aggregate if multiple selected) |
| **Estimated cost** | Total estimated cost across selected models, or per-model if multiple |
| **Prompt health** | A simple status indicator (e.g. Good / Warning / Over Limit) based on context-fit and redundancy signals (§4.2) |
| **Cheapest model** | Which selected model has the lowest estimated total cost for this prompt |
| **Largest context model** | Which selected model has the most remaining context headroom |
| **Top recommendation(s)** | 1-3 highest-priority suggestions from the Optimization Engine (§5) |

- This panel is **always visible** (not something the user has to click into) — it should update live as the prompt or model selection changes
- The detailed per-model comparison table (base PRD §6.4) remains available, but demoted to a secondary/expandable view rather than the primary focus
- Panel should work responsively — on mobile, this likely becomes a collapsible section above or below the editor rather than a side panel

### 4.2 "Prompt Health" — Definition
A simple derived status, not a new ML model:
- **Over Limit** — prompt exceeds the context window of one or more selected models
- **Warning** — prompt fits but uses >80% of context window on at least one selected model, or has significant detected redundancy (see §5.2)
- **Good** — fits comfortably within context on all selected models, no major redundancy flagged

---

## 5. Feature 3 — Optimization & Recommendation Engine

### 5.1 Recommendation Types (from the request)
The engine should be able to generate recommendations like:
1. **Cheaper-model swap** — "Switch to [Model] to reduce cost by ~X%." Computed directly from existing per-model cost data (base PRD §9) — no new data source needed, just a comparison + ranking step.
2. **Redundancy/duplication detection** — "Remove duplicated instructions to save ~N tokens." Requires new logic (§5.2).
3. **Context-fit confirmation** — "Prompt fits all selected models." Straightforward derived from existing context-window data.
4. **Token-share breakdown** — "JSON payload contributes 41% of total tokens." Requires segmenting the prompt into identifiable sections (e.g. JSON blocks, code blocks, plain instruction text) and computing each segment's token share.

### 5.2 Recommended Approach: Hybrid (Rule-Based + Optional LLM-Assisted)

Given this project is free/open-source with no monetization (base PRD §3), the default recommendation engine should be **rule-based and fully local**, so it works for every user with zero added API cost:

- **Cheaper-model swap** and **context-fit confirmation**: pure computation over existing tokenization/cost/context data — no new dependency.
- **Token-share breakdown**: pattern-based prompt segmentation (detect fenced code blocks, JSON-like blocks via brace/bracket structure, and plain text), tokenize each segment separately, compute % share. This is deterministic and doesn't require an LLM.
- **Redundancy/duplication detection**: start with a **local, non-AI heuristic** — sentence/line-level similarity (e.g. simple n-gram overlap or a lightweight embedding-free similarity check) to flag near-duplicate lines or instructions. This avoids requiring an API key for every user.

**Optional upgrade path (BYOK-gated):** if a user has already connected an Anthropic or Gemini key (base PRD §6.6), offer an **opt-in "Enhanced Suggestions"** mode that sends the prompt to their own connected model for higher-quality semantic redundancy detection and rewrite-style suggestions. This is:
- Off by default
- Clearly labeled as using the user's own API key/quota
- Never required for the core recommendation features to work

> **Open question:** confirm this hybrid approach (local rules by default, optional BYOK-powered enhancement) is the right split, versus making the whole engine LLM-powered from the start. The local-first approach keeps the app usable with zero API keys, consistent with the existing "works primarily offline" principle from the base PRD.

### 5.3 Recommendation Data Model
Each recommendation is a structured object, not just a string, so the UI can render icons/severity/CTAs consistently:

```json
{
  "type": "cheaper_model_swap",
  "severity": "info",
  "message": "Switch to Gemini Flash to reduce cost by 68%.",
  "details": {
    "fromModel": "gpt-5",
    "toModel": "gemini-flash",
    "costDelta": -0.0041,
    "costDeltaPercent": -68
  }
}
```

Recommendation `type` enum (extensible): `cheaper_model_swap`, `redundancy_detected`, `context_fit_ok`, `context_over_limit`, `token_share_breakdown`.

### 5.4 Where Recommendations Are Computed
- All rule-based recommendations are computed **client-side or in a lightweight server function** immediately after a comparison run completes — no need for Inngest here since this isn't a long-running/background task.
- The optional BYOK-enhanced mode (§5.2) should go through the same async/exact-count pattern already established for BYOK provider calls in the base PRD, including the Inngest durable-retry fallback (base PRD §16) if the call is slow.

---

## 6. Updated Data Model

Extends base PRD §10:

- **AnalysisResult** (existing) — add optional `recommendations: Recommendation[]` (JSON array per §5.3), computed at analysis time and persisted alongside the result so history/shared views can show the same recommendations without recomputation.
- No new tables required for the rule-based engine. If "Enhanced Suggestions" (BYOK-powered) ships, no schema change needed either — it's just a different value in the same `recommendations` field, tagged with `source: "local"` or `source: "enhanced"`.

---

## 7. UI/UX Summary

- **Layout:** Editor (Monaco) as primary focus, Inspection Summary panel docked alongside it and always visible, detailed comparison table demoted to secondary/expandable.
- **Recommendations:** shown both inline in the Inspection Summary (top 1-3) and in full in an expandable "All Recommendations" list.
- Severity should be visually distinct (e.g. info vs warning vs over-limit) — ties into the "Prompt health" indicator in §4.2.

---

## 8. Success Metrics

- % of analyses where at least one recommendation is shown
- % of users who act on a "cheaper model swap" recommendation (i.e. re-run with the suggested model) — if tracked
- Reduction in average "Over Limit" prompt-health occurrences over time (proxy for whether recommendations help users course-correct)

---

## 9. Open Questions

1. **Rule-based vs LLM-powered by default** — confirmed recommendation: local rule-based by default, optional BYOK-enhanced mode. Confirm or override (§5.2).
2. **Redundancy detection sensitivity** — how aggressive should duplicate-instruction flagging be? Needs tuning/testing to avoid false positives on intentionally repeated emphasis.
3. **Token-share segmentation granularity** — is code/JSON/plain-text enough, or do you also want per-section breakdown for things like system prompt vs few-shot examples vs user query?
4. **Recommendation persistence** — should recommendations be recomputed if the user revisits an old analysis (in case the model registry/pricing changed since), or frozen at save time? Recommend: recompute on view, since pricing can go stale.
5. **Mobile layout** — confirm the collapsible-panel approach for the Inspection Summary on small screens is acceptable, given Monaco itself is not ideal on mobile.

---

## 10. Implementation Notes for Coding Agent

- This is additive to the existing app — do not regenerate the tokenization engine, model registry, or BYOK logic; reuse them as data sources for §5.
- Suggested build order: (1) swap in Monaco Editor and wire live stats → (2) build the Inspection Summary panel using existing comparison data → (3) implement rule-based recommendations (§5.2, local only) → (4) wire the optional BYOK-enhanced mode last, since it depends on existing BYOK infrastructure (base PRD §6.6) and its async/Inngest pattern (base PRD §16).
- Reuse base PRD §9's standardized output schema as the input to the recommendation engine — don't create a parallel data shape.
