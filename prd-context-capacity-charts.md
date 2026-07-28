# PRD — TokenGecko: Context Capacity Tab Chart Upgrades

**Status:** Draft v1
**Type:** Feature addition to existing Context Capacity tab
**Last updated:** 2026-07-27

---

## 1. Overview

The current Context Capacity tab shows a single bar chart of per-model context usage (toggleable between % scale and raw token count), with labels that collide at 12+ models and no way to see the cost/quality tradeoff visually — that insight currently only exists as text in the Optimization & Health tab.

This PRD adds three chart improvements:
1. A new **Cost vs. Context bubble/scatter plot** (quality-weighted), visualizing the "best value" tradeoff the recommendation engine already computes.
2. A **stacked bar for context headroom** (used + remaining tokens in one bar), replacing the current toggle-between-two-views pattern.
3. **Reuse** of the existing Token Distribution stacked bar (from Optimization & Health) on this tab, rather than introducing a new donut chart, to keep visual language consistent.

Chart **components** should be sourced/built via the **21st.dev MCP** (already configured in the coding agent), styled to match TokenGecko's existing dark theme; the underlying chart **engine** remains Recharts, consistent with the rest of the app (base PRD §8).

---

## 2. Goals & Non-Goals

### Goals
- Visualize the cost/quality/context tradeoff that currently only exists as a text recommendation card
- Replace the "used % vs. raw count" toggle with a single stacked view showing both simultaneously
- Fix the current label-collision problem on the context usage bar chart
- Keep all new chart components visually and structurally consistent with existing charts (same card style, same dark theme tokens, same data source per the Registry Sync PRD's `AnalysisState.result`)

### Non-Goals
- Replacing Recharts as the charting engine — 21st.dev is used for component/styling sourcing, not as a replacement chart library
- Adding new data sources — all three charts consume data already present in `AnalysisState.result` (base PRD §9, optimization PRD §5, registry-sync PRD §4.1); no new backend work required

---

## 3. Chart 1 — Cost vs. Context Bubble/Scatter Plot

### 3.1 Purpose
Visualize the tradeoff frontier across selected models so the user can *see* why a given model is recommended, instead of only reading a text card.

### 3.2 Spec
- **Chart type**: Recharts `ScatterChart` (bubble variant via `ZAxis`)
- **X-axis**: estimated cost per run (from `AnalysisState.result.perModel[].estimatedCost.total`)
- **Y-axis**: context window size (from registry data, already present per-model)
- **Bubble size (`ZAxis`)**: quality score for the prompt's classified task type (routing PRD §5.1/5.2) — larger bubble = higher quality for this task type
- **Bubble color**: distinguish the `best_value_model` recommendation (routing PRD §6.1) with the existing accent/highlight treatment used elsewhere (e.g. the orange "Best Value" border pattern already used on the Optimization & Health cards); other points in a neutral/muted color; optionally color by provider if it doesn't conflict with the highlight color
- **Overlay**: a Pareto-frontier line connecting models that are not strictly dominated on both axes (lowest cost for a given quality/context level) — implemented as a `Line` layered over the `ScatterChart`, computed client-side from the same `perModel` data (simple frontier algorithm, no new dependency)
- **Tooltip on hover**: model name, exact cost, context window, quality score, and whether it's the recommended best-value model
- **Missing quality data**: models without a quality score (per routing PRD §9 open question 3) should still render on the scatter plot (using cost/context only) but with a fixed/default bubble size and a "not yet benchmarked" tooltip note, rather than being excluded — consistent with the graceful-degradation approach in the routing PRD

---

## 4. Chart 2 — Context Headroom (Stacked Bar)

### 4.1 Purpose
Replace the current "% used" vs. "tokens count" toggle with a single view that shows both used and remaining context per model, since remaining headroom is often the more actionable number (e.g. "can I add more few-shot examples").

### 4.2 Spec
- **Chart type**: Recharts `BarChart` with two stacked `Bar` entries per model (`stackId="context"`)
  - Segment 1: `usedTokens` (existing accent color, e.g. orange, consistent with current chart)
  - Segment 2: `remainingTokens` = `contextWindow - usedTokens` (dim/muted color, clearly distinct from "used")
- **Toggle retained, repurposed**: keep the existing toggle control, but change its meaning from "% scale vs. token count" to **"% display vs. absolute token display"** of the *same* stacked bar — i.e. the toggle now controls axis units, not which data is shown. Both used and remaining are always visible; only the unit (percent vs. raw count) changes.
- **Reference line**: thin marker at the Prompt Health "Warning" threshold (80%, per optimization PRD §4.2) so a model close to its context limit is visually flagged without reading numbers.
- **Label collision fix**: rotate x-axis labels (e.g. -35°) when more than ~8 models are shown, and/or truncate long labels with full name on tooltip hover; group by provider where feasible to allow shortened in-group labels (e.g. drop repeated "Anthropic:" prefix within a visually grouped cluster).

---

## 5. Chart 3 — Token Distribution Breakdown (Reused)

### 5.1 Purpose
Tie "why is my prompt this size" directly to "how much room does that leave" by placing the existing breakdown next to the context charts, rather than only on the Optimization & Health tab.

### 5.2 Spec
- **Reuse, don't rebuild**: this is the same stacked horizontal bar already implemented on Optimization & Health (Code Snippets / Instructions & Text / etc., per optimization PRD §5.2 segmentation logic) — extract it into a shared component and render it on both tabs from the same `AnalysisState.result` data.
- No new chart type or new computation — this is a component-reuse task, not new chart logic.
- Explicitly **not** introducing a donut chart for this, to avoid two different visual representations of the same underlying data across tabs (per prior design discussion).

---

## 6. Component Sourcing — 21st.dev MCP

The project has the **21st.dev MCP** configured in the coding agent. Use it for the **presentational/component layer** of these charts — card containers, toggle controls, legends, tooltips styling — not as a replacement for Recharts, which remains the underlying chart engine per the existing tech stack.

### 6.1 Instructions for Coding Agent
1. Confirm the 21st.dev MCP is available in the tool list before starting chart component work.
2. Use it to source/generate chart **card shells** (container, header, legend, toggle control patterns) consistent with TokenGecko's existing dark theme tokens (`globals.css` Storeframe theme variables, per base app structure) — do not let sourced components introduce a divergent visual style; restyle with existing CSS variables rather than accepting default 21st.dev theming as-is.
3. Wire sourced component shells to **Recharts** primitives (`ScatterChart`, `BarChart`, `ZAxis`, etc.) for the actual chart rendering — 21st.dev components should wrap/host the chart, not replace the charting logic described in §3–§5.
4. If 21st.dev offers a pre-built scatter/bubble or stacked-bar chart component that already wraps Recharts (or a comparable library) suitably, evaluate it against building custom — prefer it only if it doesn't require introducing a second charting dependency alongside Recharts, since maintaining two chart libraries adds unnecessary complexity for a small dark-theme dashboard.
5. Keep all data-fetching and computation (frontier calculation, headroom math, segmentation) outside of any 21st.dev-sourced component — those components should be presentational, receiving already-computed data as props, consistent with the read-only-consumer pattern established for tabs in the Registry Sync PRD (§4.1).

---

## 7. Data Requirements

All three charts read exclusively from the existing `AnalysisState.result` object (registry-sync PRD §4.1) — no new backend endpoints or InsForge schema changes required:

| Chart | Data source |
|---|---|
| Cost vs. Context scatter | `result.perModel[].estimatedCost`, registry `contextWindow`, registry `qualityScores[taskType]` (routing PRD §5.1) |
| Context headroom stacked bar | `result.perModel[].inputTokens` (used), registry `contextWindow` (for remaining calc) |
| Token distribution (reused) | `result.contextCapacity` / existing segmentation output (optimization PRD §5.2) |

---

## 8. UI Layout (Context Capacity Tab)

Suggested order, top to bottom:
1. **Cost vs. Context scatter plot** (new) — the headline chart, since it's the most information-dense and ties directly to the recommendation engine
2. **Context headroom stacked bar** (upgraded) — the existing chart's replacement
3. **Token distribution breakdown** (reused component) — smaller, supporting chart alongside or below the headroom bar
4. Existing "Data Source: Live OpenRouter Registry / Snapshot" footer retained unchanged at the bottom

---

## 9. Success Metrics

- Reduced label-collision/readability complaints on the context usage chart (qualitative, or tracked if feedback mechanism exists)
- Whether users interacting with the scatter plot's Pareto-frontier models correlates with selecting the `best_value_model` recommendation more often (validates the visual actually communicates the tradeoff, tying back to the routing PRD's success metrics)

---

## 10. Open Questions

1. **Pareto frontier line** — confirm this is worth the added complexity for v1, or whether bubble size/color alone (without the connecting line) communicates the tradeoff clearly enough on first pass.
2. **21st.dev component scope** — confirm whether 21st.dev should be used narrowly (card shells/toggles only, per §6.1) or more broadly if it turns out to offer full chart components worth adopting wholesale — recommend starting narrow and expanding only if a specific sourced component proves clearly better than a custom Recharts implementation.
3. **Provider color-coding** — should the scatter plot color bubbles by provider (OpenAI/Anthropic/Google/etc.) in addition to highlighting the best-value model, or would that add visual noise given the highlight color already needs to stand out?

---

## 11. Implementation Notes for Coding Agent

- Build order: (1) implement the context headroom stacked bar (§4) first — it's the most contained change, reusing the existing chart's data path with modified stacking → (2) extract and reuse the Token Distribution component (§5) on this tab → (3) implement the Cost vs. Context scatter plot (§3), including the Pareto-frontier overlay last, since it's the most novel piece → (4) apply 21st.dev-sourced component shells (§6) to all three once the underlying chart logic is verified correct with plain Recharts styling first, so component sourcing doesn't block on data correctness.
- All charts must read from `AnalysisState.result` exclusively (registry-sync PRD §4.1) — no chart on this tab should perform its own independent computation, to avoid reintroducing the desync bug that PRD fixed.
- Verify the frontier/headroom calculations work correctly with the 12+ model case shown in the current build's screenshots, since that's the density where the existing chart broke down.
