# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**FWTI（Fèiwù Type Indicator · 恋爱废物人格测试）** is a 中文 娱乐向 personality quiz. 33 questions across 4 dimensions (GD 主动 / ZR 情绪 / NL 亲密 / YF 安全) produce 2⁴ = 16 archetypes + 8 hidden personalities (`ALL` 我全都要 + `RAT` 鼠鼠恋人 + `PURE` 纯爱战士 + `MAD` 发疯文学家 + `E-DOG` 赛博舔狗 + `CHAOS` 已读乱回 + `CPU` CPU 恋人 + `BENCH` 备胎之王), plus 10 stackable hidden tags (撤回大师 / 夜谈冠军 / 朋友圈考古学家 / 薛定谔的前任 / 电子乙方 / 人形 ATM / 空想家 / 典中典 / 普信选手 / 退退退). The four dimensions are loosely anchored to real attachment & emotion-regulation literature (Brennan/Fraley ECR-R, Gross & John ERQ, Carver & White BIS/BAS, Gable approach–avoidance), but FWTI is explicitly **not** a validated instrument — tone is 自嘲 > 攻击, 搞笑 > 严肃.

The quiz auto-routes question wording by a META pre-question (`dating` / `ambiguous` / `crush` / `solo`) so single players do not fall out of context. Results are encoded into the URL hash, so a `/result/<hash>` link is fully self-contained and shareable.

## Source-of-truth documents

Two sibling docs at repo root are **design specs, not runtime assets**. The code implements what they prescribe; when spec and code diverge, the spec is the brief and the code is the current draft. Edit the spec first when changing test design.

- `DRAFT.md` — **the quiz design document** (currently v0.3, but implementation has since moved to 33 questions + ATM eggs + 7 hidden+ personalities; treat as the semantic brief, not a changelog). Contains the four-dimension definitions with their academic anchors, the 16 + 8 archetype roster (code, 中文 name, English meme, 中文 net-meme, one-liner), the hidden-tag trigger matrix, the full wording of every question with per-option dimension polarity (`【G】/【中】/【D】` etc.), the META pre-question routing rules, the scoring/tie-break rules (`≥2` ties → `ALL`, single tie → `*` display), the hidden-personality priority order (MAD / RAT / PURE / CPU / CHAOS / E-DOG / BENCH / ALL), the style guide (voice, naming conventions, the "先毒舌再温柔" closing pattern), and the academic-citation appendix used by the "🎓 认真版解读" footer on result cards. **Any change to questions, dimensions, archetypes, tag triggers, or scoring logic should be reflected here first and then mirrored into `src/data/` + `src/logic/`.**
- `PROMPT.md` — **the AI image prompt kit** for the 16 + 8 portrait illustrations in `src/assets/portraits/`. Contains the shared base prompt + negative prompt, recommended Midjourney / DALL·E 3 / SDXL parameters, the cross-batch consistency protocol (single `--sref` reference, `--sw 100–200`, two-pass rollout starting from the four family anchors `GZNY/GRNY/DZNY/DRNY`), per-family background color cues, and the subject-prompt for each of the 16 codes + `ALL` + 7 hidden+ codes (RAT / PURE / MAD / E-DOG / CHAOS / CPU / BENCH). Also documents the sticker variant and warns that `src/assets/16p/` is a legacy MBTI SVG directory unrelated to FWTI — **do not put new assets there**. When a new archetype is added or renamed, update the family color cue table and the subject prompt before regenerating the webp.

## Personality-test design workflow

End-to-end flow for changing quiz content (questions, archetypes, dimensions, tags). Follow in order — skipping steps breaks share links or de-syncs copy from the spec.

1. **Edit the brief in `DRAFT.md` first.** Update the dimension definition / archetype row / question wording / trigger condition. Preserve the voice and the academic anchor if the dimension moves. Treat `DRAFT.md` as the single place where design intent lives in natural language.
2. **Mirror into `src/data/questions.ts`.** Each question has `id`, `dimension` (`GD | ZR | NL | YF | META`), optional `tag` (`前置 | 彩蛋 | 补充题`), three options with `score` (`+2 / 0 / -2`), optional per-option `hidden` / `meta`, and optional per-status `variants` so the same question reads naturally across `dating / ambiguous / crush / solo`. **New questions must append a new `id` and append that id to `questionIds`** — never insert into the middle, never renumber, or every existing share link breaks.
3. **If archetypes change, edit `src/data/personalities.ts`.** All 16 codes + `ALL` (plus the 7 hidden+ codes once implemented) must exist; each gets card copy, quotes, best/worst pairings, 废物指数, 认真版解读 etc. per the DRAFT card template.
4. **If hidden tags change, edit `src/logic/scoring.ts::detectHiddenTitles`.** Triggers are "AND" compositions over specific question ids and option indices (`A = 0`, `C = 2`). Several triggers are **gated by META status** (e.g. 薛定谔的前任 only unlocks for `crush`, 空想家 only for `solo`) — keep these gates when porting from DRAFT, otherwise the tag name stops matching the trigger.
5. **If scoring / tie rules change, edit `src/logic/scoring.ts::getResult`.** Mind the sign convention: `GD` defaults to the **negative** side (`D`) when tied, `ZR/NL/YF` default to the **positive** side (`Z/N/Y`). The operator asymmetry is intentional — there is a comment block flagging it.
6. **Regenerate portraits if any code changed.** Update `PROMPT.md` with the new subject prompt, generate the new webp with the same `--sref` reference image used in the prior batch (consistency rule from PROMPT §4), place the file at `src/assets/<CODE>_*.png` under `$PORTRAIT_SRC`, run `pnpm portraits:build`. Missing portraits render as broken images silently — verify by loading the result page for that code.
7. **Verify share-link compatibility.** `decodeAnswers` right-pads old shorter hashes with `-`, so **adding** questions at the tail stays backwards-compatible (old links resolve, new egg questions stay unanswered ⇒ new tags simply do not unlock). **Removing or reordering** breaks old links — if that is required, plan a hash-version prefix migration first, do not silently edit `questionIds`.
8. **Spot-check copy in all four META contexts.** Open `/quiz`, select each of the four pre-answers, and scroll every question that has a `variants` block to confirm the wording still parses. The META selector clears all prior answers on change (`applyAnswerSelection`), so this is cheap to verify.

## Commands

Package manager: **pnpm** (see `pnpm-lock.yaml`).

- `pnpm dev` — Vite dev server on port 3000.
- `pnpm build` — Vike SSG build into `dist/` (`dist/client/` is the Vercel output).
- `pnpm preview` — preview the built site.
- `pnpm portraits:build` — regenerate the 16 type portraits. Reads source images from `$PORTRAIT_SRC` (default `~/Downloads/fwti`), resizes via `sharp` to 800×800 webp, and writes to `src/assets/portraits/<CODE>.webp`. Source files must be prefixed with the 4-letter code (`DRNY_*.png` etc.).

No test runner, linter, or formatter is configured. Type-check by running `pnpm build` (Vite + TS `noEmit` strict).

## High-level architecture

### Stack

Solid.js + **Vike** (filesystem routing, SSG) + vike-solid, built with Vite 8. All pages are prerendered except the dynamic result view. Deployed to Vercel (see `vercel.json`).

### Routing & rendering model

Routes live in `pages/` (Vike convention):

- `pages/+config.ts` — global `ssr: true, prerender: true`, extends `vike-solid`.
- `pages/+Layout.tsx` — wraps everything in `Layout` from `src/App.tsx`.
- `pages/+Head.tsx` — SEO meta, JSON-LD, theme bootstrap inline script, Google Fonts preconnect. Uses `src/site.ts` for origin/OG image.
- `pages/+onHydrationEnd.ts` — **critical**: after hydration on `/result/*`, if the route params didn't pick up the hash (i.e. user landed via the Vercel rewrite to the static shell), re-navigates through Vike's client router so the dynamic route takes over.
- `pages/index/` — landing.
- `pages/quiz/` — question UI; on submit encodes answers and navigates to `/result/<hash>`.
- `pages/result/` — `+route.ts = '/result/@hash'`, `ssr: false, prerender: false`. Decodes hash → `getResult` → renders `ResultPage`. Falls back to `navigate('/')` if the hash is missing/invalid.
- `pages/result-shell/` — `ssr: false, prerender: true`. A static CSR fallback page. **Why it exists**: Vercel's static output cannot serve the dynamic `/result/@hash` route directly, so `vercel.json` rewrites `/result/:hash*` → `/result-shell`. That HTML loads, hydrates, `onHydrationEnd` sees the `/result/<hash>` URL and re-navigates into the real route client-side. When the shell itself is reached at `/result-shell`, it redirects home.

Together: static build produces `/`, `/quiz`, `/result-shell`; the rewrite + hydration dance makes `/result/<anything>` feel like a dynamic route without an SSR server.

### App shell (`src/App.tsx`)

Single large module that owns all three page views (`HomePage`, `QuizPage`, `ResultPage`), `Layout`, and the `PreviewModal`. Global state (`answers`, `previewDetail`) is exposed as module-scope Solid signals and imported directly by the `pages/*` entry points — there is no store / context layer. `mainQ` is the canonical "main question count" (questions excluding the META pre-question, **including** egg questions).

Theme (light/dark) is persisted in `localStorage` under `fwti-theme` and restored by an inline script in `+Head.tsx` before hydration to avoid flash. See `src/theme.ts`.

File size matters: `src/App.tsx` is already near the house limit (≤500 lines, React/Solid components ≤300). Prefer extracting into `src/components/` before adding more to it.

### Quiz logic (`src/logic/` + `src/data/`)

- `data/questions.ts` — `questions[]` array. Dimensions: `GD` (主动/蹲) · `ZR` (炸/忍) · `NL` (黏/离) · `YF` (疑/佛), plus `META` (pre-question, no score) and egg questions (`tag: '彩蛋'`, placeholder dimension, intercepted before accumulation). Questions carry per-status `variants` so wording changes based on the META answer (`dating` / `ambiguous` / `crush` / `solo`). Exports `questionIds` — **the stable ordering used by the codec**. IDs are intentionally non-contiguous (e.g. META is id 32, eggs are 31/33/34).
- `logic/scoring.ts` — `calculateScores`, `detectHiddenTitles`, `getResult`. 16 types come from the GD×ZR×NL×YF quadrant; ties within a dimension default to the "废方向" (`D / Z / N / Y`) — note the sign convention is **not** uniform across dimensions, see the comment block in `getResult`. ≥2 tied dimensions produce `ALL` (我全都要). v0.3+ silently hard-classifies single-dimension ties to the default 废方向 (no `*` shown on the result card) — `displayCode` is kept as a field for consumer back-compat but is always equal to `code`. `closestCode` is still the deterministic best-match for 16-grid display even when the result is hidden. `getResult(answers, retreatCount?)` also takes an optional retreat counter for the 退退退 hidden tag — this is a session-only meta signal wired from the quiz page, intentionally **not** encoded in the share hash so observers of a shared link never see someone else's 退退退 badge.
- `logic/codec.ts` — `encodeAnswers` / `decodeAnswers` over `questionIds`. Encoding is base64url of the per-question digit string (`-` for unanswered). Decoder right-pads with `-` for backward compatibility with pre-ATM share links (32 chars vs the current 34). **Never reorder or renumber `questionIds` without planning a migration** — old share links break otherwise.
- `logic/family.ts` — the GZ/GR/DZ/DR quadrant color themes consumed by the result UI.
- `logic/answers.ts` — `applyAnswerSelection`: changing the META answer **wipes** all other answers, because the per-status question variants change the semantic context.

### Hidden titles

`detectHiddenTitles` layers extra badges on top of the base 16 types. Triggers encode intentional non-obvious interactions (e.g. `electronicVendor` deliberately mixes +2/-2 answers on the same dimension because that contradiction *is* the archetype). Read comments in-line before adjusting thresholds.

### Portraits

`src/components/Portrait.tsx` uses `import.meta.glob('../assets/portraits/*.webp', { eager, query: '?url' })` so only the 16 `CODE.webp` files bundled at build time are reachable. Missing files silently render a broken image; add the file and rerun `pnpm portraits:build` before wiring a new code.

## Project conventions

- **Comments**: code is liberally commented in 中文 when the intent is non-obvious (sign conventions, backward-compat shims, archetype design decisions). Preserve these — they're load-bearing context, not noise. Don't add comments for obvious code.
- **UI copy**: 中文 throughout, tone is 文言/半文言 (`君`, `为君`, `之以乃则`). Match the voice when adding strings.
- **Share links**: if you add a question, append its ID to `questionIds` — **do not insert** into the middle. The codec relies on append-only ordering.
- **Disclaimer**: the app is explicitly 娱乐, not a psychological instrument. Don't reframe copy as clinical.
