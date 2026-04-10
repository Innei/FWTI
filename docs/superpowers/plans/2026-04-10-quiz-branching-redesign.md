# Quiz Branching Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat v0.3 quiz with a status-aware branching quiz system that supports trunk questions, status-specific extensions, follow-up subquestions, ratio-based scoring, and versioned share links without breaking legacy result links.

**Architecture:** The redesign should separate concerns cleanly: question content and invariants live in `src/data/questions.ts`, path construction lives in `src/logic/flow.ts`, scoring and hidden-trigger semantics move behind predicate helpers, and share-link parsing becomes explicitly versioned. Legacy v0.3 behavior must be frozen into isolated snapshot modules so that old links continue to render old results while the new runtime evolves independently.

**Tech Stack:** SolidJS, Vike, TypeScript, Vite, existing static asset pipeline

---

## Scope And Delivery Strategy

| Batch | Objective | Required Output |
|---|---|---|
| Batch 1 | Make the new runtime structurally viable | v2 question model, flow engine, ratio scoring, codec v2, legacy fallback, updated quiz/result UI |
| Batch 2 | Finish content depth and new hidden personas | status extensions, follow-ups, semantic trigger matrix, GHOST/LIMBO content, portrait assets, final DRAFT/PROMPT sync |

| Constraint | Implementation Rule |
|---|---|
| Legacy compatibility | v1 links must decode into isolated v0.3 scoring only |
| Testing | Prefer behavior and invariant checks; do not add snapshot tests for static tables |
| Data stability | Question IDs are append-only; do not renumber or reuse IDs |
| Flow complexity | Follow-up nesting depth is capped at 2 |
| UI state | META answer changes wipe current answers; other path changes do not |
| Naming safety | Resolve the new hidden persona `GHOST` against existing `DRNY.engName === 'GHOST'` before finalizing UI copy |

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `DRAFT.md` | Modify | Canonical v0.4 quiz content tables, trigger matrix, new hidden persona copy |
| `PROMPT.md` | Modify | Add portrait prompt entries and palette guidance for `GHOST` and `LIMBO` |
| `src/data/questions.ts` | Rewrite | Structured quiz data: `metaQuestion`, `trunk`, `extensions`, `followups`, `questionIndex`, `questionIds`, invariants |
| `src/data/legacy/questions-v1.ts` | Create | Frozen v0.3 question snapshot |
| `src/data/personalities.ts` | Modify | Add `GHOST` and `LIMBO`; preserve existing 16 + 8 copy |
| `src/logic/answers.ts` | Modify | Meta-question handling against the new question exports |
| `src/logic/flow.ts` | Create | Dynamic path builder and next-question calculation |
| `src/logic/codec.ts` | Rewrite | `encodeAnswersV2`, versioned `decodeAnswers`, legacy routing |
| `src/logic/predicates.ts` | Create | `AnswerLens`, polarity helpers, trigger registries |
| `src/logic/semanticIds.ts` | Create | Stable semantic anchors for trigger code |
| `src/logic/scoring.ts` | Rewrite | Ratio-based scoring, path-aware filtering, hidden/persona resolution |
| `src/logic/legacy/scoring-v1.ts` | Create | Frozen v0.3 scoring snapshot |
| `src/App.tsx` | Modify | Quiz progress, dynamic path rendering, legacy-result badge/button, updated copy |
| `pages/quiz/+Page.tsx` | Modify | Use flow engine for progress, navigation, submission eligibility |
| `pages/result/+Page.tsx` | Modify | Version-aware decode and result rendering |
| `src/assets/portraits/GHOST.webp` | Create | New hidden portrait asset |
| `src/assets/portraits/LIMBO.webp` | Create | New hidden portrait asset |

## Verification Strategy

| Level | Mechanism | Command / Method |
|---|---|---|
| Type/build safety | Production build | `pnpm build` |
| Data safety | Dev-only invariants in `src/data/questions.ts` | `pnpm dev`, then load `/quiz` |
| Flow correctness | Manual path walk in browser | Run four status paths, plus path re-entry and META reset |
| Share-link correctness | Manual round-trip | Submit quiz, open `/result/<hash>` in a fresh window |
| Legacy compatibility | Fixed v1 sample links | Open saved v1 hashes and confirm v0.3 badge + retest CTA |

## Chunk 1: Canonical Data And Legacy Freeze

### Task 1: Rewrite the source-of-truth content documents

**Files:**
- Modify: `DRAFT.md`
- Modify: `PROMPT.md`
- Reference: `docs/superpowers/specs/2026-04-10-quiz-branching-redesign-design.md`

- [ ] **Step 1: Replace the v0.3 content outline in `DRAFT.md` with v0.4 tables**

Add sections in this order:

```md
## 〇、前置题
## 一、主干题（20 + Q31）
## 二、状态扩展题（dating / ambiguous / crush / solo）
## 三、Follow-up 表
## 四、隐藏人格与叠加标签触发矩阵
```

- [ ] **Step 2: Add the new portrait prompt stubs to `PROMPT.md`**

Add two subject blocks that match existing prompt style:

```md
#### GHOST — 电子断联户 · GHOST
#### LIMBO — 意难平学家 · LIMBO
```

- [ ] **Step 3: Verify the documents are internally consistent**

Manual checklist:
- Every semantic anchor named in the spec appears in `DRAFT.md`
- Every new hidden persona named in `DRAFT.md` has a matching `PROMPT.md` block
- Trigger descriptions do not refer to obsolete v0.3-only question IDs unless explicitly marked legacy

- [ ] **Step 4: Commit**

```bash
git add DRAFT.md PROMPT.md
git commit -m "docs: define v0.4 quiz branching content"
```

### Task 2: Freeze v0.3 logic into isolated legacy modules

**Files:**
- Create: `src/data/legacy/questions-v1.ts`
- Create: `src/logic/legacy/scoring-v1.ts`
- Modify: `src/logic/scoring.ts`
- Modify: `pages/result/+Page.tsx`

- [ ] **Step 1: Copy the current flat question list into `src/data/legacy/questions-v1.ts`**

Export the exact current dataset without semantic edits:

```ts
export const legacyQuestionsV1 = [/* current v0.3 questions snapshot */] as const
export const legacyQuestionIds = legacyQuestionsV1.map((q) => q.id).sort((a, b) => a - b)
```

- [ ] **Step 2: Copy current scoring logic into `src/logic/legacy/scoring-v1.ts`**

Keep the current public contract intact:

```ts
export function getLegacyResultV1(
  answers: Record<number, number>,
  retreatCount = 0,
): Result {
  // frozen v0.3 scoring
}
```

- [ ] **Step 3: Wire result-page call sites to use the legacy module instead of the main scorer for v1 links**

Expected branching shape:

```ts
if (decoded.version === 1) {
  return getLegacyResultV1(decoded.answers, retreatCount())
}
return getResult(decoded.answers, decoded.status, retreatCount())
```

- [ ] **Step 4: Run a build to ensure the legacy extraction did not break imports**

Run: `pnpm build`  
Expected: build succeeds with both legacy modules compiled

- [ ] **Step 5: Commit**

```bash
git add src/data/legacy/questions-v1.ts src/logic/legacy/scoring-v1.ts src/logic/scoring.ts pages/result/+Page.tsx
git commit -m "refactor: freeze legacy v0.3 quiz logic"
```

## Chunk 2: Structured Question Model

### Task 3: Replace the flat question list with structured exports and invariants

**Files:**
- Rewrite: `src/data/questions.ts`
- Modify: `src/logic/answers.ts`

- [ ] **Step 1: Introduce the new question model types and exports**

Implement the module skeleton first:

```ts
export type Scale = 3 | 5
export type StatusKey = 'dating' | 'ambiguous' | 'crush' | 'solo'

export interface Option {
  label: string
  text: string
  score: number
  hidden?: number
  meta?: StatusKey
}

export interface Question {
  id: number
  dimension: 'GD' | 'ZR' | 'NL' | 'YF' | 'META'
  scale: Scale
  tag?: '前置' | '彩蛋' | '补充题'
  text: string
  options: Option[]
  variants?: Partial<Record<StatusKey, { text?: string; options?: (string | null)[] }>>
}

export const metaQuestion: Question = /* id 32 */
export const trunk: Question[] = [/* 20 trunk questions + Q31 */]
export const extensions: Record<StatusKey, Question[]> = { /* ... */ }
export const followups: Record<number, Record<number, Question[]>> = { /* ... */ }
```

- [ ] **Step 2: Add the derived lookup structures**

Export the derived collections required by codec and scoring:

```ts
export const questions = [metaQuestion, ...trunk, ...allExtensions, ...allFollowups]
export const questionIndex: Record<number, Question> = Object.fromEntries(...)
export const questionIds: readonly number[] = Object.keys(questionIndex).map(Number).sort((a, b) => a - b)
```

- [ ] **Step 3: Add dev-only invariant enforcement**

Implement:

```ts
function assertInvariants() {
  // unique ids
  // options.length === scale
  // scores in {-2,-1,0,1,2}
  // META id === 32
  // follow-up depth <= 2
  // semantic ids exist
  // four-status coverage >= 5 questions per dimension
}

if (import.meta.env.DEV) assertInvariants()
```

- [ ] **Step 4: Update `src/logic/answers.ts` to use the new `metaQuestion` export instead of searching `questions`**

Expected simplification:

```ts
import { metaQuestion } from '../data/questions'
export const metaQuestionId = metaQuestion.id
```

- [ ] **Step 5: Run the app in dev and confirm the invariant layer fails loudly if the data is incomplete**

Run: `pnpm dev`  
Expected: incomplete draft data causes a visible dev throw until every status bucket and semantic anchor is filled

- [ ] **Step 6: Fill the missing questions until the invariant layer passes, then rebuild**

Run: `pnpm build`  
Expected: build succeeds after the v0.4 dataset is complete

- [ ] **Step 7: Commit**

```bash
git add src/data/questions.ts src/logic/answers.ts
git commit -m "feat: add structured v0.4 quiz dataset"
```

## Chunk 3: Flow Engine And Quiz Runtime

### Task 4: Implement dynamic path construction

**Files:**
- Create: `src/logic/flow.ts`
- Modify: `pages/quiz/+Page.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/logic/flow.ts` with path-building primitives**

```ts
export interface FlowStep {
  question: Question
  index: number
  total: number
}

export function buildQuestionPath(
  answers: Record<number, number>,
  status: RelationshipStatus,
): Question[] {
  // meta first
  // trunk + extensions[status]
  // inject followups immediately after parent
  // recurse to max depth 2
}

export function nextQuestion(
  answers: Record<number, number>,
): FlowStep | null {
  // return first unanswered question in current path
}
```

- [ ] **Step 2: Update quiz-page state derivation in `pages/quiz/+Page.tsx`**

Replace flat-array assumptions:

```ts
const path = () => buildQuestionPath(answers(), getRelationshipStatus(answers()) ?? 'solo')
const mainProgress = () => path().filter((q) => q.dimension !== 'META' && answers()[q.id] !== undefined).length
const canSubmit = () => metaAnswered() && path().every((q) => answers()[q.id] !== undefined)
```

- [ ] **Step 3: Update `scrollToNextUnanswered()` to scan the current path, not the full question registry**

Acceptance criteria:
- Follow-up insertion scrolls to the newly revealed child question
- Removed follow-ups are skipped automatically after parent-answer changes

- [ ] **Step 4: Update `src/App.tsx` quiz rendering to iterate over `path()`**

Required UI changes:
- Progress copy uses current path totals
- Question numbering is path-relative
- Home/quiz copy no longer claims a fixed “33 questions”

- [ ] **Step 5: Perform manual flow verification in the browser**

Run: `pnpm dev`  
Verify:
- META unanswered: only the META question is shown
- Each status shows a different extension segment
- Triggered follow-ups appear directly after the parent question
- Editing a parent answer removes unreachable follow-ups without clearing unrelated answers
- Changing META resets all prior answers except META itself

- [ ] **Step 6: Commit**

```bash
git add src/logic/flow.ts pages/quiz/+Page.tsx src/App.tsx
git commit -m "feat: add dynamic quiz flow engine"
```

## Chunk 4: Codec And Result Versioning

### Task 5: Add codec v2 and legacy-aware result loading

**Files:**
- Rewrite: `src/logic/codec.ts`
- Modify: `pages/result/+Page.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the single-format codec with explicit versioned APIs**

```ts
export function encodeAnswersV2(
  answers: Record<number, number>,
  status: RelationshipStatus,
  ids: readonly number[],
): string

export function decodeAnswers(
  encoded: string,
  ids: readonly number[],
):
  | { version: 2; answers: Record<number, number>; status: RelationshipStatus }
  | { version: 1; answers: Record<number, number>; status: null }
  | null
```

- [ ] **Step 2: Encode v2 links as `v2.<status>.<payload>` and preserve unprefixed decode for legacy**

Required rules:
- `status` maps to `d | a | c | s`
- payload iterates `questionIds` in ascending order
- unanswered or unreachable questions are encoded as `-`
- short legacy payloads are right-padded with `-`

- [ ] **Step 3: Update quiz submission to call `encodeAnswersV2()`**

Expected call site:

```ts
const status = getRelationshipStatus(answers())
if (!status) return
const encoded = encodeAnswersV2(answers(), status, questionIds)
```

- [ ] **Step 4: Update result rendering for legacy mode**

Required UX additions in `src/App.tsx` / `ResultPage`:
- “旧版测试结果（v0.3）”badge
- “点此重测新版”button
- no attempt to reinterpret v1 answers under v0.4 rules

- [ ] **Step 5: Verify share-link behavior manually**

Run: `pnpm dev`  
Verify:
- a fresh v2 result link round-trips correctly
- a saved v1 result link renders a legacy result and shows the badge
- malformed `v2.X.` links redirect home

- [ ] **Step 6: Commit**

```bash
git add src/logic/codec.ts pages/result/+Page.tsx src/App.tsx pages/quiz/+Page.tsx
git commit -m "feat: add versioned quiz share links"
```

## Chunk 5: Ratio Scoring And Semantic Trigger Layer

### Task 6: Replace absolute-score logic with ratio scoring

**Files:**
- Rewrite: `src/logic/scoring.ts`
- Create: `src/logic/semanticIds.ts`
- Create: `src/logic/predicates.ts`

- [ ] **Step 1: Define the semantic anchor constants**

Start with a narrow, documented mapping:

```ts
export const SEMANTIC = {
  JEALOUSY_EX_STALK: 0,
  CLING_INTRUSION: 0,
  MONEY_ATM: 0,
  EMO_2AM_RESPONDER: 0,
  REVOKE_RETRY: 31,
  IMAGINE_NOT_LOVED: 0,
} as const
```

Populate placeholder `0` values only temporarily; the module must not ship with unresolved anchors.

- [ ] **Step 2: Build `AnswerLens` helpers in `src/logic/predicates.ts`**

```ts
export interface AnswerLens {
  ratio: Record<'GD' | 'ZR' | 'NL' | 'YF', number>
  optOf(id: number): number | undefined
  polarityOf(id: number): -1 | 0 | 1 | undefined
  status: RelationshipStatus
  retreatCount: number
  hiddenCount: number
}
```

- [ ] **Step 3: Rewrite score accumulation to be path-aware and ratio-based**

Expected score shape:

```ts
export interface Scores {
  GD: number
  ZR: number
  NL: number
  YF: number
  rawGD: number; nGD: number
  rawZR: number; nZR: number
  rawNL: number; nNL: number
  rawYF: number; nYF: number
  hidden: number
}
```

Implementation rule:
- Only score questions reachable in the current `buildQuestionPath(...)`
- Normalize each option with `option.score / 2`
- Divide by per-dimension question count

- [ ] **Step 4: Move hidden-persona and hidden-tag rules onto semantic predicates**

Expected organization:

```ts
export const hiddenPersonalityTriggers = {
  MAD: (a) => a.ratio.ZR >= 0.8 && a.ratio.YF >= 0.6,
  RAT: (a) => a.ratio.GD <= -0.8 && a.ratio.YF >= 0.6,
  GHOST: (a) => a.status === 'solo' && a.ratio.GD <= -0.8 && a.ratio.NL <= -0.6,
  LIMBO: (a) => a.status === 'crush' && a.ratio.YF >= 0.8 && a.ratio.NL >= 0.3 && (a.polarityOf(SEMANTIC.JEALOUSY_EX_STALK) ?? 0) > 0,
}
```

- [ ] **Step 5: Update dimension-bar rendering inputs to use ratio percentages**

Required behavior:
- Bars show left/right intensity as `abs(ratio) * 100`
- zero scores still default to the existing“废方向”tie convention for classification

- [ ] **Step 6: Verify scoring and trigger behavior manually with targeted answer sets**

Manual cases:
- one path with obvious `MAD`
- one `solo` path that can unlock `GHOST`
- one `crush` path that can unlock `LIMBO`
- one path with at least two exact zero dimensions to confirm `ALL`
- one path that changes a parent answer and thereby removes a follow-up that would otherwise alter a trigger

- [ ] **Step 7: Run a build**

Run: `pnpm build`  
Expected: no TypeScript errors from the widened result shape or new helper modules

- [ ] **Step 8: Commit**

```bash
git add src/logic/scoring.ts src/logic/semanticIds.ts src/logic/predicates.ts src/data/questions.ts
git commit -m "feat: add ratio scoring and semantic hidden triggers"
```

## Chunk 6: Result Content, Portrait Wiring, And Final UI Polish

### Task 7: Add the new hidden personalities and portrait assets

**Files:**
- Modify: `src/data/personalities.ts`
- Create: `src/assets/portraits/GHOST.webp`
- Create: `src/assets/portraits/LIMBO.webp`

- [ ] **Step 1: Add `GHOST` and `LIMBO` personality entries to `src/data/personalities.ts`**

Required fields:

```ts
GHOST: { code: 'GHOST', name: '电子断联户', /* ... */ }
LIMBO: { code: 'LIMBO', name: '意难平学家', /* ... */ }
```

Naming checkpoint:
- `DRNY` already uses `engName: 'GHOST'`
- decide whether the new hidden persona keeps `code: 'GHOST'` with a distinct display English label, or whether the new hidden code itself is renamed before assets and result UI are wired
- do not silently ship two user-facing personalities both labeled `GHOST`

- [ ] **Step 2: Add the two portrait assets generated from the finalized `PROMPT.md` prompts**

Do not ship placeholders if the design spec expects final assets. If portrait generation is blocked, gate the triggers behind a constant:

```ts
export const ENABLE_NEW_HIDDEN = false
```

- [ ] **Step 3: Verify portrait rendering in the result UI**

Manual checklist:
- `Portrait` resolves both new codes
- result pages do not show broken-image placeholders
- share image modal still renders after adding new hidden codes

- [ ] **Step 4: Commit**

```bash
git add src/data/personalities.ts src/assets/portraits/GHOST.webp src/assets/portraits/LIMBO.webp
git commit -m "feat: add new hidden personas and portraits"
```

### Task 8: Finish result-page and home-page copy alignment

**Files:**
- Modify: `src/App.tsx`
- Modify: `pages/index/+Page.tsx` (if copy is split there in future; otherwise skip)

- [ ] **Step 1: Replace fixed-length quiz marketing copy with branching-friendly wording**

Required copy direction:
- home page: “约 30–37 题”
- quiz page: “当前路径”
- result page: v1 badge and v2 behavior clearly distinguished

- [ ] **Step 2: Verify no remaining UI text claims the old fixed 33-question structure**

Run:

```bash
rg -n "33|三十三|33 道" src pages DRAFT.md
```

Expected: only intentional legacy references remain

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx DRAFT.md
git commit -m "chore: align copy with branching quiz flow"
```

## Chunk 7: Final Verification And Release Readiness

### Task 9: Run the full verification matrix

**Files:**
- Verify only

- [ ] **Step 1: Run the production build**

Run: `pnpm build`  
Expected: successful Vite production build

- [ ] **Step 2: Run the four-status manual matrix**

Run: `pnpm dev`  
Verify per status:
- `dating`
- `ambiguous`
- `crush`
- `solo`

For each path, confirm:
- question wording matches status
- path length is plausible
- progress count changes when follow-ups appear
- result page loads and share link round-trips

- [ ] **Step 3: Run regression checks for legacy links**

Open at least three saved v1 result links.  
Expected:
- all render without crashing
- all show the legacy badge
- all expose a clear retest action

- [ ] **Step 4: Run targeted edge checks**

Checklist:
- malformed `v2` payload redirects home
- missing `extensions[status]` does not crash production
- a removed follow-up answer does not affect scoring
- META answer changes wipe downstream answers

- [ ] **Step 5: Commit the verification-complete state**

```bash
git add .
git commit -m "feat: ship branching quiz redesign"
```

## Open Questions To Resolve During Execution

| Question | Decision Rule |
|---|---|
| Whether to ship `GHOST` and `LIMBO` in Batch 1 or Batch 2 | If portraits are not ready, land logic behind `ENABLE_NEW_HIDDEN` and defer visual unlocks |
| Whether to introduce any automation beyond `pnpm build` | Only if it can be done without low-value snapshots or broad new dependencies |
| Whether `questions` should still include unreachable follow-ups for old consumers | Yes; codec and legacy compatibility depend on a global append-only ID registry |
| Whether scoring should accept `status` as an explicit argument | Yes; prefer explicit status threading over re-reading META inside nested helpers |
| How to name the new hidden persona currently called `GHOST` | Resolve before implementation because `DRNY` already exposes `engName: 'GHOST'`; avoid duplicate user-facing labels |

## Definition Of Done

- [ ] v2 quiz flow is path-based rather than flat-array based
- [ ] `src/data/questions.ts` exposes structured data plus invariants
- [ ] v1 links render through fully isolated legacy modules
- [ ] v2 links encode status and tolerate future appended IDs
- [ ] scoring uses per-dimension ratios and semantic trigger helpers
- [ ] GHOST and LIMBO are wired, or deliberately gated behind a named flag
- [ ] UI copy no longer claims a fixed 33-question experience
- [ ] `pnpm build` passes
- [ ] manual verification across four statuses and legacy links is complete

Plan complete and saved to `docs/superpowers/plans/2026-04-10-quiz-branching-redesign.md`.
