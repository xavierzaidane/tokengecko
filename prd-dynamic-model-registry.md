# PRD — TokenGecko: Dynamic Model Registry (Replacing Hardcoded `DEFAULT_MODELS`)

**Status:** Draft v1
**Type:** Infrastructure change to existing TokenGecko app
**Last updated:** 2026-07-27

---

## 1. Overview

`registry.ts` currently defines `DEFAULT_MODELS` as a hardcoded array of model ID, provider, context window, pricing, and quality scores. This goes stale the moment any provider changes pricing or ships a new model, and requires a manual code change + redeploy to update.

This PRD replaces the hardcoded registry with a **live-fetched registry**, sourced primarily from **OpenRouter's public Models API**, refreshed on a schedule via the existing Inngest job, cached in InsForge, with `DEFAULT_MODELS` demoted to a **fallback/seed** rather than the source of truth.

---

## 2. Goals & Non-Goals

### Goals
- Pricing and context-window data reflect real, current provider values without a code change
- New models appear in the catalog automatically as they're added upstream
- Zero added latency for end users — registry reads come from cache (InsForge), never a live API call on page load
- Graceful degradation if the fetch source is unavailable

### Non-Goals (this phase)
- Live-fetching **quality/benchmark scores** — no single free API covers this the way OpenRouter covers pricing (per prior PRD's open question). This PRD covers pricing + context window + model list only; `qualityScores` sync stays a separate, likely semi-manual effort.
- Real-time/per-request pricing lookups — a scheduled refresh (not on-demand fetching) is sufficient given pricing doesn't change minute-to-minute.

---

## 3. Data Sources

### 3.1 Primary: OpenRouter Models API
- `GET https://openrouter.ai/api/v1/models`
- Free, no authentication required
- Returns, per model: `id`, `context_length`, `pricing.prompt` (input cost/token), `pricing.completion` (output cost/token), plus metadata (name, description)
- Covers ~400+ models across OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral, Qwen, and others in a single call — matches TokenGecko's existing multi-provider scope

### 3.2 Secondary/Fallback: LiteLLM `model_prices_and_context_window.json`
- Community-maintained, MIT-licensed JSON on GitHub (`BerriAI/litellm`), fetchable via `raw.githubusercontent.com`
- Used only as a **cross-check or fallback** when OpenRouter's data is missing a model TokenGecko needs — OpenRouter is the source of truth when both are available, since it's an official first-party API rather than a community-scraped file, and LiteLLM's file has known cases of lagging behind OpenRouter for very recent releases.

### 3.3 Local Fallback: `DEFAULT_MODELS`
- Retained in `registry.ts`, but demoted from "the registry" to a **hardcoded seed/fallback**.
- Used only when: (a) the app is booting with an empty cache for the first time, or (b) both live sources fail at refresh time and no cached data exists yet.
- Should be updated occasionally, but is no longer the thing users see in normal operation.

### 3.4 Quality Scores
- Out of scope for this PRD (see §2 Non-Goals). `qualityScores` fields, if present in the cost/quality routing feature, continue to be sourced/maintained separately and merged into the live registry at read time — not fetched from OpenRouter/LiteLLM, which don't provide benchmark data.

---

## 4. Architecture

### 4.1 Data Flow
```
[Inngest scheduled job]
   → fetch OpenRouter /api/v1/models
   → normalize to TokenGecko's model schema
   → (optional) cross-check gaps against LiteLLM JSON
   → merge in qualityScores from existing separate source (unchanged)
   → upsert into InsForge `model_registry` table
   → update `lastSyncedAt` timestamp

[App runtime]
   → registry reads always come from InsForge `model_registry` table
   → if table is empty (first boot / total fetch failure), fall back to DEFAULT_MODELS
   → no live API calls to OpenRouter happen on the request path
```

### 4.2 Normalization Mapping
OpenRouter's schema → TokenGecko's `DEFAULT_MODELS` shape:

| TokenGecko field | OpenRouter source field | Notes |
|---|---|---|
| `modelId` | `id` | May need provider-prefix normalization (e.g. `openai/gpt-4o` → match existing ID convention) |
| `provider` | derived from `id` prefix | e.g. split on `/` |
| `contextWindow` | `context_length` | Direct mapping |
| `pricing.input` | `pricing.prompt` | OpenRouter returns cost **per token** as a string — convert to cost per 1M tokens to match existing pricing convention, and parse from string to number carefully (avoid float precision issues) |
| `pricing.output` | `pricing.completion` | Same conversion as above |
| `qualityScores` | *(not from OpenRouter)* | Preserved from existing separate source; merged in, not overwritten |

### 4.3 Refresh Cadence
- Daily scheduled refresh via the existing Inngest job (pricing/context data changes infrequently enough that daily is sufficient; avoids unnecessary load on OpenRouter's API)
- Manual re-trigger available via Inngest Dev Server MCP for local development/testing (consistent with existing pattern from base PRD §16)

---

## 5. Data Model Changes

- New/updated InsForge table: `model_registry`
  - `modelId`, `provider`, `contextWindow`, `pricingInput`, `pricingOutput`, `qualityScores` (unchanged from existing), `source` (`"openrouter"` | `"litellm"` | `"default_fallback"`), `lastSyncedAt`
- The `source` field lets the UI (optionally) show data provenance, and lets debugging distinguish "this model's pricing came from the live fetch" vs "this is still the hardcoded fallback because sync hasn't run yet or failed."

---

## 6. Error Handling & Fallback Behavior

- If the OpenRouter fetch fails entirely (network error, API down): keep serving the last successfully cached `model_registry` data — do **not** wipe existing good data on a failed refresh.
- If a specific model present in `DEFAULT_MODELS` is missing from OpenRouter's response: retain its last-known cached values (or `DEFAULT_MODELS` value if never synced) rather than dropping it from the catalog.
- If InsForge itself is unreachable at app runtime (rare): fall back to `DEFAULT_MODELS` directly so the app doesn't hard-fail — degraded but functional.
- Log/flag sync failures (e.g. via Inngest's run history) so failures are visible during development rather than silent.

---

## 7. UI Impact

- No required UI changes — the model catalog, comparison matrix, and optimization engine continue reading from the same registry shape they already use.
- Optional (nice-to-have, not required for this phase): show a small "Pricing synced [X time ago]" indicator in the model catalog, using `lastSyncedAt`, so users trust the numbers are current rather than assuming a static hardcoded list.

---

## 8. Success Metrics

- % of `model_registry` entries sourced live (`openrouter`/`litellm`) vs. `default_fallback` — should trend toward ~100% live after first successful sync
- Time since last successful sync (`lastSyncedAt` freshness) — should rarely exceed the refresh interval + one retry window
- Zero user-facing errors attributable to registry fetch failures (fallback behavior should fully absorb these)

---

## 9. Open Questions

1. **Model ID mapping** — does TokenGecko's existing model ID convention match OpenRouter's `provider/model-name` format, or does a mapping table need to be maintained for existing saved analyses (in the Inspection Vault) to keep resolving to the right registry entry after this change?
2. **Pricing unit conversion** — confirm OpenRouter's per-token string pricing is being parsed and converted to TokenGecko's existing per-1M-token convention without floating-point precision loss (use a decimal-safe conversion, not naive `parseFloat` multiplication).
3. **LiteLLM fallback usage** — is the secondary LiteLLM cross-check worth the added complexity for v1, or should it be deferred until a concrete gap in OpenRouter's coverage is actually observed?
4. **Quality score merge strategy** — since quality scores aren't part of this fetch, confirm the merge step (§4.1) correctly preserves existing `qualityScores` when upserting new pricing/context data, rather than accidentally overwriting them with nulls.

---

## 10. Implementation Notes for Coding Agent

- Build order: (1) write the OpenRouter fetch + normalization function as a standalone, testable module → (2) wire it into the existing Inngest refresh job, replacing/extending whatever it currently does → (3) add the `model_registry` InsForge table and upsert logic with the merge behavior from §6 → (4) update `registry.ts` so runtime reads pull from InsForge first, `DEFAULT_MODELS` only as the last-resort fallback described in §3.3 and §6.
- Do not remove `DEFAULT_MODELS` from the codebase — keep it as the documented fallback array, just stop treating it as the primary data source.
- Reuse the existing Inngest Dev Server MCP workflow (base PRD §16) to manually trigger and verify this refresh function during development before relying on the schedule.
