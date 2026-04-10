/**
 * v0.3 scoring snapshot — frozen。
 * 仅在解码 v1 分享链接（无 `v2.` 前缀）时走此路径；v0.4+ 的所有新 runtime 变更
 * 都不得回改本文件。若需变更 v0.3 行为，应在 codec 加版本号而非直接改此处。
 */
import { questions } from '../../data/legacy/questions-v1';
import { personalities, hiddenTitles, type HiddenTitle } from '../../data/personalities';

export interface Scores {
  GD: number; // + = G, - = D
  ZR: number; // + = Z, - = R
  NL: number; // + = N, - = L
  YF: number; // + = Y, - = F
  hidden: number; // 撤回大师纠结值
}

export type RelationshipStatus = 'dating' | 'ambiguous' | 'crush' | 'solo' | null;

export interface Result {
  code: string;
  /**
   * 结果页展示码。v0.3 起与 `code` 完全一致——单维平票已不再外显，
   * 字段保留只为不破坏 ShareImageModal 等消费端的 API（见 codebase-wide 引用）。
   */
  displayCode: string;
  personality: typeof personalities[string];
  /** 至少解锁一个隐藏标签时为 true（兼容旧字段） */
  hasHiddenTitle: boolean;
  /** 所有解锁的隐藏叠加标签 */
  unlockedHiddenTitles: HiddenTitle[];
  /** 是否触发了"我全都要 · ALL"（≥2 个维度平票 · 兜底隐藏人格） */
  isAll: boolean;
  /**
   * 是否触发了任一隐藏人格（ALL 或 RAT/PURE/MAD/E-DOG/CHAOS/CPU/BENCH）。
   * v0.3 引入，用于结果页"隐藏人格解锁"头部与单维平票 `*` 标记判断。
   */
  isHidden: boolean;
  /**
   * ALL 下按"符号+默认废方向"硬分出的最接近人格代号。
   * 非隐藏场景下与 code 相同，方便结果页展示"硬要归类的话最接近 X"。
   */
  closestCode: string;
  closestPersonality: typeof personalities[string];
  /** 被判为平票的维度列表（用于加星号显示） */
  tiedDimensions: Array<'GD' | 'ZR' | 'NL' | 'YF'>;
  /** 前置题选择：恋爱状态 */
  status: RelationshipStatus;
  scores: Scores;
  dimensionLabels: { dim: string; labelA: string; labelB: string; valueA: number; valueB: number }[];
}

/** 每题答案为选项索引；主线题为 0..2，META 前置题允许 0..3。 */
export function resolveOptionIndex(value: number): number | null {
  if (!Number.isInteger(value) || value < 0 || value > 3) return null;
  return value;
}

export function calculateScores(answers: Record<number, number>): Scores {
  const scores: Scores = { GD: 0, ZR: 0, NL: 0, YF: 0, hidden: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const idx = resolveOptionIndex(raw);
    if (idx === null) continue;
    const option = q.options[idx];
    if (!option) continue;

    // META 前置题不计入任何维度
    if (q.dimension === 'META') continue;

    if (q.tag === '彩蛋') {
      scores.hidden += option.hidden ?? 0;
      continue;
    }

    const delta = option.score;
    switch (q.dimension) {
      case 'GD': scores.GD += delta; break;
      case 'ZR': scores.ZR += delta; break;
      case 'NL': scores.NL += delta; break;
      case 'YF': scores.YF += delta; break;
    }
  }

  return scores;
}

/** 从答案中读取前置题（META）的恋爱状态 */
export function getRelationshipStatus(answers: Record<number, number>): RelationshipStatus {
  const metaQ = questions.find((q) => q.dimension === 'META');
  if (!metaQ) return null;
  const idx = answers[metaQ.id];
  if (idx === undefined) return null;
  const opt = metaQ.options[idx];
  if (!opt) return null;
  return (opt.meta as RelationshipStatus) ?? null;
}

/**
 * 各维度的满分（问题数 × 2）。用于 dimensionLabels 进度条与阈值计算。
 * GD = 8 题 × ±2 = ±16；ZR = 7 题 × ±2 = ±14；NL = 8 题 × ±2 = ±16；YF = 7 题 × ±2 = ±14。
 */
const DIM_MAX = { GD: 16, ZR: 14, NL: 16, YF: 14 } as const;

/**
 * "至顶"阈值（≥ 约 87.5% 方向强度）——v0.3 隐藏人格触发条件用。
 * 数值兼顾 16 分制与 14 分制：14/16 = 0.875；12/14 ≈ 0.857。
 * 已经接近"绝大多数题都压到同一端"的语义，继续收紧会让触发过于苛刻。
 */
const TOP_THRESHOLD = { GD: 14, ZR: 12, NL: 14, YF: 12 } as const;

/**
 * 按 DRAFT §5·附「隐藏人格判定顺序」检测特殊隐藏人格。
 * 命中任一条即返回对应代号；全未命中返回 null，由 getResult 回落到 ALL（兜底）或 16 格。
 *
 * 顺序（越具体越靠前）：MAD → RAT → PURE → CPU → CHAOS → E-DOG → BENCH
 * ALL（≥2 维平票）置于 getResult 末尾作为最后的兜底，不在此函数内处理。
 */
export function detectHiddenPersonality(
  answers: Record<number, number>,
  scores: Scores,
  status: RelationshipStatus,
): string | null {
  const A = 0;
  const C = 2;

  // 1. MAD · 发疯文学家 — GZNY 方向上四维同时至顶（至纯 GZNY 爆裂形态）
  if (
    scores.GD >= TOP_THRESHOLD.GD &&
    scores.ZR >= TOP_THRESHOLD.ZR &&
    scores.NL >= TOP_THRESHOLD.NL &&
    scores.YF >= TOP_THRESHOLD.YF
  ) {
    return 'MAD';
  }

  // 2. RAT · 鼠鼠恋人 — 前置 solo（纯单身）+ 四维皆偏废端（D/Z/N/Y 方向）+ Y 维至顶
  //    "偏废端"以符号判定即可：越废的方向 = GD<0 / ZR>0 / NL>0 / YF>0。
  //    再叠加"Y 至顶"是为了与 CPU 区分——CPU 不要求前置 solo 也不要求其它三维偏废。
  if (
    status === 'solo' &&
    scores.GD < 0 &&
    scores.ZR > 0 &&
    scores.NL > 0 &&
    scores.YF >= TOP_THRESHOLD.YF
  ) {
    return 'RAT';
  }

  // 3. PURE · 纯爱战士 — 前置 solo/crush + G、N 两维至顶 + F 至顶（"主动+黏+佛系"三合一的信念型）
  //    与 GRNF 舔狗 SIMP 的区分：SIMP 是常规 16 格判定、有现实对象；PURE 强制前置单身/暗恋，
  //    且要求三个维度都"至顶"而非仅仅符号正确——强调的是"信念"而非"跪舔"。
  if (
    (status === 'solo' || status === 'crush') &&
    scores.GD >= TOP_THRESHOLD.GD &&
    scores.NL >= TOP_THRESHOLD.NL &&
    scores.YF <= -TOP_THRESHOLD.YF
  ) {
    return 'PURE';
  }

  // 4. CPU · CPU 恋人 — Y 维至顶 + Q28（"TA 说有事想跟你说"）+ Q29（"脑补对方不爱我"）皆选 A
  //    即整体焦虑至顶且脑补题全命中——最典型的 CPU 过热画像。
  if (
    scores.YF >= TOP_THRESHOLD.YF &&
    answers[28] === A &&
    answers[29] === A
  ) {
    return 'CPU';
  }

  // 5. CHAOS · 已读乱回 — 显性 F 或 L + 同一维度内答案方差大
  //    "方差大"的近似：某一维度下同时有 ≥ 2 道选 A 和 ≥ 2 道选 C（自相攻伐）。
  //    限制在"显性 F 或 L"场景是因为这是"看似佛但答得颠"的反差感核心。
  const surfaceFOrL = scores.YF < 0 || scores.NL < 0;
  if (surfaceFOrL) {
    const hasVariance = (['GD', 'ZR', 'NL', 'YF'] as const).some((dim) => {
      let aCount = 0;
      let cCount = 0;
      for (const q of questions) {
        if (q.dimension !== dim) continue;
        if (q.tag === '彩蛋') continue;
        const idx = answers[q.id];
        if (idx === A) aCount++;
        else if (idx === C) cCount++;
      }
      return aCount >= 2 && cCount >= 2;
    });
    if (hasVariance) return 'CHAOS';
  }

  // 6. E-DOG · 赛博舔狗 — |scores.NL| ≤ 1（N/L 几近平票）+ Q5、Q8 皆 A（主动狂发消息 / 首约后主动）
  //    "N/L 持平但答题时又是主动联络派"正是线上狂/线下哑的不对称：亲密维度上不黏，但在主动维度的
  //    具体场景里又猛。与 GRNF 舔狗（N 维明显黏）形成对比。
  if (
    Math.abs(scores.NL) <= 1 &&
    answers[5] === A &&
    answers[8] === A
  ) {
    return 'E-DOG';
  }

  // 7. BENCH · 备胎之王 — 前置 ambiguous（暧昧中）+ 显性 GRLF（外表正常人）+ Q21 A（"怕对方觉得我烦"）+ Q27 A（"点赞狂查"）
  //    核心画像：看起来是最稳的 SANE，骨子里却是 Y/N 方向上的隐性焦虑——典型的"伪正常人 + 鱼塘钉子户"。
  if (
    status === 'ambiguous' &&
    scores.GD > 0 &&
    scores.ZR < 0 &&
    scores.NL < 0 &&
    scores.YF < 0 &&
    answers[21] === A &&
    answers[27] === A
  ) {
    return 'BENCH';
  }

  // 8. ALL · 我全都要 — ≥ 2 维平票，作为兜底在 getResult 末尾处理，不在此返回。
  return null;
}

/**
 * 计算解锁的隐藏叠加标签。
 * @param retreatCount v0.3 · 答题过程中的改答次数，供「退退退」触发判定。非 quiz 入口（如
 *                     分享链接解码）传 0 即可，对应标签不会解锁。
 */
export function detectHiddenTitles(
  answers: Record<number, number>,
  scores: Scores,
  retreatCount = 0,
): HiddenTitle[] {
  const unlocked: HiddenTitle[] = [];
  const A = 0;
  const C = 2;

  // ① 撤回大师：彩蛋题必须选 A（hidden=2），B（hidden=1）只是预警不解锁。
  //    过去 >= 1 的阈值会让大多数人直接拿到"大师"称号，语气不匹配。
  if (scores.hidden >= 2) {
    unlocked.push(hiddenTitles.retractMaster);
  }

  // ② 夜谈冠军：Q12 / Q13 / Q29 至少两题选极端 Z 或 Y（即 A 选项）
  const nightTalkHits = [12, 13, 29].filter((id) => answers[id] === A).length;
  if (nightTalkHits >= 2) {
    unlocked.push(hiddenTitles.nightTalkChamp);
  }

  // ③ 朋友圈考古学家：Q26 + Q27 都选 A
  if (answers[26] === A && answers[27] === A) {
    unlocked.push(hiddenTitles.momentsArchaeologist);
  }

  // 前置题决定后面几条标签的触发上下文
  const status = getRelationshipStatus(answers);

  // ④ 薛定谔的前任：必须前置题选"crush"（单身但心里藏着某个人），再叠加临别爆发 + 脑补被抛弃两条情绪极端。
  //    限制 status 是为了让标签名真正"名副其实"——只有心里确实藏着人的选手才可能解锁。
  if (status === 'crush' && answers[14] === A && answers[28] === A) {
    unlocked.push(hiddenTitles.schrodingerEx);
  }

  // ⑤ 电子乙方：Q2 = C（对方定约会地点）, Q3 = A（先低头道歉）, Q5 = A（主动追加消息）。
  //    Q2 在 GD 维度上是 -2（被动），Q3 / Q5 是 +2（主动），表面看同一维度上自相矛盾——
  //    这其实是乙方画像的核心：没有决策权却要承担全部的情绪劳动。故意不改成同向。
  if (answers[2] === C && answers[3] === A && answers[5] === A) {
    unlocked.push(hiddenTitles.electronicVendor);
  }

  // ⑥ 人形 ATM：Q33 = A（钱基本都我出）或 Q34 = A（凌晨情绪客服秒回）任一即解锁。
  //    两题合并为同一条标签，不做 Pro 升级——一个标签已经足够刻画"被提款"这件事。
  if (answers[33] === A || answers[34] === A) {
    unlocked.push(hiddenTitles.humanATM);
  }

  if (status === 'solo') {
    let extremeCount = 0;
    for (const q of questions) {
      if (q.dimension === 'META') continue;
      if (q.tag === '彩蛋') continue;
      const idx = answers[q.id];
      if (idx === A || idx === C) extremeCount++;
    }
    if (extremeCount >= 12) {
      unlocked.push(hiddenTitles.daydreamer);
    }
  }

  // ⑧ 典中典（v0.3）：四维皆至顶（任一方向压到 ≥ 87.5%）——与 MAD 隐藏人格不同，
  //    PEAK 只看"比分悬殊"，不限具体方向；因此 MAD 必然同时解锁 PEAK（MAD ⊂ PEAK）。
  if (
    Math.abs(scores.GD) >= TOP_THRESHOLD.GD &&
    Math.abs(scores.ZR) >= TOP_THRESHOLD.ZR &&
    Math.abs(scores.NL) >= TOP_THRESHOLD.NL &&
    Math.abs(scores.YF) >= TOP_THRESHOLD.YF
  ) {
    unlocked.push(hiddenTitles.peak);
  }

  // ⑨ 普信选手（v0.3）：显性 GRLF + Q24/Q27/Q30 全选 C（对异性异动全无波澜）
  //    只在"正常人外形"之上叠加过度淡定，才构成"普通而自信"的反差；不是所有 F 满都算普信。
  const isGRLF = scores.GD > 0 && scores.ZR < 0 && scores.NL < 0 && scores.YF < 0;
  if (isGRLF && answers[24] === C && answers[27] === C && answers[30] === C) {
    unlocked.push(hiddenTitles.overconfident);
  }

  // ⑩ 退退退（v0.3）：答题过程中改答 ≥ 3 次。
  //    quiz 页在用户把一道已答题的答案改掉时递增一个 signal，提交时通过 getResult 的
  //    retreatCount 参数传进来。分享链接没有这份 meta，缺省 0 → 观众看不到此标签。
  if (retreatCount >= 3) {
    unlocked.push(hiddenTitles.retreatClub);
  }

  return unlocked;
}

/**
 * 计算结果。
 * @param answers 题目答案（id → optionIdx）
 * @param retreatCount v0.3 · 答题过程中的"改答次数"，由前端 quiz 页累计后传入。
 *                     用于触发「退退退」隐藏标签，≥3 次即解锁。分享链接解码出的答案没有这个
 *                     数据，缺省为 0——即分享者的"退退退"标签不会被观众看到，这是故意的。
 */
export function getResult(
  answers: Record<number, number>,
  retreatCount = 0,
): Result {
  const scores = calculateScores(answers);
  const status = getRelationshipStatus(answers);

  // 找出平票的维度
  const tied: Array<'GD' | 'ZR' | 'NL' | 'YF'> = [];
  if (scores.GD === 0) tied.push('GD');
  if (scores.ZR === 0) tied.push('ZR');
  if (scores.NL === 0) tied.push('NL');
  if (scores.YF === 0) tied.push('YF');

  // 平票 (== 0) 时默认归入 "废方向"：D / Z / N / Y。
  // 统一写成 "严格比较 ? 另一方向 : 废方向"，else 分支一眼看出默认归属。
  // 注意 GD 的废方向在负向（D），其余三维的废方向在正向（Z/N/Y），所以运算符并不一致——不是笔误。
  const g = scores.GD > 0 ? 'G' : 'D';
  const z = scores.ZR < 0 ? 'R' : 'Z';
  const n = scores.NL < 0 ? 'L' : 'N';
  const y = scores.YF < 0 ? 'F' : 'Y';
  const closestCode = g + z + n + y;
  const closestPersonality = personalities[closestCode];

  // v0.3 · 先按 DRAFT §5·附 的优先级检查隐藏人格，命中则直接覆盖 code。
  // 未命中再回落到 ALL（≥2 维平票兜底）或 16 格判定。
  const hiddenCode = detectHiddenPersonality(answers, scores, status);
  const isAllTied = tied.length >= 2;

  let code: string;
  let personality: typeof personalities[string];
  if (hiddenCode) {
    code = hiddenCode;
    personality = personalities[hiddenCode];
  } else if (isAllTied) {
    code = 'ALL';
    personality = personalities.ALL;
  } else {
    code = closestCode;
    personality = closestPersonality;
  }

  // isAll 专指"未命中 specific hidden 但 ≥2 维平票"的兜底情形；isHidden 涵盖所有隐藏人格。
  const isAll = !hiddenCode && isAllTied;
  const isHidden = hiddenCode !== null || isAllTied;

  // v0.3 · 单维平票不再外显 `*`，直接按默认废方向硬归类。
  // displayCode 仍保留为字段，但此后与 code 完全等价（给 ShareImageModal 等复用）。
  const displayCode = code;

  const unlockedHiddenTitles = detectHiddenTitles(answers, scores, retreatCount);
  const hasHiddenTitle = unlockedHiddenTitles.length > 0;

  // 维度条形数据
  const dimensionLabels = [
    {
      dim: '主动性',
      labelA: '冲 Go',
      labelB: '蹲 Dwell',
      valueA: Math.max(0, scores.GD) / DIM_MAX.GD * 100,
      valueB: Math.max(0, -scores.GD) / DIM_MAX.GD * 100,
    },
    {
      dim: '情绪表达',
      labelA: '炸 Zha',
      labelB: '忍 Ren',
      valueA: Math.max(0, scores.ZR) / DIM_MAX.ZR * 100,
      valueB: Math.max(0, -scores.ZR) / DIM_MAX.ZR * 100,
    },
    {
      dim: '亲密需求',
      labelA: '黏 Nian',
      labelB: '离 Li',
      valueA: Math.max(0, scores.NL) / DIM_MAX.NL * 100,
      valueB: Math.max(0, -scores.NL) / DIM_MAX.NL * 100,
    },
    {
      dim: '安全感',
      labelA: '疑 Yi',
      labelB: '佛 Fo',
      valueA: Math.max(0, scores.YF) / DIM_MAX.YF * 100,
      valueB: Math.max(0, -scores.YF) / DIM_MAX.YF * 100,
    },
  ];

  return {
    code,
    displayCode,
    personality,
    hasHiddenTitle,
    unlockedHiddenTitles,
    isAll,
    isHidden,
    closestCode,
    closestPersonality,
    tiedDimensions: tied,
    status,
    scores,
    dimensionLabels,
  };
}

/**
 * v1 share-link 专用的冻结版结果计算入口。
 * 供 pages/result 在 decodeAnswers 返回 version === 1 时调用。
 * 语义与 v0.3 期间的 `getResult` 严格一致——不要在此添加新 runtime 行为。
 */
export const getLegacyResultV1 = getResult;
export type LegacyResultV1 = Result;
export type LegacyScoresV1 = Scores;
