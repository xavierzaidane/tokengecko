# PRD — TokenGecko: Registry Sync Fix & Explicit "Analyze" Flow

**Status:** Draft v1
**Type:** Bug fix + UX flow change to existing TokenGecko app
**Last updated:** 2026-07-27

---

## 1. Overview

Two related problems observed in the current build:

1. **Data desync**: the model catalog (Prompt & Model Setup tab) now correctly fetches live pricing/context data from OpenRouter, but the **Optimization & Health**, **Comparison Matrix**, and **Context Capacity** tabs are not consistently reflecting that same fetched data — they appear to be computing from a different, stale, or disconnected snapshot.
2. **No explicit analysis trigger**: currently the app appears to update continuously/implicitly as the user types or changes model selection, with no clear "run it" moment. The desired flow instead is: user writes the prompt, selects model(s), presses an explicit **Analyze** action, and the app then computes the full analysis and **automatically navigates to the Optimization & Health tab** to show results.

This PRD fixes the sync bug and formalizes the analysis flow around a single, explicit trigger and a single source-of-truth analysis result that every tab reads from.

---

## 2. Problem Statement

### 2.1 Root Cause of Desync (likely)
Each tab (Setup, Optimization & Health, Comparison Matrix, Context Capacity) is almost certainly computing its own view from whatever data it has locally in scope, rather than all reading from one shared, already-computed analysis result. When the registry fetch (from the prior PRD) updated the Setup tab's model cards, nothing re-ran the computations feeding the other three tabs, so they kept showing values derived from the old hardcoded `DEFAULT_MODELS` data or a stale in-memory copy.

### 2.2 Problem with Implicit/Continuous Updates
Recomputing on every keystroke or selection change:
- Wastes tokenizer/cost computation cycles on intermediate, throwaway states
- Makes it unclear to the user *when* the numbers they're looking at are "final" vs. mid-edit
- Makes the multi-tab desync bug (§2.1) worse, since there's no clear moment where all tabs are guaranteed to reflect the same input

---

## 3. Goals & Non-Goals

### Goals
- One shared analysis result object that every tab reads from — no tab computes its own independent view of the same data
- One explicit user action ("Analyze") that triggers computation, rather than continuous implicit recomputation
- After a successful analysis, automatically navigate the user to the **Optimization & Health** tab, since that's the most actionable summary view
- Editing the prompt or model selection after an analysis has run should clearly mark the current results as stale, not silently keep showing outdated numbers as if current

### Non-Goals
- Removing manual tab navigation entirely — users should still be able to freely click between tabs after analysis to inspect Comparison Matrix / Context Capacity in detail
- Real-time collaborative analysis (multi-user editing the same prompt) — out of scope

---

## 4. Proposed Architecture

### 4.1 Single Source of Truth: `AnalysisState`
Introduce one shared state object (e.g. in a store or top-level context) that all four tabs read from — no tab-local computation of tokens, cost, health, or recommendations.

```ts
type AnalysisState = {
  status: "idle" | "analyzing" | "ready" | "stale" | "error";
  input: {
    promptText: string;
    selectedModelIds: string[];
    targetOutputTokens: number;
  };
  result: {
    perModel: NormalizedOutput[];       // existing schema, base PRD §9
    recommendations: Recommendation[];  // existing schema, optimization PRD §5.3
    contextCapacity: ContextCapacityData;
    computedAt: string;
    registrySnapshot: { source: string; lastSyncedAt: string }; // which registry data this run used
  } | null;
  error?: string;
};
```

- **Setup tab** writes to `input` (prompt text, model selection, target output tokens) as the user edits — this is the only tab that mutates `input` directly.
- **Optimization & Health**, **Comparison Matrix**, and **Context Capacity** tabs are **read-only consumers** of `result` — they never recompute independently. This directly fixes the desync bug, since there's only one computation path and one place all four tabs pull from.
- `registrySnapshot` is stored with each result so it's traceable which pricing data (and its freshness) produced a given analysis — useful for debugging exactly the kind of desync issue currently observed.

### 4.2 Explicit Analyze Trigger
- Replace continuous/implicit recomputation with a single **"Analyze" button** (primary action on the Setup tab, visually prominent — likely replacing or sitting alongside the current "Save Analysis" button placement).
- Pressing Analyze:
  1. Sets `status: "analyzing"`
  2. Runs tokenization, cost calculation, health scoring, and recommendation generation once, using the **current** registry data (fetched per the dynamic registry PRD) — snapshot the registry state used into `registrySnapshot`
  3. Sets `status: "ready"` and populates `result`
  4. **Automatically switches the active tab to "Optimization & Health"**
- "Save Analysis" (persisting to the Inspection Vault) remains a separate, subsequent action — a user can Analyze multiple times before deciding to Save, consistent with the existing Vault behavior.

### 4.3 Staleness Handling
- If the user edits the prompt text or changes model selection **after** an analysis has run (`status: "ready"`), set `status: "stale"` rather than clearing `result` or silently leaving it looking current.
- While `status: "stale"`:
  - Keep showing the last computed `result` in the other three tabs (don't blank them), but with a clear visual indicator ("Results are out of date — re-run Analyze") in each tab, not just the Setup tab.
  - The Analyze button becomes the obvious next action (e.g. re-labeled "Re-analyze" or given a distinct highlighted state).
- This directly prevents the class of bug in §2.1 — a user can never be looking at Comparison Matrix numbers that silently belong to a different prompt/model selection than what's currently in the editor.

### 4.4 Auto-Navigation Behavior
- On successful `status: "ready"` transition, switch active tab to **Optimization & Health**.
- If the user manually navigates to a different tab afterward, respect that — auto-navigation only fires once, immediately after a successful Analyze action, not on every state change.
- If `status` becomes `"error"` (analysis failed — e.g. a BYOK exact-count call failed and there's no fallback), stay on the **Setup** tab and surface the error there rather than navigating away from where the user can fix the input.

---

## 5. Registry Sync Fix — Specifics

- Confirm all four tabs import model registry data (pricing, context window, quality scores) from the **same single read path** described in the dynamic-registry PRD (InsForge `model_registry` table, with `DEFAULT_MODELS` as fallback only) — not from a locally cached copy, a prop drilled at mount time, or a separate fetch per tab.
- The Analyze action (§4.2) should read the registry **once** at the start of computation and use that single read for every downstream calculation in that run (tokenization cost, comparison matrix, context capacity, recommendations) — this guarantees internal consistency within one analysis run even if the registry updates again mid-session.
- Add the `registrySnapshot.lastSyncedAt` (§4.1) to the Optimization & Health or Comparison Matrix tab UI in small print, so a stale-registry issue is visible/debuggable in the future rather than silently wrong again.

---

## 6. UI Changes

- **Setup tab**: add/promote a clear **"Analyze"** primary button. Disable it (with a tooltip) if no prompt text or no models are selected.
- **Tab bar**: the "3" badge currently shown on "Optimization & Health" should reflect the **current `result`'s** recommendation count — read from `AnalysisState.result`, not computed independently by that tab (ties directly into §4.1's fix).
- **Stale indicator**: small banner or dot on affected tabs when `status: "stale"` (§4.3).
- **Loading state**: while `status: "analyzing"`, disable the Analyze button and show a lightweight in-progress indicator (spinner or skeleton on the destination tab) — analysis should feel close to instant for local-only computation, but BYOK exact-count calls may add latency, so don't assume it's always sub-second.

---

## 7. Edge Cases

- User presses Analyze with zero models selected → button should be disabled, not silently no-op.
- User presses Analyze, then immediately edits the prompt before computation finishes → either queue a re-run after the in-flight one completes, or ignore the edit until `status` leaves `"analyzing"` (recommend the latter for simplicity — block edits or clearly mark them as "will require re-analysis" without interrupting the in-flight run).
- User navigates directly to Comparison Matrix/Context Capacity tabs with `status: "idle"` (never analyzed yet) → show an empty state prompting them back to Setup + Analyze, not a blank/broken table.
- BYOK-enhanced recommendation call (optimization PRD §5.4) fails mid-analysis → the rest of the analysis (tokens, cost, local recommendations) should still complete and populate `result`; only the enhanced-suggestion portion should show its own inline error, not fail the whole run.

---

## 8. Success Metrics

- Zero observed cases of two tabs showing analysis numbers computed from different registry snapshots or different prompt/model inputs (the core bug this PRD fixes)
- % of Analyze runs that result in the user reaching Optimization & Health via auto-navigation vs. manually clicking there (should be near 100% given the new behavior)
- Reduction in "stale-looking" support/feedback reports, if tracked

---

## 9. Open Questions

1. **Auto-navigate always, or only first time per session?** Confirmed default: fires every successful Analyze/Re-analyze, not just the first. Flag if you'd prefer it only auto-navigate the very first time and respect manual tab choice on subsequent re-runs within the same session.
2. **Should "Save Analysis" be disabled while `status: "stale"`?** Recommend yes — saving a stale result to the Inspection Vault would persist a mismatch between saved prompt/model state and saved numbers. Confirm.
3. **Debounce vs. fully manual for prompt stats?** Live char/word/line counts (Monaco-driven, from the base editor PRD) are cheap and fine to keep live-updating without Analyze — only the heavier computation (tokenization across all selected models, cost, health, recommendations) should be gated behind the explicit Analyze action. Confirm this split is the intended scope.

---

## 10. Implementation Notes for Coding Agent

- Build order: (1) introduce the shared `AnalysisState` and refactor all four tabs to read from it exclusively, removing any tab-local computation — this alone fixes the desync bug even before the Analyze-button UX change ships → (2) add the explicit Analyze action and status state machine (§4.2) → (3) implement staleness detection and indicators (§4.3) → (4) implement auto-navigation on successful analysis (§4.4) → (5) add the `registrySnapshot` traceability field (§5) last, as a debugging aid once the core flow is stable.
- This is a refactor of existing state management, not new feature surface — prioritize correctness of the single-source-of-truth read path over new UI polish.
- Reuse existing schemas (`NormalizedOutput` from base PRD §9, `Recommendation` from optimization PRD §5.3) inside `AnalysisState.result` — don't introduce parallel types.
