#!/usr/bin/env bun
/**
 * explain-result · dump the full reasoning chain behind an FWTI share link.
 *
 * Imports the repo's own codec + scoring + predicates directly (bun runs TS
 * natively, no build step). Prints a JSON report the `explain-result` skill
 * narrates. No logic is duplicated here; if scoring changes, this follows
 * automatically on the next run.
 *
 * Usage:  bun scripts/explain-result.ts "<url-or-hash>"
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeAnswers } from '../src/logic/codec';
import { getResult as getResultV2 } from '../src/logic/scoring';
import { buildQuestionPath as buildQuestionPathV2 } from '../src/logic/flow';
import {
  resolveOptionText as resolveOptionTextV2,
  resolveQuestionText as resolveQuestionTextV2,
  type Question,
} from '../src/copy/questions';
import {
  personalities as personalitiesV2,
  hiddenTitles as hiddenTitlesV2,
} from '../src/copy/personalities';
import {
  hiddenPersonalityTriggers,
  hiddenTitleTriggers,
  makeAnswerLens,
} from '../src/logic/predicates';
import { SEMANTIC } from '../src/logic/semanticIds';
import { getResultV3 } from '../src/logic/v3/scoring';
import { buildQuestionPathV3 } from '../src/logic/v3/flow';
import {
  hiddenPersonalityTriggersV3,
  hiddenTagTriggersV3,
  makeAnswerLensV3,
  type RatioMapV3,
} from '../src/logic/v3/predicates';
import { personalitiesV3 } from '../src/copy/v3/personalities';
import { hiddenTitlesV3 } from '../src/copy/v3/tags';
import {
  resolveOptionText as resolveOptionTextV3,
  resolveQuestionText as resolveQuestionTextV3,
  type QuestionV3,
} from '../src/copy/v3/types';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const rawInput = process.argv[2];
if (!rawInput) {
  console.error('usage: bun scripts/explain-result.ts <result-url-or-hash>');
  process.exit(1);
}

const hash = extractHash(rawInput);
if (!hash) {
  console.error(JSON.stringify({ error: 'cannot extract hash', input: rawInput }));
  process.exit(2);
}

const decoded = decodeAnswers(hash);
if (!decoded) {
  console.error(JSON.stringify({ error: 'invalid hash', hash }));
  process.exit(3);
}

if (decoded.version === 1) {
  console.log(
    JSON.stringify(
      {
        hash,
        version: 1,
        warning:
          'v1 legacy link — pre-v0.4 question space. v0.4 scoring cannot faithfully reclassify this; answers dumped raw for manual reading only.',
        status: null,
        answersRaw: decoded.answers,
        note: 'To interpret, read src/copy/legacy/questions-v1.ts for id → wording.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const { answers, status } = decoded;

if (decoded.version === 3) {
  printV3Report(hash, answers, status);
  process.exit(0);
}

printV2Report(hash, answers, status);

function printV3Report(
  hash: string,
  answers: Record<number, number>,
  status: ActiveStatus,
): void {
  const result = getResultV3(answers, 0, status);
  const path = buildQuestionPathV3(answers, status);
  const ratio: RatioMapV3 = {
    C: result.scores.GD,
    R: result.scores.ZR,
    A: result.scores.NL,
    S: result.scores.YF,
  };

  const perQuestion = path
    .filter((q) => q.dimension !== 'META' && answers[q.id] !== undefined)
    .map((q: QuestionV3) => {
      const idx = answers[q.id];
      const opt = q.options[idx];
      if (!opt) return null;
      return {
        id: q.id,
        dimension: q.dimension,
        tag: opt.tag ?? null,
        semanticAnchor: null,
        text: resolveQuestionTextV3(q, status),
        selected: {
          index: idx,
          label: opt.label,
          text: resolveOptionTextV3(q, idx, status),
          score: opt.score,
          delta: opt.score / 2,
          optionTag: opt.tag ?? null,
        },
      };
    })
    .filter(Boolean);

  const lens = makeAnswerLensV3({
    answers,
    ratio,
    status,
    retreatCount: 0,
    tiedDimensions: result.tiedDimensions,
  });

  const hiddenEval = hiddenPersonalityTriggersV3.map((t) => ({
    code: t.code,
    hit: safeTest(() => t.test(lens)),
  }));
  const firstHiddenHit = hiddenEval.find((e) => e.hit === true);

  const titleEval = hiddenTagTriggersV3.map((t) => ({
    key: t.key,
    hit: safeTest(() => t.test(lens)),
    title: hiddenTitlesV3[t.key]?.name ?? null,
  }));

  const output = {
    hash,
    version: 3,
    status,
    result: {
      code: result.code,
      personality: personalitiesV3[result.code]?.name ?? result.code,
      closest12: result.closestCode,
      closestPersonality:
        personalitiesV3[result.closestCode]?.name ?? result.closestCode,
      isHidden: result.isHidden,
      isAll: result.isAll,
      tiedDimensions: result.tiedDimensions,
      ratios: {
        C: round(ratio.C),
        R: round(ratio.R),
        A: round(ratio.A),
        S: round(ratio.S),
      },
      breakdown: {
        C: { raw: round(result.scores.rawC), n: result.scores.nC },
        R: { raw: round(result.scores.rawR), n: result.scores.nR },
        A: { raw: round(result.scores.rawA), n: result.scores.nA },
        S: { raw: round(result.scores.rawS), n: result.scores.nS },
      },
      attachmentApproximation: classifyAttachmentApproximation(ratio),
    },
    currentGrid: {
      C: ratio.C >= 0.33 ? '追' : ratio.C <= -0.33 ? '避' : '中',
      R: ratio.R >= 0.33 ? '暴' : ratio.R <= -0.33 ? '闷' : '中',
      A: ratio.A >= 0.33 ? '黏' : ratio.A <= -0.33 ? '离' : '中',
      S: ratio.S >= 0.33 ? '疑' : ratio.S <= -0.33 ? '佛' : '中',
      note: 'v3 uses C/R/A/S, not the legacy GD/ZR/NL/YF question space.',
    },
    perQuestion,
    hiddenPersonalityEval: hiddenEval,
    hiddenPersonalityHit: firstHiddenHit?.code ?? null,
    hiddenTitleEval: titleEval,
    unlockedTitles: result.unlockedHiddenTitles.map(
      (t) => (t as { name?: string; key?: string }).name ?? (t as { key?: string }).key ?? t,
    ),
    caveats: {
      retreatCount:
        'always 0 — flipFlopper depends on session-only answer changes and is never encoded into the share hash.',
      legacy:
        'v3 links must not be interpreted with v1/v2 question ids or legacy hidden-personality predicates.',
    },
    citations: loadCitations(),
  };

  console.log(JSON.stringify(output, null, 2));
}

function printV2Report(
  hash: string,
  answers: Record<number, number>,
  status: ActiveStatus,
): void {
  const result = getResultV2(answers, 0, status);
  const path = buildQuestionPathV2(answers, status);

  const anchorByQid = new Map<number, string>();
  for (const [anchor, id] of Object.entries(SEMANTIC)) {
    anchorByQid.set(id as number, anchor);
  }

  const perQuestion = path
    .filter((q) => answers[q.id] !== undefined)
    .map((q: Question) => {
      const idx = answers[q.id];
      const opt = q.options[idx];
      if (!opt) return null;
      return {
        id: q.id,
        dimension: q.dimension,
        tag: q.tag ?? null,
        semanticAnchor: anchorByQid.get(q.id) ?? null,
        text: resolveQuestionTextV2(q, status),
        selected: {
          index: idx,
          label: opt.label,
          text: resolveOptionTextV2(q, idx, status),
          score: opt.score,
          delta:
            q.tag === '彩蛋' || q.dimension === 'META' ? null : opt.score / 2,
          hidden: opt.hidden ?? null,
          secondary: opt.secondary ?? null,
        },
      };
    })
    .filter(Boolean);

  const ratio = {
    GD: result.scores.GD,
    ZR: result.scores.ZR,
    NL: result.scores.NL,
    YF: result.scores.YF,
  };

  const lens = makeAnswerLens({
    answers,
    ratio,
    status,
    retreatCount: 0,
    hiddenCount: result.scores.hidden,
    tiedDimensions: result.tiedDimensions,
    path,
  });

  const hiddenEval = hiddenPersonalityTriggers.map((t) => ({
    code: t.code,
    hit: safeTest(() => t.test(lens)),
  }));
  const firstHiddenHit = hiddenEval.find((e) => e.hit === true);

  const titleEval = hiddenTitleTriggers.map((t) => ({
    key: t.key,
    hit: safeTest(() => t.test(lens)),
    title: (hiddenTitlesV2 as Record<string, { name?: string }>)[t.key]?.name ?? null,
  }));

  const output = {
    hash,
    version: 2,
    status,
    result: {
      code: result.code,
      personality: personalitiesV2[result.code]?.name ?? result.code,
      closest16: result.closestCode,
      closestPersonality:
        personalitiesV2[result.closestCode]?.name ?? result.closestCode,
      isHidden: result.isHidden,
      isAll: result.isAll,
      tiedDimensions: result.tiedDimensions,
      ratios: {
        GD: round(ratio.GD),
        ZR: round(ratio.ZR),
        NL: round(ratio.NL),
        YF: round(ratio.YF),
      },
      breakdown: {
        GD: { raw: round(result.scores.rawGD), n: result.scores.nGD },
        ZR: { raw: round(result.scores.rawZR), n: result.scores.nZR },
        NL: { raw: round(result.scores.rawNL), n: result.scores.nNL },
        YF: { raw: round(result.scores.rawYF), n: result.scores.nYF },
      },
      hiddenCount: result.scores.hidden,
    },
    sixteenGrid: {
      G: ratio.GD > 0 ? 'G' : 'D',
      Z: ratio.ZR < 0 ? 'R' : 'Z',
      N: ratio.NL < 0 ? 'L' : 'N',
      Y: ratio.YF < 0 ? 'F' : 'Y',
      note: 'default losing side per dimension: GD→D, ZR→Z, NL→N, YF→Y',
    },
    perQuestion,
    hiddenPersonalityEval: hiddenEval,
    hiddenPersonalityHit: firstHiddenHit?.code ?? null,
    hiddenTitleEval: titleEval,
    unlockedTitles: result.unlockedHiddenTitles.map(
      (t) => (t as { name?: string; key?: string }).name ?? (t as { key?: string }).key ?? t,
    ),
    caveats: {
      retreatCount:
        'always 0 — retreat counter is session-only and never encoded into the share hash.',
      hiddenCount:
        'only non-zero if the sharer answered an egg question with a hidden weight (Q31/Q33/Q34/Q35).',
    },
    citations: loadCitations(),
  };

  console.log(JSON.stringify(output, null, 2));
}

type ActiveStatus = 'dating' | 'ambiguous' | 'crush' | 'solo';

function round(n: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return n;
  return Math.round(n * 1000) / 1000;
}

function classifyAttachmentApproximation(ratio: RatioMapV3): {
  label: string;
  rule: string;
} {
  const anxious = ratio.S >= 0.33;
  const avoidant = ratio.A <= -0.33;
  if (anxious && avoidant) {
    return {
      label: '焦虑-回避混合型',
      rule: 'S >= 0.33 and A <= -0.33',
    };
  }
  if (anxious) {
    return {
      label: '焦虑型',
      rule: 'S >= 0.33 and A > -0.33',
    };
  }
  if (avoidant) {
    return {
      label: '回避型',
      rule: 'S < 0.33 and A <= -0.33',
    };
  }
  return {
    label: '安全型',
    rule: 'S < 0.33 and A > -0.33',
  };
}

function safeTest(fn: () => boolean): boolean | { error: string } {
  try {
    return fn();
  } catch (err) {
    return { error: String((err as Error)?.message ?? err) };
  }
}

function extractHash(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/\/result\/([^/?#\s]+)/);
  if (m) return m[1];
  const tail = trimmed.split('/').pop();
  return tail?.split(/[?#]/)[0] || null;
}

type Citations = {
  GD: string[];
  ZR: string[];
  NL: string[];
  YF: string[];
  hidden: Record<string, string>;
  disclaimer: string;
  source: { draft: 'ok' | 'missing'; predicates: 'ok' | 'missing' };
};

function loadCitations(): Citations {
  const out: Citations = {
    GD: [],
    ZR: [],
    NL: [],
    YF: [],
    hidden: {},
    disclaimer: '',
    source: { draft: 'missing', predicates: 'missing' },
  };
  try {
    out.source.draft = 'ok';
    parseDraftCitations(readFileSync(resolve(repoRoot, 'DRAFT.md'), 'utf8'), out);
  } catch {
    /* fallback empty */
  }
  try {
    out.source.predicates = 'ok';
    parsePredicateComments(
      readFileSync(resolve(repoRoot, 'src/logic/predicates.ts'), 'utf8'),
      out,
    );
  } catch {
    /* fallback empty */
  }
  return out;
}

/**
 * DRAFT.md §八 parser. Walks from the `## 八、学术依据` header to the next H2,
 * splits sub-blocks by `**... 对应 <DIM>**` bold headers, collects following
 * bullet lines (+ the trailing `→` explanation) until the next bold header or
 * blockquote. The blockquote `> **郑重声明**` becomes the disclaimer.
 */
function parseDraftCitations(md: string, out: Citations): void {
  const lines = md.split('\n');
  const startIdx = lines.findIndex((l) => /^##\s+.*学术依据/.test(l));
  if (startIdx < 0) return;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  const section = lines.slice(startIdx, endIdx);

  const dimMap: Record<string, (keyof Citations)[]> = {
    'Y/F': ['YF'],
    'N/L': ['NL'],
    'Z/R': ['ZR'],
    'G/D': ['GD'],
  };

  let currentDims: (keyof Citations)[] = [];
  let currentBuffer: string[] = [];

  const flush = () => {
    if (currentDims.length === 0 || currentBuffer.length === 0) return;
    // Each bullet is a `- ...` line possibly followed by a `  → ...` gloss line.
    // Join multiline bullets into single entries.
    const entries: string[] = [];
    let acc = '';
    for (const raw of currentBuffer) {
      if (/^\s*-\s/.test(raw)) {
        if (acc) entries.push(acc.trim());
        acc = raw.replace(/^\s*-\s*/, '');
      } else if (acc) {
        acc += ' ' + raw.trim();
      }
    }
    if (acc) entries.push(acc.trim());
    for (const dim of currentDims) {
      (out[dim] as string[]).push(...entries);
    }
    currentBuffer = [];
  };

  for (const raw of section) {
    const line = raw.trimEnd();

    // disclaimer blockquote
    const disclaimerMatch = line.match(/^>\s*\*\*郑重声明\*\*[:：]?\s*(.*)$/);
    if (disclaimerMatch) {
      flush();
      currentDims = [];
      out.disclaimer = disclaimerMatch[1]
        .replace(/\*\*/g, '')
        .trim();
      continue;
    }

    // dimension sub-header e.g. **成人依恋理论 ... —— 对应 Y/F 与 N/L**
    const header = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (header) {
      flush();
      const text = header[1];
      const dims: (keyof Citations)[] = [];
      for (const [token, mapped] of Object.entries(dimMap)) {
        if (text.includes(token)) dims.push(...mapped);
      }
      currentDims = dims;
      continue;
    }

    if (currentDims.length > 0) {
      currentBuffer.push(line);
    }
  }
  flush();
}

/**
 * Pull the block comment above each hidden-personality trigger in
 * `predicates.ts`. Anchor: a `// CODE · ...` line that matches a known code,
 * then walk backwards to collect the contiguous comment block, then forwards
 * past any further `// ...` lines until the first non-comment line.
 */
function parsePredicateComments(src: string, out: Citations): void {
  const lines = src.split('\n');
  const knownCodes = new Set([
    'MAD',
    'RAT',
    'PURE',
    'CPU',
    'CHAOS',
    'E-DOG',
    'BENCH',
    'VOID',
    'LIMBO',
  ]);
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^\s*\/\/\s*([A-Z][A-Z-]*)\s*·\s*(.*)$/);
    if (!m) continue;
    const code = m[1];
    if (!knownCodes.has(code)) continue;
    const buf: string[] = [m[2].trim()];
    for (let j = i + 1; j < lines.length; j += 1) {
      const cm = lines[j].match(/^\s*\/\/\s?(.*)$/);
      if (!cm) break;
      buf.push(cm[1].trim());
    }
    out.hidden[code] = buf.filter(Boolean).join(' ');
  }
}
