---
name: explain-result
description: Use when a user pastes an FWTI share link (`/result/<hash>`) or bare hash and asks why they got that personality, wants a psychologically grounded breakdown of the classification, or is debugging a suspicious result from the quiz. Applies only within this repo (FWTI v1/v2 codec).
---

# explain-result

## Purpose

A user hands you a share link. They already know the label. What they don't know is **why**: which answers cluster into which construct, which psychometric scale the dimension is anchored on, which hidden trigger was a near miss, and where the 16-grid boundaries actually sit. This skill defers all decoding, path reconstruction, scoring, trigger evaluation, and citation lookup to `scripts/explain-result.ts`, then narrates the JSON into a literature-grounded reading.

## Invoke the script

```bash
bun scripts/explain-result.ts "<url-or-hash>"
```

Accepts a full URL or bare hash. Needs `bun` on PATH (TS imported directly, no build).

## Exit codes

| code | meaning |
|------|---------|
| 0    | success — JSON on stdout |
| 1    | no argument |
| 2    | could not extract hash |
| 3    | hash failed to decode |

Non-zero → stop, tell the user the link is unreadable, do not fabricate.

## If `version: 1`

Legacy pre-v0.4 link. **Do not** reclassify with v0.4 rules. Say so explicitly, optionally read `answersRaw` against `src/data/legacy/questions-v1.ts`, then stop. None of the template below applies.

## Narration template (mandatory 5 sections)

### §1 · 结论

One line: `{code} · {personality.name}（{family} 家）· {status} 语境 · {hidden 覆盖 | 无隐藏覆盖}`.

### §2 · 四维解剖

Four sub-sections, **ordered by `|ratio|` descending** (most decisive dimension first — not alphabetical). Each sub-section:

```
### {dim 中文名} {DIM} = {ratio}（{极性字}·{极性中文}）· {n} 题

- **Q{id}** {anchor-or-short-tag}「{selected option text verbatim}」· {delta}
- ... (2–4 decisive entries, sorted by |delta| descending)

**学理**：<one to three sentences>
```

**Evidence rules:**
- Quote the option text verbatim from `perQuestion[i].selected.text`.
- Prefer entries whose `semanticAnchor` is non-null or whose `|delta| ≥ 0.5`.
- If the dimension has counter-direction evidence (a sign flip), include one of those too — it's where the nuance lives.

**学理 rules:**
- Pull the citation from `citations.{DIM}` (already parsed from DRAFT.md §八). Name at least one author + year.
- Name the construct in English (BIS/BAS, expressive suppression, ECR-R avoidance / anxiety, hyperactivating / deactivating strategy, etc.).
- Explain **why this user's cluster maps onto that construct**, not just restate the definition.
- If `citations.{DIM}` is empty (source parse failed), fall back: read `DRAFT.md` §八 directly. Never invent authors or years.

### §3 · 归格推演

Short technical recap. Quote the asymmetric sign table verbatim:

```
GD > 0 ⇒ G    (losing side: D)
ZR < 0 ⇒ R    (losing side: Z)
NL < 0 ⇒ L    (losing side: N)
YF < 0 ⇒ F    (losing side: Y)
```

Plug in the four ratios, derive `closest16`, cite the personality card's core one-liner, and say in one sentence **how the card's description lands on the §2 evidence**.

### §4 · 触发审计

Two blocks.

**Hidden personality** · Walk `hiddenPersonalityEval` in order (`MAD → RAT → PURE → CPU → CHAOS → E-DOG → BENCH → VOID → LIMBO`).

- **If `hiddenPersonalityHit` is non-null**: quote the trigger's condition (copy the boolean expression from `src/logic/predicates.ts`), explain each clause against the observed ratios / semantic anchors, and pull the mechanism line from `citations.hidden[code]`.
- **If null**: report "皆不中" then pick **the two most-instructive near misses**. For each, state (a) which clauses passed, (b) which clause blocked, (c) the minimum change in answers that would have flipped it. Prefer near misses where the status gate is already satisfied — they teach the real boundary.

**Overlay titles** · For each `hiddenTitleEval` entry: hit ones get a one-line trigger justification (cite the semantic anchors involved). Missed ones can be listed in a single compressed line. **Explicitly** surface any title that is structurally unrecoverable — currently just **退退退** (`retreatCount` is session-only, never encoded) — never claim it fired or did not.

### §5 · 综合与局限

- **Synthesis paragraph** (~80–120 字): weave the four dimensions + trigger outcome into one narrative that answers "why this code and not its neighbors". Reference the §4 near-miss boundary explicitly (e.g. "离 LIMBO 差在 YF 未到 0.8").
- **Disclaimer · one sentence only**. Use `citations.disclaimer` as source and compress to one sentence. **Do not expand into a paragraph.** A hard upper bound — no exceptions.

## Voice

**假设读者是一个完全不懂心理学、不懂这个测试怎么打分的普通人。** 你是在用大白话给 TA 解释 TA 自己的结果。

核心原则：

- **大白话优先**。能用「你总是把委屈自己憋着」就别写「表达抑制倾向显著」。能用「你心里其实在乎得要死，但脸上一点不露」就别写「hyperactivating strategy 与表情抑制的共现」。
- **先说人话，再补学理**。每段先用一两句生活化的话把这个维度在讲什么说清楚，然后才在 **学理** 那一行补一句「这个东西心理学里有个名字叫 XX（某某某 1994）」。学理行是注脚性质，不是主角。
- **把题目当证据引过来**。引用选项原文之后用一句人话解释「这一条说明什么」——比如「选了这个就是你宁愿自己崩也不愿让对方看到你难受」。不要让读者自己去猜题目在测什么。
- **第二人称用「你」，对方用「TA」**。全程像朋友在帮你看报告，不是老师在讲课。
- **可以自嘲、可以搞笑，别油腻、别说教**。§2/§4 可以稍微损一下（人格卡也是这个调性），§5 综合段要收回来，平视、温和。
- **学理术语处理**：技术 token（code、构念英文名、作者年份引文）保留英文原样，但第一次出现时必须在旁边用括号或破折号给出大白话解释。例：`expressive suppression（说人话：把情绪往肚里吞）`。第二次出现可以只用中文。
- **学理 rules 没变**：citations 仍然要真，作者年份不得编造，`citations.{DIM}` 为空时回读 `DRAFT.md` §八。
- **篇幅**：目标 1000–1400 字。要压字数先砍 §2 的 evidence 行数，不要动 §4 的 near miss 分析。
- **禁止**：论文摘要腔、堆叠术语不解释、把读者当专业人士、用「综上所述 / 不难看出 / 值得注意的是」这类书面语填充。

## Hard rules (non-negotiable)

1. Never fabricate citations. If `citations` is empty or a dimension array is missing, fall back to a live Read of `DRAFT.md` §八 before narrating.
2. Never claim 退退退 either fired or did not — it is structurally unrecoverable from the hash.
3. Never apply v0.4 rules to a v1 legacy link.
4. §5 disclaimer stays a single sentence. Always.
5. Every "why" assertion in §2 / §4 must be traceable to a specific `perQuestion` entry, a semantic anchor from `SEMANTIC.*`, or a trigger expression in `predicates.ts`. No free-floating psychological speculation.

## When not to use

- User wants to generate a new share link, author new questions, or debug scoring itself → normal edits in `src/data/` + `src/logic/`, not this skill.
- Link is from an unrelated product. This skill only understands the FWTI codec in this repo.
