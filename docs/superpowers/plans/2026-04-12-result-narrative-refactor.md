# Result Narrative Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the result page so that archetype copy and answer-derived evidence are produced by different data paths, eliminating contradictions between fixed persona bullets and the user's actual answers.

**Architecture:** Keep `src/data/personalities.ts` as the archetype source of truth, but stop treating it as per-user evidence. Add a dedicated result narrative layer that consumes answers, active question path, ratios, and hidden-trigger context to generate personalized summaries, dynamic evidence bullets, and answer-backed evidence cards. Update the result page to render "this run" evidence and "archetype baseline" separately.

**Tech Stack:** SolidJS, TypeScript, Vite, existing question-path and scoring logic

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `docs/superpowers/plans/2026-04-12-result-narrative-refactor.md` | Create | Execution plan for the refactor |
| `src/logic/resultNarrative.ts` | Create | Build answer-derived summaries, evidence bullets, and evidence cards |
| `src/logic/scoring.ts` | Modify | Attach result narrative data to the main `Result` contract |
| `src/logic/legacy/scoring-v1.ts` | Modify | Provide legacy-safe fallback narrative data so old links still render |
| `src/components/ResultPage.tsx` | Modify | Render dynamic evidence and archetype sections with corrected semantics |
| `src/global.css` | Modify | Style the new evidence summary and answer-card sections |

## Verification Strategy

| Level | Mechanism | Command / Method |
|---|---|---|
| Type/build safety | Production build | `pnpm build` |
| Contradiction regression | Manual spot-check in REPL | Use representative answers where persona pole and specific option diverge |
| Legacy safety | Smoke render via legacy scorer shape | Confirm new UI fields exist for legacy result objects |

## Chunk 1: Narrative Data Model

### Task 1: Add a dedicated answer-derived result narrative module

**Files:**
- Create: `src/logic/resultNarrative.ts`
- Modify: `src/logic/scoring.ts`

- [ ] **Step 1: Define the narrative types**

Add a focused result-facing contract:

```ts
export interface ResultEvidenceCard {
  questionId: number
  dimension: 'GD' | 'ZR' | 'NL' | 'YF' | 'META'
  question: string
  answer: string
  note: string
}

export interface ResultNarrative {
  classificationNote: string
  summary: string
  evidenceTraits: string[]
  evidenceCards: ResultEvidenceCard[]
  archetypeTraits: string[]
}
```

- [ ] **Step 2: Build the narrative generator around current-path answers**

Generate:
- one classification note from hidden / ALL / 16-grid routing
- one dynamic summary from current ratios
- four dimension bullets from ratio intensity
- three to four answer cards from curated, semantically rich answered questions

- [ ] **Step 3: Attach the generated narrative to `Result`**

`getResult(...)` should return:

```ts
return {
  ...existingResultFields,
  narrative: buildResultNarrative(/* scoring context */),
}
```

## Chunk 2: Legacy Compatibility

### Task 2: Give legacy results the same UI contract

**Files:**
- Modify: `src/logic/legacy/scoring-v1.ts`
- Reference: `src/logic/resultNarrative.ts`

- [ ] **Step 1: Add a legacy narrative builder entry point**

The builder should accept explicit question lists so v1 data can reuse the same rendering contract without adopting v0.4 path semantics.

- [ ] **Step 2: Populate `narrative` on legacy results**

Legacy results may use simpler classification notes, but must always provide:
- `summary`
- `evidenceTraits`
- `evidenceCards`
- `archetypeTraits`

## Chunk 3: Result UI Refactor

### Task 3: Separate user evidence from archetype baseline in the result page

**Files:**
- Modify: `src/components/ResultPage.tsx`
- Modify: `src/global.css`

- [ ] **Step 1: Insert a dedicated "本次作答画像" section**

Render:
- `classificationNote`
- `summary`
- `evidenceTraits`

- [ ] **Step 2: Add a "关键作答证据" card grid**

Each card should show:
- question label
- selected answer
- synthesized interpretation note

- [ ] **Step 3: Demote static persona bullets to an explicit archetype section**

Rename the old `traits` presentation from "恋爱中的你" to "该人格常见表现" and source it from `narrative.archetypeTraits`.

## Chunk 4: Verification

### Task 4: Verify build and contradiction scenarios

**Files:**
- No code changes required unless fixes are found

- [ ] **Step 1: Run production build**

Run: `pnpm build`

- [ ] **Step 2: Spot-check a contradiction case**

Validate a dating-path result where the final persona is high-expression / high-investment but `Q41` is option `B`, and confirm the result page now presents that nuance in dynamic evidence rather than overwriting it with static archetype copy.
