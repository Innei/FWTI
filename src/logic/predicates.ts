/**
 * v0.4 · 谓词层 · 在 `scoring.ts` 的纯数据（`Scores` / `answers`）与 trigger 的"语义"
 * 之间插入的一层可读抽象。每条 hidden personality / hidden title 的触发条件都写成一个
 * 纯函数 `(lens: AnswerLens) => boolean`，读着像自然语言，改动不需要重排 scoring 大函数。
 *
 * 设计原则：
 *   - trigger 函数**不得**直接访问 questions / questionIndex，全部走 lens。
 *   - trigger 函数**不得**出现裸题 id 字面量，必须通过 `SEMANTIC.*`。
 *   - lens 本身通过 `makeAnswerLens(...)` 工厂一次性构造，scoring 每次 getResult
 *     只构造一次复用。
 */

import {
  questionIndex,
  type Question,
  type QuestionDimension,
} from '../data/questions';
import { SEMANTIC, type SemanticAnchor } from './semanticIds';

export type RatioDim = 'GD' | 'ZR' | 'NL' | 'YF';

export type Polarity = -1 | 0 | 1;

export interface RatioMap {
  GD: number;
  ZR: number;
  NL: number;
  YF: number;
}

/**
 * 查询答题状态的只读透镜。
 * ratio / status / hiddenCount / retreatCount 在构造时就已固定；
 * optOf / polarityOf / polarityVariance 在运行时按需查表。
 */
export interface AnswerLens {
  ratio: RatioMap;
  status: 'dating' | 'ambiguous' | 'crush' | 'solo' | null;
  retreatCount: number;
  /** 撤回大师纠结值（tag='彩蛋' 的题 option.hidden 累加） */
  hiddenCount: number;
  /** 是否走了状态门禁（ratio === 0 的那种兜底），方便 ALL 判定 */
  tiedDimensions: readonly RatioDim[];

  /** 返回某题当前选的选项索引；未答为 undefined。 */
  optOf(id: number): number | undefined;
  /** 返回某题当前选的选项 score 的符号（+1 / 0 / -1）；未答返回 undefined。 */
  polarityOf(id: number): Polarity | undefined;
  /**
   * 一维内答案"自相攻伐"程度：统计该维度下已答题中 polarity 为 +1 的数量与 -1
   * 的数量，返回 min(aCount, bCount)。CHAOS 用 ≥ 2 判定。
   */
  polarityVariance(dim: RatioDim): number;

  /** 语义锚 shortcut · 等价于 `lens.polarityOf(SEMANTIC[anchor]) ?? 0`。 */
  polarityAt(anchor: SemanticAnchor): Polarity;
}

function signOf(score: number): Polarity {
  if (score > 0) return 1;
  if (score < 0) return -1;
  return 0;
}

/**
 * 构造 AnswerLens。路径（`path`）必须是当前已展开的 `buildQuestionPath(answers, status)`
 * 输出，保证 trigger 只看自己遇到的题（而不是题库中的其它路径）。
 */
export function makeAnswerLens(params: {
  answers: Record<number, number>;
  ratio: RatioMap;
  status: AnswerLens['status'];
  retreatCount: number;
  hiddenCount: number;
  tiedDimensions: readonly RatioDim[];
  path: Question[];
}): AnswerLens {
  const { answers, path } = params;

  const optOf = (id: number): number | undefined => answers[id];

  const polarityOf = (id: number): Polarity | undefined => {
    const q = questionIndex[id];
    if (!q) return undefined;
    const idx = answers[id];
    if (idx === undefined) return undefined;
    const opt = q.options[idx];
    if (!opt) return undefined;
    return signOf(opt.score);
  };

  const polarityVariance = (dim: RatioDim): number => {
    let pos = 0;
    let neg = 0;
    for (const q of path) {
      if (q.dimension !== dim) continue;
      if (q.tag === '彩蛋') continue;
      const p = polarityOf(q.id);
      if (p === 1) pos += 1;
      else if (p === -1) neg += 1;
    }
    return Math.min(pos, neg);
  };

  const polarityAt = (anchor: SemanticAnchor): Polarity =>
    polarityOf(SEMANTIC[anchor]) ?? 0;

  return {
    ratio: params.ratio,
    status: params.status,
    retreatCount: params.retreatCount,
    hiddenCount: params.hiddenCount,
    tiedDimensions: params.tiedDimensions,
    optOf,
    polarityOf,
    polarityVariance,
    polarityAt,
  };
}

// ───────────────────────────────────────────────────────────────
// Hidden personality triggers
// ───────────────────────────────────────────────────────────────

export interface HiddenPersonalityTrigger {
  code: string;
  /** 按从上到下判定；首条命中即返回，后续略过。 */
  test: (lens: AnswerLens) => boolean;
}

/**
 * VOID / LIMBO 的特性文案与立绘未随 v0.4 立即上线时，可把本 flag 翻成 false
 * 使两张新人格隐身——trigger 判定跳过，命中会回落到下一条或 ALL 兜底。
 *
 * Task 7 暂时以 flag off 形式落地 persona 数据（防止 personalities 表内有缺项
 * 被 16 格逻辑意外引用），portrait 就绪后翻开。
 */
export const ENABLE_NEW_HIDDEN = false;

/**
 * 按 DRAFT §5·附 「隐藏人格判定顺序」：
 *   MAD → RAT → PURE → CPU → CHAOS → E-DOG → BENCH → VOID → LIMBO → ALL
 * ALL 不在此列，由 scoring 在全部未命中后按 tiedDimensions ≥ 2 兜底。
 */
export const hiddenPersonalityTriggers: HiddenPersonalityTrigger[] = [
  // MAD · 发疯文学家 — 四维同时几近压顶 GZNY
  {
    code: 'MAD',
    test: (a) =>
      a.ratio.GD >= 0.9 &&
      a.ratio.ZR >= 0.9 &&
      a.ratio.NL >= 0.9 &&
      a.ratio.YF >= 0.9,
  },

  // RAT · 鼠鼠恋人 — solo + D + R + L + Y（退缩、抑制、拉远、焦虑）
  // 人格文案核心："不敢按赞 / 默默锁屏 / 鼠鼠我啊 不配"——此乃 deactivating 退避
  // 策略 + 高焦虑的混合依恋型，非"抱怨外放"。Shaver/Mikulincer 直接支持。
  // 旧 v0.4 初版 ZR/NL 两维写反（误作 Z + N），与文案与 DRAFT 皆脱节，今改。
  {
    code: 'RAT',
    test: (a) =>
      a.status === 'solo' &&
      a.ratio.GD <= -0.6 &&
      a.ratio.ZR <= -0.4 &&
      a.ratio.NL <= -0.4 &&
      a.ratio.YF >= 0.8,
  },

  // PURE · 纯爱战士 — solo / crush + G/N 至顶 + F 至顶（信念型，而非跪舔型）
  {
    code: 'PURE',
    test: (a) =>
      (a.status === 'solo' || a.status === 'crush') &&
      a.ratio.GD >= 0.85 &&
      a.ratio.NL >= 0.85 &&
      a.ratio.YF <= -0.85,
  },

  // CPU · CPU 恋人 — ambiguous only + Y 至顶 + 二脑补题并命中（脑补不爱我 + 坏消息焦虑）
  //
  // 设计原则：override 证据强度应严于 16 型，而非宽于。BAD_NEWS_PANIC 锚（Q49）只在
  // ambiguous extensions 存在，旧 v0.4 初版以三元豁免 crush/solo 让 CPU 能跨状态触达，
  // 结果"高 Y + 一条脑补"即可覆盖 16 型，证据偏弱。今按 DRAFT 收紧为状态门禁——
  // 与 RAT / PURE / VOID / LIMBO 同型，余状态之高 Y 用户走 16 型正常归格。
  {
    code: 'CPU',
    test: (a) =>
      a.status === 'ambiguous' &&
      a.ratio.YF >= 0.85 &&
      a.polarityAt('IMAGINE_NOT_LOVED') > 0 &&
      a.polarityAt('BAD_NEWS_PANIC') > 0,
  },

  // CHAOS · 已读乱回 — 显性 F 或 L + 某一维度自相攻伐（≥ 2 道 A 同时 ≥ 2 道 C）
  {
    code: 'CHAOS',
    test: (a) => {
      const surfaceFOrL = a.ratio.YF < 0 || a.ratio.NL < 0;
      if (!surfaceFOrL) return false;
      return (['GD', 'ZR', 'NL', 'YF'] as const).some(
        (d) => a.polarityVariance(d) >= 2,
      );
    },
  },

  // E-DOG · 赛博舔狗 — N/L 几近持平 + 2h 没回追一条 + 首约后主动发
  {
    code: 'E-DOG',
    test: (a) =>
      Math.abs(a.ratio.NL) <= 0.15 &&
      a.polarityAt('TWO_HOUR_NOREPLY') > 0 &&
      a.polarityAt('POST_DATE_TEXT') > 0,
  },

  // BENCH · 备胎之王 — ambiguous + 主动不低（G）+ 情绪压抑（R）+ 拉远距离（L）+
  // **隐性焦虑 Y**（文案核心："表面云淡风轻，内心默默数着上一次被回应是多久以前"
  // 属 hyperactivating 反刍，非 deactivating 佛系）+ 异性点赞触发嫉妒锚。
  // 旧 v0.4 初版此处 YF < 0 系极性写反，把佛系者误判进 BENCH、把真焦虑型排除。
  {
    code: 'BENCH',
    test: (a) =>
      a.status === 'ambiguous' &&
      a.ratio.GD >= 0.2 &&
      a.ratio.ZR <= -0.4 &&
      a.ratio.NL <= -0.2 &&
      a.ratio.YF >= 0.4 &&
      a.polarityAt('LIKE_OTHER_GENDER') > 0,
  },

  // VOID · 电子断联户（v0.4 新增 · flag off 时静默）
  {
    code: 'VOID',
    test: (a) =>
      ENABLE_NEW_HIDDEN &&
      a.status === 'solo' &&
      a.ratio.GD <= -0.8 &&
      a.ratio.NL <= -0.6 &&
      a.polarityAt('OFFLINE_RELIEF') > 0,
  },

  // LIMBO · 意难平学家（v0.4 新增 · flag off 时静默）
  {
    code: 'LIMBO',
    test: (a) =>
      ENABLE_NEW_HIDDEN &&
      a.status === 'crush' &&
      a.ratio.YF >= 0.8 &&
      a.ratio.NL >= 0.3 &&
      a.polarityAt('JEALOUSY_EX_STALK') > 0,
  },
];

// ───────────────────────────────────────────────────────────────
// Hidden title (overlay) triggers
// ───────────────────────────────────────────────────────────────

/**
 * 10 条叠加隐藏标签。每条返回布尔，命中即解锁。顺序不敏感（并列成立）。
 */
export interface HiddenTitleTrigger {
  key: string;
  test: (lens: AnswerLens) => boolean;
}

export const hiddenTitleTriggers: HiddenTitleTrigger[] = [
  // ① 撤回大师：Q31 彩蛋 hidden 值 ≥ 2
  {
    key: 'retractMaster',
    test: (a) => a.hiddenCount >= 2,
  },

  // ② 夜谈冠军：三条"情绪外放 / 脑补安全感"题（Q12 受委屈、Q13 哭、Q29 脑补不爱）
  // 中至少两题 polarity 为 +1（A 方向）
  {
    key: 'nightTalkChamp',
    test: (a) => {
      const hits = [12, 13, 29].filter((id) => (a.polarityOf(id) ?? 0) > 0)
        .length;
      return hits >= 2;
    },
  },

  // ③ 朋友圈考古学家：JEALOUSY_EX_STALK + LIKE_OTHER_GENDER 皆 +1
  {
    key: 'momentsArchaeologist',
    test: (a) =>
      a.polarityAt('JEALOUSY_EX_STALK') > 0 &&
      a.polarityAt('LIKE_OTHER_GENDER') > 0,
  },

  // ④ 薛定谔的前任：仅 crush 可解 + FAREWELL_BLAME + BAD_NEWS_PANIC 皆 +1
  // 注：BAD_NEWS_PANIC 绑定 ambiguous 路径 Q49；crush 路径没有该题。
  // 因此 crush 下此触发永远不成立——对应 DRAFT 的"仅 crush 可解"需要替代判据。
  // 权宜：用 FAREWELL_BLAME（crush 专属 Q57）+ IMAGINE_NOT_LOVED（trunk Q29）替代。
  {
    key: 'schrodingerEx',
    test: (a) =>
      a.status === 'crush' &&
      a.polarityAt('FAREWELL_BLAME') > 0 &&
      a.polarityAt('IMAGINE_NOT_LOVED') > 0,
  },

  // ⑤ 电子乙方：DATE_LOCATION_DEFER -1（让 TA 定）+ COLD_WAR_APOLOGIZE +1（我先低头，仅 dating）
  // + TWO_HOUR_NOREPLY +1（先追一条）
  {
    key: 'electronicVendor',
    test: (a) =>
      a.polarityAt('DATE_LOCATION_DEFER') < 0 &&
      a.polarityAt('COLD_WAR_APOLOGIZE') > 0 &&
      a.polarityAt('TWO_HOUR_NOREPLY') > 0,
  },

  // ⑥ 人形 ATM：Q33 A 或 Q34 A
  {
    key: 'humanATM',
    test: (a) => a.optOf(33) === 0 || a.optOf(34) === 0,
  },

  // ⑦ 空想家：solo + 路径上极端选项（polarity ≠ 0）占比 ≥ 40%
  // 近似 v0.3 的"主线题 ≥ 12 条 A 或 C"
  {
    key: 'daydreamer',
    test: (a) => {
      if (a.status !== 'solo') return false;
      // 注意：不在 lens 中持有 path，此条改用 ratio 的"总强度"近似
      // —— ratio 的绝对值 sum 越大，说明选的极端选项越多。
      const intensity =
        Math.abs(a.ratio.GD) +
        Math.abs(a.ratio.ZR) +
        Math.abs(a.ratio.NL) +
        Math.abs(a.ratio.YF);
      return intensity >= 2.4; // 四维均值 ≥ 0.6 ≈ 极端答案占比 ~60%
    },
  },

  // ⑧ 典中典：四维 |ratio| 皆 ≥ 0.9
  {
    key: 'peak',
    test: (a) =>
      Math.abs(a.ratio.GD) >= 0.9 &&
      Math.abs(a.ratio.ZR) >= 0.9 &&
      Math.abs(a.ratio.NL) >= 0.9 &&
      Math.abs(a.ratio.YF) >= 0.9,
  },

  // ⑨ 普信选手：判定为 GRLF + 三条 YF 佛系题全命中 -1 方向
  {
    key: 'overconfident',
    test: (a) => {
      const isGRLF =
        a.ratio.GD > 0 &&
        a.ratio.ZR < 0 &&
        a.ratio.NL < 0 &&
        a.ratio.YF < 0;
      if (!isGRLF) return false;
      return (
        a.polarityAt('CALM_RIVAL') < 0 &&
        a.polarityAt('LIKE_OTHER_GENDER') < 0 &&
        a.polarityAt('OTHER_PRAISE') < 0
      );
    },
  },

  // ⑩ 退退退：session 内改答 ≥ 3 次
  {
    key: 'retreatClub',
    test: (a) => a.retreatCount >= 3,
  },
];
