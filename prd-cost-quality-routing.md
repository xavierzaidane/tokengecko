# PRD — TokenGecko: Cost/Quality-Aware Model Routing

**Status:** Draft v1
**Type:** Feature addition to existing TokenGecko app
**Last updated:** 2026-07-26

---

## 1. Overview

Today, TokenGecko's optimization engine (`lib/optimization/`) recommends cheaper models based purely on cost — e.g. *"Switch to Gemini Flash to reduce cost by 68%."* This is misleading in isolation: a cheaper model may be meaningfully worse at the task the prompt is doing.

This feature adds a **quality dimension** to the model registry (`lib/models/`) and recommendation engine, so recommendations become cost **and** quality aware — e.g. *"Gemini Flash is 68% cheaper but scores lower on reasoning — Claude Haiku offers a better cost/quality tradeoff for this prompt."*

---

## 2. Goals & Non-Goals

### Goals
- Add a quality/capability signal per model, sourced from public benchmarks
- Compute a cost/quality tradeoff score, not just raw cost, for use in recommendations
- Let the recommendation type from "cheaper model" evolve into "best tradeoff" without breaking the existing schema
- Classify prompts by rough task type (reasoning, coding, summarization, general) so quality comparisons are relevant to what the prompt is actually doing, not a single global score

### Non-Goals (this phase)
- Running TokenGecko's own benchmark evaluations — this relies on existing public benchmark data, not new eval infrastructure
- Per-user personalized quality preferences (e.g. "I only care about coding ability") — global/task-type scoring only for now
- Guaranteeing benchmark accuracy — TokenGecko is aggregating third-party scores, not certifying them

---

## 3. Problem / Motivation

Cost-only recommendations optimize for the wrong thing when the cheaper model can't actually do the job well. Prompt engineers already intuitively discount pure cost comparisons because they know this — so a cost-only recommendation is easy to distrust. Adding a credible quality signal makes the recommendation something a user can actually act on with confidence, and is a genuine differentiator: most token-counting tools stop at cost.

---

## 4. Data Source for Quality Scores

### 4.1 Candidate Sources
Aggregate from one or more public, regularly-updated benchmark sources rather than inventing new ones:
- **Artificial Analysis** (cross-provider quality + speed + cost index)
- **LMSYS Chatbot Arena / LMArena** (human-preference Elo ranking)
- **LiveBench** (contamination-resistant, regularly refreshed benchmark suite)
- **Official provider-reported scores** (MMLU, GPQA, HumanEval, etc.) as a fallback where independent aggregators don't cover a model yet

> **Open question:** confirm which source(s) to use as primary — this affects licensing/scraping terms and update cadence. Recommend starting with **one** well-maintained aggregator (e.g. Artificial Analysis or LiveBench) rather than blending multiple scoring methodologies, since blended composite scores across incompatible benchmarks are hard to justify and harder to explain to users.

### 4.2 Task-Type Categorization
Rather than a single opaque "quality score," store per-model scores across a small set of task categories relevant to prompt engineering work:
- **Reasoning** (math/logic-heavy benchmarks)
- **Coding** (HumanEval-style / code benchmarks)
- **Instruction-following / general** (MMLU-style / general chat benchmarks)
- **Long-context** (needle-in-haystack / long-context retrieval benchmarks, complements existing context-window data)

A prompt should be classified into one primary task type (see §5.2) so the recommendation compares models on the *relevant* axis, not a generic average.

### 4.3 Freshness
- Quality scores go stale slower than pricing, but should still be refreshed periodically.
- Extend the **existing Inngest model-registry refresh job** (already re-syncing pricing/context-window data) to also re-sync quality scores on the same or a slower cadence (e.g. weekly instead of daily, since benchmark leaderboards move less frequently than pricing).

---

## 5. Scoring Model

### 5.1 Data Model Addition
Extend the model registry entries in `lib/models/` with a `qualityScores` object:

```json
{
  "modelId": "gemini-flash",
  "qualityScores": {
    "reasoning": 71,
    "coding": 65,
    "general": 78,
    "longContext": 82,
    "source": "livebench",
    "lastUpdated": "2026-07-20"
  }
}
```

Scores normalized to a common 0-100 scale per category, regardless of the underlying benchmark's native scale, so they're comparable across models even if sourced at different times.

### 5.2 Prompt Task-Type Classification
Lightweight, local, rule-based classification (consistent with the existing rule-based optimization engine — no LLM call required):
- **Coding**: presence of code fences, common language keywords, file extensions
- **Reasoning**: presence of math notation, step-by-step/logic-indicating language, structured problem statements
- **Long-context**: prompt length relative to context window (e.g. prompt uses a large share of context and includes reference documents/data)
- **General**: default fallback if no strong signal for the above

This reuses the same segmentation approach already built for the "JSON payload contributes X% of tokens" feature — no new parsing infrastructure needed, just new classification rules on top of it.

### 5.3 Tradeoff Score
For a given prompt (classified into a task type) and a set of candidate models:

```
tradeoffScore = normalizedQuality(taskType) / normalizedCost
```

- `normalizedCost` = estimated total cost for this specific prompt (already computed by the existing engine)
- `normalizedQuality(taskType)` = the model's quality score for the prompt's classified task type
- Models are ranked by `tradeoffScore` to produce a "best value" recommendation, distinct from "cheapest" and distinct from "highest quality"

This keeps the math transparent and auditable — no black-box weighting — which matters for a tool whose entire value proposition is trustworthy, explainable analysis.

---

## 6. Recommendation Engine Changes

### 6.1 New/Updated Recommendation Types
Extends the existing recommendation schema (`type`, `severity`, `message`, `details`):

```json
{
  "type": "best_value_model",
  "severity": "info",
  "message": "Claude Haiku offers the best cost/quality tradeoff for this reasoning-heavy prompt.",
  "details": {
    "taskType": "reasoning",
    "recommendedModel": "claude-haiku",
    "cheapestModel": "gemini-flash",
    "cheapestModelQualityDelta": -12,
    "costDeltaVsCheapest": "+14%",
    "tradeoffScoreRank": 1
  }
}
```

- The existing `cheaper_model_swap` type is **retained** (some users just want cheapest, full stop) but is now paired with a `best_value_model` recommendation when quality data is available for the compared models.
- If quality data is missing for a selected model (not yet benchmarked), fall back gracefully to cost-only recommendations for that model and flag it as "quality data unavailable" rather than guessing.

### 6.2 UI Changes
- **Comparison Matrix**: add a "Quality" column (per relevant task-type score) alongside existing cost/context columns, sortable like the rest of the TanStack Table matrix.
- **Inspection Summary panel**: "Cheapest model" field gets a sibling — "Best value model" — shown alongside it, not replacing it, so users see both framings at a glance.
- **Recommendation card**: when a `best_value_model` recommendation differs from the cheapest model, visually distinguish it (e.g. a small "detected task type: Reasoning" tag) so the user understands *why* the recommendation isn't just "cheapest."

---

## 7. Data Model Summary

- `lib/models/` registry: add `qualityScores` per model (§5.1)
- Recommendation objects: add `best_value_model` type (§6.1); existing `cheaper_model_swap` unchanged
- No changes needed to the Inspection Vault (InsForge) schema — quality scores live in the model registry, not per-analysis, so saved/shared analyses just reference current registry data the same way they already do for pricing

---

## 8. Background Jobs (Inngest)

- Extend the existing model-registry refresh function to also pull/update `qualityScores` from the chosen benchmark source (§4.1), on a slower cadence than pricing refresh (e.g. weekly).
- No new Inngest function required — this is an extension of existing scheduled sync logic, not a new job.

---

## 9. Success Metrics

- % of comparisons where `best_value_model` differs from the pure-cheapest model (validates the feature is actually adding a distinct signal, not just restating cost)
- % of users who select the recommended "best value" model for their next run vs. the cheapest one
- Coverage: % of models in the registry that have quality scores populated (should trend toward 100%, with graceful fallback for gaps)

---

## 10. Open Questions

1. **Primary benchmark source** — confirm which aggregator to use as primary (§4.1). Affects licensing, update cadence, and how defensible the scores are if a provider disputes them.
2. **Score staleness disclosure** — should the UI show "last updated" per quality score, similar to pricing, so users know if a score might be outdated for a fast-moving model?
3. **Handling brand-new models** — what should the recommendation engine show for a model with no benchmark coverage yet (too new)? Recommend: exclude from "best value" ranking but still show in cost comparison, with a clear "not yet benchmarked" label.
4. **Task-type misclassification** — should users be able to manually override the detected task type (e.g. "this is actually a coding prompt, not general") if the auto-classification gets it wrong?

---

## 11. Implementation Notes for Coding Agent

- Build order: (1) add `qualityScores` to the model registry + one-time seed from chosen benchmark source → (2) extend the Inngest refresh job to keep scores current → (3) implement rule-based task-type classification (reuses existing prompt segmentation logic) → (4) implement the tradeoff score + `best_value_model` recommendation → (5) update Comparison Matrix and Inspection Summary UI last, once the underlying data/logic is verified correct.
- Reuse the existing recommendation object schema (`type`/`severity`/`message`/`details`) — don't create a parallel structure for this feature.
- Keep the tradeoff formula (§5.3) simple and auditable; avoid black-box weighting that can't be explained in the recommendation's `details` field.
