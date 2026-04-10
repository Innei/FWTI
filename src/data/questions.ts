/**
 * FWTI v0.4 · 结构化题库（主干 + 四状态扩展 + follow-up）
 *
 * ID 约定（append-only）：
 *   - Q1-Q30：v0.3 遗留主干题位，v0.4 精简后仅保留 20 题（见下方 trunk）；
 *     未保留的旧 id（3,4,7,11,14,17,19,22,25,28）不得回收，避免破坏 v1 legacy 解码。
 *   - Q31：共享彩蛋（撤回大师），主干段内，四状态通用。
 *   - Q32：META 前置题（不入 trunk 数组，独立 export）。
 *   - Q33：ATM 经济型彩蛋，迁入 extensions.dating。
 *   - Q34：ATM 情绪客服型彩蛋，迁入 extensions.crush。
 *   - Q35：v0.4 新增 solo 彩蛋（VOID 证据题）。
 *   - Q36-Q43：extensions.dating 8 新题（GD×2 ZR×2 NL×2 YF×2）。
 *   - Q44-Q51：extensions.ambiguous 8 新题（GD×3 ZR×2 NL×2 YF×1; Q49=BAD_NEWS_PANIC）。
 *   - Q52-Q59：extensions.crush 8 新题（GD×1 ZR×2 NL×2 YF×3; Q57=FAREWELL_BLAME crush 版）。
 *   - Q60-Q67：extensions.solo 8 新题（GD×3 ZR×1 NL×2 YF×2）。
 *   - Q68-Q77：follow-up 子题，绑定到具体父题 + 选项。
 *
 * 评分在 scoring.ts 中按 `option.score / 2` 单题归一（[-1,+1]），再按维度路径均值取 ratio。
 * 3 档：A=+2 / B=0 / C=-2；5 档：A=+2 / B=+1 / C=0 / D=-1 / E=-2。
 * `tag === '彩蛋'` 的题（Q31, Q33, Q34, Q35）不参与任何维度均值，只用于：
 *   - `REVOKE_RETRY` hidden 纠结值通道（Q31）
 *   - ATM 标签（Q33 / Q34）
 *   - VOID 证据（Q35，通过 polarityOf(SEMANTIC.OFFLINE_RELIEF) 访问）
 */

export type Scale = 3 | 4 | 5 | 6;
export type QuestionDimension = 'GD' | 'ZR' | 'NL' | 'YF' | 'META';
export type StatusKey = 'dating' | 'ambiguous' | 'crush' | 'solo';

export type QuestionVariant = {
  text?: string;
  options?: (string | null)[];
};

export type ScoringDimension = Exclude<QuestionDimension, 'META'>;

/**
 * 次要维度贡献：某些"分支类"选项（如"我不吵架"的 follow-up）在主维度之外
 * 亦应向另一维度投一票。scoring 会将 secondary.score 除以 2 后累加到 target dim。
 * 仅用于 follow-up 级别的细分，非必要勿加——它会同时贡献该 dim 的分母。
 */
export interface OptionSecondary {
  dimension: ScoringDimension;
  score: number;
}

export interface Option {
  label: string;
  text: string;
  score: number;
  hidden?: number;
  meta?: StatusKey;
  secondary?: OptionSecondary;
}

export interface Question {
  id: number;
  dimension: QuestionDimension;
  scale: Scale;
  tag?: '前置' | '彩蛋' | '补充题';
  text: string;
  options: Option[];
  /** 基于 META 的题干 / 选项替换。主干题 v0.4 默认不带 variants（已 去语境化）。 */
  variants?: Partial<Record<StatusKey, QuestionVariant>>;
}

/** 根据当前恋爱状态返回该题应当显示的题干。 */
export function resolveQuestionText(q: Question, status: StatusKey | null): string {
  if (!status || !q.variants) return q.text;
  return q.variants[status]?.text ?? q.text;
}

/** 根据当前恋爱状态返回某个选项应当显示的文案。 */
export function resolveOptionText(
  q: Question,
  optionIdx: number,
  status: StatusKey | null,
): string {
  const fallback = q.options[optionIdx]?.text ?? '';
  if (!status || !q.variants) return fallback;
  const v = q.variants[status];
  if (!v?.options) return fallback;
  return v.options[optionIdx] ?? fallback;
}

// ═══════════════════════════════════════════════════════════════════
// §〇 · META 前置题（id=32，独立于 trunk）
// ═══════════════════════════════════════════════════════════════════

export const metaQuestion: Question = {
  id: 32,
  dimension: 'META',
  scale: 4,
  tag: '前置',
  text: '开始之前——你目前的恋爱状态是？',
  options: [
    { label: 'A', text: '有对象 / 正在恋爱', score: 0, meta: 'dating' },
    { label: 'B', text: '暧昧中 / 有心动的 TA', score: 0, meta: 'ambiguous' },
    { label: 'C', text: '单身，但心里藏着某个人 / 念念不忘的历任', score: 0, meta: 'crush' },
    { label: 'D', text: '纯单身，古生物级别的自由人', score: 0, meta: 'solo' },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// §一 · 共享主干（20 维度题 + 共用彩蛋 Q31）· 四状态通用
// ═══════════════════════════════════════════════════════════════════

/** 主干 · G/D 主动性（5 题）· ids: 1, 2, 5, 6, 8 */
const trunkGD: Question[] = [
  {
    id: 1,
    dimension: 'GD',
    scale: 3,
    text: '你暗恋一个人时，你最可能怎么做？',
    options: [
      { label: 'A', text: '创造各种"偶遇"，拼命找话题聊', score: 2 },
      { label: 'B', text: '默默关注 TA 的朋友圈，偶尔点个赞', score: 0 },
      { label: 'C', text: '什么都不做，在心里跟 TA 谈了三年恋爱', score: -2 },
    ],
  },
  {
    id: 2,
    dimension: 'GD',
    scale: 3,
    text: '和 TA 约见面，地点谁来定？',
    options: [
      { label: 'A', text: '当然是我来安排，攻略都做好了', score: 2 },
      { label: 'B', text: '谁有想法谁来，都行', score: 0 },
      { label: 'C', text: 'TA 定吧，我"随便"和"都行"二选一', score: -2 },
    ],
  },
  {
    id: 5,
    dimension: 'GD',
    scale: 5,
    text: '你发消息给 TA，对方 2 小时没回，你的操作是？',
    options: [
      { label: 'A', text: '再发一条，或者直接打电话过去', score: 2 },
      { label: 'B', text: '半小时后补一条，装"忽然想起来"的样子', score: 1 },
      { label: 'C', text: '放下手机做别的，偶尔瞄一眼', score: 0 },
      { label: 'D', text: '不补发，但脑子里给 TA 写了十七条草稿', score: -1 },
      { label: 'E', text: '算了，TA 回不回都无所谓（其实有所谓）', score: -2 },
    ],
  },
  {
    id: 6,
    dimension: 'GD',
    scale: 3,
    text: '恋爱中你觉得"主动"这件事——',
    options: [
      { label: 'A', text: '喜欢就要冲，不寒碜', score: 2 },
      { label: 'B', text: '最好双向奔赴，谁都别太累', score: 0 },
      { label: 'C', text: '对方追我比较好，我负责被爱就行', score: -2 },
    ],
  },
  {
    id: 8,
    dimension: 'GD',
    scale: 3,
    text: '第一次见面 / 约会结束后，你会主动发消息说"今天很开心"吗？',
    options: [
      { label: 'A', text: '会！说不定还附带下次约会邀请', score: 2 },
      { label: 'B', text: '看对方反应，TA 发我就回', score: 0 },
      { label: 'C', text: '不会，万一显得我太上头呢', score: -2 },
    ],
  },
];

/** 主干 · Z/R 情绪表达（5 题）· ids: 9, 10, 12, 13, 15 */
const trunkZR: Question[] = [
  {
    // v0.4 · 改为正向情绪表达测点。负向情绪另有 Q10/Q12/Q13/Q15 覆盖。
    // F 选项为分支：触发 follow-up Q78 细分"真佛 / 压抑 / 不投入"。
    id: 9,
    dimension: 'ZR',
    scale: 6,
    text: 'TA 做了件让你特别上头的事（记住你随口提过的喜好 / 走心小礼 / 突然一句情话），你的第一反应是？',
    options: [
      { label: 'A', text: '立刻尖叫截屏发闺蜜，当场化身磕 CP 本 CP', score: 2 },
      { label: 'B', text: '嘴上装镇定，心里 BGM 已经循环到第 N 轮', score: 1 },
      { label: 'C', text: '开心地道谢，表达适度', score: 0 },
      { label: 'D', text: '表面淡淡"嗯，谢谢"，回家偷偷截屏存三层文件夹', score: -1 },
      { label: 'E', text: '面无表情说"哦，挺好"，内心震天响但一个字也漏不出去', score: -2 },
      { label: 'F', text: '我基本起不了波澜，这种事对我触动不大', score: 0 },
    ],
  },
  {
    // v0.4 · F 选项为分支：触发 follow-up Q79 细分"真佛 / 压抑 / 不投入"。
    id: 10,
    dimension: 'ZR',
    scale: 6,
    text: '你们因为小事吵架了，你的吵架风格是？',
    options: [
      { label: 'A', text: '新账旧账 PPT 式陈列，配引用配时间线，论文答辩都没我吵架有结构', score: 2 },
      { label: 'B', text: '声音不大句句扎心，金句输出让 TA 自我怀疑到天亮', score: 1 },
      { label: 'C', text: '就事论事，吵完即散，不延长不续费', score: 0 },
      { label: 'D', text: '三连"行吧""随你""你说得对"，空气肉眼可见降温', score: -1 },
      { label: 'E', text: '嘴上拉闸，眼神游离，任 TA 自演整场独角戏', score: -2 },
      { label: 'F', text: '我不吵架，心平气和，TA 发火我当新闻听', score: 0 },
    ],
  },
  {
    id: 12,
    dimension: 'ZR',
    scale: 3,
    text: '在恋爱 / 暧昧里受了委屈，你通常会？',
    options: [
      { label: 'A', text: '哭 / 发脾气 / 发朋友圈阴阳怪气', score: 2 },
      { label: 'B', text: '找朋友倾诉一下就好了', score: 0 },
      { label: 'C', text: '自己消化，谁也不告诉，假装没事', score: -2 },
    ],
  },
  {
    id: 13,
    dimension: 'ZR',
    scale: 3,
    text: '你有多久没在 TA 面前哭过了？（可回忆历任或暗恋场景）',
    options: [
      { label: 'A', text: '昨天就哭了，我的眼泪不值钱', score: 2 },
      { label: 'B', text: '偶尔会，看情况', score: 0 },
      { label: 'C', text: '很久了 / 从来没有，在 TA 面前哭会显得我很弱', score: -2 },
    ],
  },
  {
    id: 15,
    dimension: 'ZR',
    scale: 3,
    text: 'TA 当着朋友的面说了让你没面子的话，你会？',
    options: [
      { label: 'A', text: '当场怼回去，面子比天大', score: 2 },
      { label: 'B', text: '当时忍住，回家关起门来算账', score: 0 },
      { label: 'C', text: '吞了，可能 TA 是无心的吧（但我记住了）', score: -2 },
    ],
  },
];

/** 主干 · N/L 亲密需求（5 题）· ids: 16, 18, 20, 21, 23 */
const trunkNL: Question[] = [
  {
    id: 16,
    dimension: 'NL',
    scale: 5,
    text: '你理想中的聊天频率是？',
    options: [
      { label: 'A', text: '从早安到晚安，中间不断档', score: 2 },
      { label: 'B', text: '一天几轮，空了就聊，不用时刻在线', score: 1 },
      { label: 'C', text: '每天一次固定时间聊一聊', score: 0 },
      { label: 'D', text: '有事说事，没事各忙各的', score: -1 },
      { label: 'E', text: '三天不回消息是正常状态', score: -2 },
    ],
  },
  {
    id: 18,
    dimension: 'NL',
    scale: 3,
    text: '你的理想周末是？',
    options: [
      { label: 'A', text: '和 TA 从早腻到晚，做什么都行，只要在一起', score: 2 },
      { label: 'B', text: '一起待半天，各自安排半天', score: 0 },
      { label: 'C', text: '给我一整个下午独处，否则我会枯萎', score: -2 },
    ],
  },
  {
    id: 20,
    dimension: 'NL',
    scale: 5,
    text: 'TA 出差 / 离开你一个礼拜，你会？',
    options: [
      { label: 'A', text: '天天视频，度日如年，数着秒等 TA 回来', score: 2 },
      { label: 'B', text: '每晚一通电话，白天高频文字', score: 1 },
      { label: 'C', text: '每天晚上通个电话就好', score: 0 },
      { label: 'D', text: '隔两三天联系一次，够了', score: -1 },
      { label: 'E', text: '终于可以一个人看剧打游戏吃泡面了', score: -2 },
    ],
  },
  {
    id: 21,
    dimension: 'NL',
    scale: 3,
    text: '恋爱中你最怕的是？',
    options: [
      { label: 'A', text: '对方不够在意我 / 对方觉得我烦', score: 2 },
      { label: 'B', text: '两个人之间没有火花了', score: 0 },
      { label: 'C', text: '失去自我和个人空间', score: -2 },
    ],
  },
  {
    id: 23,
    dimension: 'NL',
    scale: 5,
    text: '你更喜欢哪种恋爱状态？',
    options: [
      { label: 'A', text: '无时无刻不在一起的"连体婴儿"模式', score: 2 },
      { label: 'B', text: '绝大部分时间一起，偶尔独处', score: 1 },
      { label: 'C', text: '亲密有间，若即若离', score: 0 },
      { label: 'D', text: '各忙各的，周末碰一下', score: -1 },
      { label: 'E', text: '各自精彩，偶尔交汇的"平行线"模式', score: -2 },
    ],
  },
];

/** 主干 · Y/F 安全感（5 题）· ids: 24, 26, 27, 29, 30 */
const trunkYF: Question[] = [
  {
    id: 24,
    dimension: 'YF',
    scale: 3,
    text: 'TA 和异性朋友吃饭，你的内心 OS 是？',
    options: [
      { label: 'A', text: '谁？照片发来看看。在哪吃？吃什么？几点回来？', score: 2 },
      { label: 'B', text: '嗯，别太晚回来就好', score: 0 },
      { label: 'C', text: '哦，知道了。（真的只是"知道了"，没有内心戏）', score: -2 },
    ],
  },
  {
    id: 26,
    dimension: 'YF',
    scale: 5,
    text: '你有没有翻过 TA 的聊天记录 / 朋友圈考古？',
    options: [
      { label: 'A', text: '翻过 / 想翻但没敢 / 正在翻', score: 2 },
      { label: 'B', text: '忍不住点过"显示更早"一次', score: 1 },
      { label: 'C', text: '偶尔无意间看到会在意一下', score: 0 },
      { label: 'D', text: '想过但立刻制止自己', score: -1 },
      { label: 'E', text: '从来没有，也没兴趣', score: -2 },
    ],
  },
  {
    id: 27,
    dimension: 'YF',
    scale: 3,
    text: 'TA 点赞了一个异性的自拍，你会？',
    options: [
      { label: 'A', text: '立刻去看那个人是谁，翻完 TA 最近三年的朋友圈', score: 2 },
      { label: 'B', text: '注意到了，有点酸，但不至于太在意', score: 0 },
      { label: 'C', text: '点赞而已，你不也点吗', score: -2 },
    ],
  },
  {
    id: 29,
    dimension: 'YF',
    scale: 5,
    text: '你有没有脑补过"对方其实不爱我"的场景？',
    options: [
      { label: 'A', text: '经常，而且脑补得很详细，堪比八点档狗血剧', score: 2 },
      { label: 'B', text: '每次 TA 回消息稍慢就浮现一次', score: 1 },
      { label: 'C', text: '偶尔闪过念头，很快就打消了', score: 0 },
      { label: 'D', text: '年度一次，心情差时', score: -1 },
      { label: 'E', text: '没有，想这些太累了', score: -2 },
    ],
  },
  {
    id: 30,
    dimension: 'YF',
    scale: 3,
    text: 'TA 夸别人好看，你的反应是？',
    options: [
      { label: 'A', text: '行，那你找 TA 去啊！（已经在脑中上演被抛弃的完整剧情）', score: 2 },
      { label: 'B', text: '酸一下，然后自我调节', score: 0 },
      { label: 'C', text: '确实好看，我也觉得', score: -2 },
    ],
  },
];

/** 共享彩蛋 · Q31 撤回大师（trunk 段内，不计维度） */
const trunkEgg: Question[] = [
  {
    id: 31,
    dimension: 'GD', // 占位；tag === '彩蛋' 会被 scoring 排除出维度均值
    scale: 3,
    tag: '彩蛋',
    text: '你有没有做过这种事：给 TA 发了一条消息 → 立刻撤回 → 重新编辑 → 再发出去 → 再撤回 → 最后决定不发了？',
    options: [
      { label: 'A', text: '你在监控我？？？', score: 0, hidden: 2 },
      { label: 'B', text: '偶尔吧……', score: 0, hidden: 1 },
      { label: 'C', text: '没有，发了就发了', score: 0, hidden: 0 },
    ],
  },
];

export const trunk: Question[] = [
  ...trunkGD,
  ...trunkZR,
  ...trunkNL,
  ...trunkYF,
  ...trunkEgg,
];

// ═══════════════════════════════════════════════════════════════════
// §二 · 状态扩展段 extensions[status]
// ═══════════════════════════════════════════════════════════════════

/** extensions.dating · 已有对象（8 新题 + Q33 = 9） */
const datingExt: Question[] = [
  {
    id: 36,
    dimension: 'NL',
    scale: 3,
    text: '关于"同居"，你的想法是？',
    options: [
      { label: 'A', text: '越早越好，最好下个月就搬', score: 2 },
      { label: 'B', text: '水到渠成，先稳一段再说', score: 0 },
      { label: 'C', text: '永不，我的卫生间不容 TA 侵犯', score: -2 },
    ],
  },
  {
    id: 37,
    dimension: 'GD',
    scale: 3,
    text: '吵架后，通常谁先开口低头？',
    options: [
      { label: 'A', text: '我。冷战一小时我就受不了', score: 2 },
      { label: 'B', text: '看谁理亏，该谁谁', score: 0 },
      { label: 'C', text: '我能冷到下周', score: -2 },
    ],
  },
  {
    id: 38,
    dimension: 'NL',
    scale: 3,
    text: '逢年过节，你希望怎么过？',
    options: [
      { label: 'A', text: '必须一起，谁也不许加班', score: 2 },
      { label: 'B', text: '有时间一起，没时间视频', score: 0 },
      { label: 'C', text: '各回各家，过节累死了', score: -2 },
    ],
  },
  {
    id: 39,
    dimension: 'GD',
    scale: 3,
    text: '你愿不愿意和 TA 共享主要财务（共同账户 / 大额消费互通）？',
    options: [
      { label: 'A', text: '愿意，钱是共同的', score: 2 },
      { label: 'B', text: '大事商量，小事各付', score: 0 },
      { label: 'C', text: '不愿意，我的账户是我的底线', score: -2 },
    ],
  },
  {
    id: 40,
    dimension: 'YF',
    scale: 3,
    text: '关于"删前任"这件事——',
    options: [
      { label: 'A', text: '必须删，我已经删了三遍', score: 2 },
      { label: 'B', text: '留着没事，但我从来不点开', score: 0 },
      { label: 'C', text: '没必要删，成年人的社交圈没那么窄', score: -2 },
    ],
  },
  {
    id: 41,
    dimension: 'ZR',
    scale: 3,
    text: '公开秀恩爱（朋友圈 / 社交 / 合照当头像）你的态度是？',
    options: [
      { label: 'A', text: '要秀，不秀等于没在一起', score: 2 },
      { label: 'B', text: '偶尔一次，纪念性质', score: 0 },
      { label: 'C', text: '拒绝，我的朋友圈是我的', score: -2 },
    ],
  },
  {
    id: 42,
    dimension: 'ZR',
    scale: 3,
    text: 'TA 忘了纪念日 / 生日 / 第一次一起做过的小仪式，你会？',
    options: [
      { label: 'A', text: '当场兴师问罪："你心里还有没有我？！"', score: 2 },
      { label: 'B', text: '有点失望，找机会委婉提醒', score: 0 },
      { label: 'C', text: '默默记一笔账，不说，但永远不忘', score: -2 },
    ],
  },
  {
    id: 43,
    dimension: 'YF',
    scale: 3,
    text: 'TA 的朋友圈里有一条你不认识的异性留言，你会？',
    options: [
      { label: 'A', text: '立刻打开对方主页，翻完近三年', score: 2 },
      { label: 'B', text: '问一句"这是谁"，得到答案就过', score: 0 },
      { label: 'C', text: '不会注意到，我又不翻 TA 的朋友圈', score: -2 },
    ],
  },
  {
    id: 33,
    dimension: 'GD',
    scale: 3,
    tag: '彩蛋',
    text: '在这段关系里，钱这件事大概是——',
    options: [
      {
        label: 'A',
        text: '基本都是我买单 / 送礼 / 请客，账单到我这就停了；我不太好意思让 TA 花钱',
        score: 0,
      },
      { label: 'B', text: 'AA 或者轮流请，挺公平的', score: 0 },
      { label: 'C', text: '主要是 TA 花，我负责被宠就行', score: 0 },
    ],
  },
];

/** extensions.ambiguous · 暧昧中（8 新题） */
const ambiguousExt: Question[] = [
  {
    id: 44,
    dimension: 'GD',
    scale: 3,
    text: '暧昧到这个阶段，你会主动把关系"捅破"吗？',
    options: [
      { label: 'A', text: '会，我不想错过，时机到了就冲', score: 2 },
      { label: 'B', text: '疯狂暗示，希望 TA 能领悟', score: 0 },
      { label: 'C', text: '表什么白，TA 不说我就把这份爱带进坟墓', score: -2 },
    ],
  },
  {
    id: 45,
    dimension: 'GD',
    scale: 3,
    text: '你和 TA 之间还没有一个明确"称呼"，你觉得——',
    options: [
      { label: 'A', text: '不行，必须今晚就问清楚我们算什么', score: 2 },
      { label: 'B', text: '现在这种暧昧挺美的，顺其自然', score: 0 },
      { label: 'C', text: '称呼什么的不重要，我已经习惯了悬浮', score: -2 },
    ],
  },
  {
    id: 46,
    dimension: 'GD',
    scale: 3,
    text: '你和 TA 约见面，默认节奏是谁发起的？',
    options: [
      { label: 'A', text: '我。每次都是我主动约', score: 2 },
      { label: 'B', text: '轮流，偶尔我偶尔 TA', score: 0 },
      { label: 'C', text: 'TA。我等就行', score: -2 },
    ],
  },
  {
    id: 47,
    dimension: 'ZR',
    scale: 3,
    text: '你怀疑 TA 可能同时也在和别人暧昧，你会——',
    options: [
      { label: 'A', text: '直接问："你是不是还在撩别的人？"', score: 2 },
      { label: 'B', text: '找机会旁敲侧击，看 TA 的反应', score: 0 },
      { label: 'C', text: '憋着不说，暗中加快自己的节奏或悄悄撤退', score: -2 },
    ],
  },
  {
    id: 48,
    dimension: 'ZR',
    scale: 3,
    text: 'TA 当着你的面和异性朋友说说笑笑气氛很好，你心里——',
    options: [
      { label: 'A', text: '当场就挂脸，TA 回头必定能看出来', score: 2 },
      { label: 'B', text: '笑笑，心里小酸一下', score: 0 },
      { label: 'C', text: '不动声色，回家拉黑', score: -2 },
    ],
  },
  {
    id: 49,
    dimension: 'YF',
    scale: 3,
    text: 'TA 突然几天没找你，你脑子里第一个画面是——',
    options: [
      { label: 'A', text: 'TA 找到别人了 / 不喜欢我了 / 我哪里做错了', score: 2 },
      { label: 'B', text: 'TA 最近可能忙吧', score: 0 },
      { label: 'C', text: '正好我也懒得聊', score: -2 },
    ],
  },
  {
    id: 50,
    dimension: 'NL',
    scale: 5,
    text: '一周里你们能聊几天才算"还活着"？',
    options: [
      { label: 'A', text: '每天，中间断一天我就开始焦虑', score: 2 },
      { label: 'B', text: '五到六天，偶尔断档可以', score: 1 },
      { label: 'C', text: '三四天一轮', score: 0 },
      { label: 'D', text: '一周一两次就行', score: -1 },
      { label: 'E', text: '有话再说，没话装死', score: -2 },
    ],
  },
  {
    id: 51,
    dimension: 'NL',
    scale: 3,
    text: '你怎么看"暧昧期各自保持一定距离"这件事？',
    options: [
      { label: 'A', text: '不行，距离会让 TA 跑掉', score: 2 },
      { label: 'B', text: '适度距离挺好', score: 0 },
      { label: 'C', text: '距离是好事，我本来就爱独处', score: -2 },
    ],
  },
];

/** extensions.crush · 心里藏着谁（8 新题 + Q34 = 9） */
const crushExt: Question[] = [
  {
    id: 52,
    dimension: 'GD',
    scale: 5,
    text: '你多久没和心里藏着的那位联系了？',
    options: [
      { label: 'A', text: '今天刚聊，我每天都在想办法碰到 TA', score: 2 },
      { label: 'B', text: '这周聊过一次', score: 1 },
      { label: 'C', text: '这个月偶尔聊', score: 0 },
      { label: 'D', text: '半年以上，但我点赞过', score: -1 },
      { label: 'E', text: '超过一年，拉黑都嫌浪费手速（其实没删）', score: -2 },
    ],
  },
  {
    id: 53,
    dimension: 'YF',
    scale: 5,
    text: '你会经常翻 TA 的社交媒体（朋友圈 / IG / 小红书 / 所有）吗？',
    options: [
      { label: 'A', text: '每天都翻，时间轴倒背如流', score: 2 },
      { label: 'B', text: '隔几天翻一次，确认 TA 还活着', score: 1 },
      { label: 'C', text: '偶尔路过', score: 0 },
      { label: 'D', text: '屏蔽了自己，不敢看', score: -1 },
      { label: 'E', text: '早就取关了', score: -2 },
    ],
  },
  {
    id: 54,
    dimension: 'ZR',
    scale: 3,
    text: 'TA 知道你喜欢 TA 吗？',
    options: [
      { label: 'A', text: '知道，我亲口说过（被拒了 / 没结果）', score: 2 },
      { label: 'B', text: '可能知道一点，我暗示过', score: 0 },
      { label: 'C', text: '完全不知道，这是我一个人的事', score: -2 },
    ],
  },
  {
    id: 55,
    dimension: 'NL',
    scale: 3,
    text: '当你遇到新的心动对象，你的第一个反应是——',
    options: [
      { label: 'A', text: '下意识地拿 TA 对比，觉得新人总差点意思', score: 2 },
      { label: 'B', text: '客观评估，试试看', score: 0 },
      { label: 'C', text: '无所谓谁都行，不过都挺无聊的', score: -2 },
    ],
  },
  {
    id: 56,
    dimension: 'YF',
    scale: 5,
    text: '你梦到 TA 的频率是？',
    options: [
      { label: 'A', text: '每周都能梦到至少一次', score: 2 },
      { label: 'B', text: '偶尔梦到，醒来发呆半小时', score: 1 },
      { label: 'C', text: '偶尔闪过，不清晰', score: 0 },
      { label: 'D', text: '已经很久不做这种梦了', score: -1 },
      { label: 'E', text: '从来没梦过（这说明 TA 已经搬家了）', score: -2 },
    ],
  },
  {
    id: 57,
    dimension: 'YF',
    scale: 3,
    text: '如果 TA 现在有了新的对象，你会——',
    options: [
      { label: 'A', text: '世界坍塌，连朋友圈文案都写好了', score: 2 },
      { label: 'B', text: '难过一阵就过去了', score: 0 },
      { label: 'C', text: '祝福 TA（真心的那种）', score: -2 },
    ],
  },
  {
    id: 58,
    dimension: 'ZR',
    scale: 3,
    text: '深夜情绪低落时，你最想做的事是——',
    options: [
      { label: 'A', text: '给 TA 发一条消息（不管会不会回）', score: 2 },
      { label: 'B', text: '自己扛过去', score: 0 },
      { label: 'C', text: '删 TA 微信（然后又加回来）', score: -2 },
    ],
  },
  {
    id: 59,
    dimension: 'NL',
    scale: 3,
    text: '你心里的"未来"还留着 TA 的位置吗？',
    options: [
      { label: 'A', text: '还留着，我已经在脑补五年后的重逢了', score: 2 },
      { label: 'B', text: '留了一块小角落', score: 0 },
      { label: 'C', text: '已经搬空了', score: -2 },
    ],
  },
  {
    id: 34,
    dimension: 'GD',
    scale: 3,
    tag: '彩蛋',
    text: 'TA 凌晨 2 点突然找你倾诉情绪垃圾 / 跟别人的烂摊子 / 工作崩溃，你的反应是？',
    options: [
      {
        label: 'A',
        text: '秒回，立刻上线，陪到 TA 睡着为止，哪怕我明天 8 点要开会',
        score: 0,
      },
      {
        label: 'B',
        text: '回，但会说"我先睡了，我们明天详细聊"',
        score: 0,
      },
      { label: 'C', text: '静音，明早再说（其实是后天）', score: 0 },
    ],
  },
];

/** extensions.solo · 古生物单身（8 新题 + Q35 = 9） */
const soloExt: Question[] = [
  {
    id: 60,
    dimension: 'GD',
    scale: 5,
    text: '你上一次主动加一个异性微信是？',
    options: [
      { label: 'A', text: '这周就加了', score: 2 },
      { label: 'B', text: '上个月', score: 1 },
      { label: 'C', text: '这半年', score: 0 },
      { label: 'D', text: '一年以上', score: -1 },
      { label: 'E', text: '想不起来（有手机之后就没主动加过）', score: -2 },
    ],
  },
  {
    id: 61,
    dimension: 'GD',
    scale: 5,
    text: '你的交友软件 / 相亲 app 现状是——',
    options: [
      { label: 'A', text: '每天刷，积极滑', score: 2 },
      { label: 'B', text: '装着，偶尔打开', score: 1 },
      { label: 'C', text: '装过，卸了又装，装了又卸', score: 0 },
      { label: 'D', text: '没装过，不想装', score: -1 },
      { label: 'E', text: '装过的人都 del 我了', score: -2 },
    ],
  },
  {
    id: 62,
    dimension: 'GD',
    scale: 3,
    text: '你会主动约异性一起吃饭 / 看电影吗？',
    options: [
      { label: 'A', text: '会，想吃就约，不想单独吃就约', score: 2 },
      { label: 'B', text: '熟人可以，陌生人不行', score: 0 },
      { label: 'C', text: '不会，单独吃饭压力大', score: -2 },
    ],
  },
  {
    id: 63,
    dimension: 'ZR',
    scale: 3,
    text: '亲戚催婚时你的反应是？',
    options: [
      { label: 'A', text: '当场翻脸："您先管好您自己的"', score: 2 },
      { label: 'B', text: '干笑搪塞："在努力，在努力"', score: 0 },
      { label: 'C', text: '面无表情，然后心里默默骂了二十分钟', score: -2 },
    ],
  },
  {
    id: 64,
    dimension: 'NL',
    scale: 3,
    text: '一个人过周末，你的默认安排是？',
    options: [
      { label: 'A', text: '还是想找人出门，独自在家会疯', score: 2 },
      { label: 'B', text: '半天出门半天在家', score: 0 },
      { label: 'C', text: '一个人最舒服，不想被打扰', score: -2 },
    ],
  },
  {
    id: 65,
    dimension: 'NL',
    scale: 3,
    text: '一个人去吃饭 / 看电影 / 旅行这件事，你——',
    options: [
      { label: 'A', text: '做不到，我怕别人看我', score: 2 },
      { label: 'B', text: '看情境，熟悉的地方可以', score: 0 },
      { label: 'C', text: '最爱，最好全程没人认识我', score: -2 },
    ],
  },
  {
    id: 66,
    dimension: 'YF',
    scale: 3,
    text: '刷到前任 / 旧暗恋对象的动态，你会——',
    options: [
      { label: 'A', text: '立刻翻完 TA 最近三个月', score: 2 },
      { label: 'B', text: '看两眼，滑走', score: 0 },
      { label: 'C', text: '屏蔽了 / 不认识这人', score: -2 },
    ],
  },
  {
    id: 67,
    dimension: 'YF',
    scale: 5,
    text: '如果明天突然有人很认真地对你表白，你的第一反应是？',
    options: [
      { label: 'A', text: 'TA 是不是有什么目的？先查一查', score: 2 },
      { label: 'B', text: '感动但脑子立刻盘算各种可能性', score: 1 },
      { label: 'C', text: '先了解一下再说', score: 0 },
      { label: 'D', text: '大概会答应看看吧', score: -1 },
      { label: 'E', text: '嗯，好。开始恋爱', score: -2 },
    ],
  },
  {
    id: 35,
    dimension: 'GD',
    scale: 5,
    tag: '彩蛋',
    text: '你对"长时间不回任何消息 / 不上线"这件事的感觉是？',
    options: [
      { label: 'A', text: '最爽，断联半天我能活过来', score: 2 },
      { label: 'B', text: '挺舒服的，偶尔会这样做', score: 1 },
      { label: 'C', text: '还好，不特别', score: 0 },
      { label: 'D', text: '会焦虑，怕错过什么', score: -1 },
      { label: 'E', text: '必须立刻回，上线晚了 TA 会生气', score: -2 },
    ],
  },
];

export const extensions: Record<StatusKey, Question[]> = {
  dating: datingExt,
  ambiguous: ambiguousExt,
  crush: crushExt,
  solo: soloExt,
};

// ═══════════════════════════════════════════════════════════════════
// §三 · Follow-up 子题（按父题选项触发，递归深度硬上限 2）
// ═══════════════════════════════════════════════════════════════════

/** 每条 follow-up 都是独立的 Question，计入其自身 dimension 的路径均值。 */
const followupQuestions: Question[] = [
  {
    id: 68,
    dimension: 'GD',
    scale: 3,
    tag: '补充题',
    text: '那如果补了之后 TA 3 小时还是没回，你会？',
    options: [
      { label: 'A', text: '直接打电话过去', score: 2 },
      { label: 'B', text: '转去找共同好友问问', score: 0 },
      { label: 'C', text: '装没事，但已经在想是不是 TA 把我删了', score: -2 },
    ],
  },
  {
    id: 69,
    dimension: 'YF',
    scale: 3,
    tag: '补充题',
    text: '你翻到一个你不认识的异性名字怎么办？',
    options: [
      { label: 'A', text: '立刻截图发朋友问', score: 2 },
      { label: 'B', text: '记住名字，继续观察', score: 0 },
      { label: 'C', text: '假装没看见，但睡不着', score: 1 },
    ],
  },
  {
    id: 70,
    dimension: 'NL',
    scale: 3,
    tag: '补充题',
    text: '如果 TA 某天只给你发了三条消息，你会？',
    options: [
      { label: 'A', text: '连发一串问 TA 在干嘛', score: 2 },
      { label: 'B', text: '等 TA 主动再发', score: 0 },
      { label: 'C', text: '心里凉半截，开始自我 PUA', score: 1 },
    ],
  },
  {
    id: 71,
    dimension: 'ZR',
    scale: 3,
    tag: '补充题',
    text: '你会据此直接去对质 TA 吗？',
    options: [
      { label: 'A', text: '会，我忍不住直接问', score: 2 },
      { label: 'B', text: '会，但换成阴阳怪气那种问法', score: 1 },
      { label: 'C', text: '不会，憋着自己消化（然后更崩）', score: -2 },
    ],
  },
  {
    id: 72,
    dimension: 'YF',
    scale: 3,
    tag: '补充题',
    text: '一个月里你大概花 TA 多少会觉得"亏"？',
    options: [
      { label: 'A', text: '只要 TA 少花一点我就觉得亏', score: 2 },
      { label: 'B', text: '看情况，没想过', score: 0 },
      { label: 'C', text: '从没算过，TA 不花我也不亏', score: -2 },
    ],
  },
  {
    id: 73,
    dimension: 'ZR',
    scale: 3,
    tag: '补充题',
    text: 'TA 在别人 / 前任那里受气来找你，你会——',
    options: [
      { label: 'A', text: '边安慰边在心里炸', score: 2 },
      { label: 'B', text: '安慰，完事继续做备用', score: 0 },
      { label: 'C', text: '心里塞一刀，表面说"我都懂"', score: -2 },
    ],
  },
  {
    id: 74,
    dimension: 'YF',
    scale: 3,
    tag: '补充题',
    text: '如果 TA 答"没有"但你不信，你会？',
    options: [
      { label: 'A', text: '开始悄悄查岗', score: 2 },
      { label: 'B', text: '先信，再观察', score: 0 },
      { label: 'C', text: '信了，自我说服', score: -2 },
    ],
  },
  {
    id: 75,
    dimension: 'YF',
    scale: 3,
    tag: '补充题',
    text: '如果 TA 突然把朋友圈设了三天可见，你会？',
    options: [
      { label: 'A', text: '立刻觉得 TA 有事瞒我（虽然可能只是心血来潮）', score: 2 },
      { label: 'B', text: '观察两天再说', score: 0 },
      { label: 'C', text: '松一口气，少刷一点是一点', score: -2 },
    ],
  },
  {
    id: 76,
    dimension: 'NL',
    scale: 3,
    tag: '补充题',
    text: '这件事让你——',
    options: [
      { label: 'A', text: '焦虑，觉得自己快报废了', score: 2 },
      { label: 'B', text: '偶尔想想会叹气，但也没动力改', score: 0 },
      { label: 'C', text: '非常平静，已经接受了', score: -2 },
    ],
  },
  {
    id: 77,
    dimension: 'GD',
    scale: 3,
    tag: '补充题',
    text: '查完之后你最可能的下一步是——',
    options: [
      { label: 'A', text: '查无疑虑后主动约 TA 出来', score: 2 },
      { label: 'B', text: '礼貌婉拒，不想开始任何关系', score: 0 },
      { label: 'C', text: '查着查着就不想回 TA 消息了', score: -2 },
    ],
  },
  {
    // v0.4 · Q9(正向情绪) F 分支 follow-up · 细分真佛 / 压抑 / 不投入
    // B 为"其实心里尖叫只是压着" → 深忍
    // C 兼推 NL 离：对关系投入不足的另一面
    id: 78,
    dimension: 'ZR',
    scale: 3,
    tag: '补充题',
    text: '你方说"起不了波澜"的真相是——',
    options: [
      { label: 'A', text: '真的不吃这套，甜腻对我来说像糖水', score: 0 },
      { label: 'B', text: '其实心里尖叫过，只是习惯把开心都压住', score: -2 },
      {
        label: 'C',
        text: '对这段关系投入不深，TA 做什么都触不到我',
        score: 0,
        secondary: { dimension: 'NL', score: -2 },
      },
    ],
  },
  {
    // v0.4 · Q10(吵架风格) F 分支 follow-up · 同构：真佛 / 压抑 / 不投入
    id: 79,
    dimension: 'ZR',
    scale: 3,
    tag: '补充题',
    text: '你方的"心平气和"实情是——',
    options: [
      { label: 'A', text: '真佛系，对感情里的争执没胜负心，TA 发完也就过了', score: 0 },
      { label: 'B', text: '其实是习惯性先压着，回头一个人复盘到天亮', score: -2 },
      {
        label: 'C',
        text: '不太投入，吵不吵对我没差',
        score: 0,
        secondary: { dimension: 'NL', score: -2 },
      },
    ],
  },
];

const followupById: Record<number, Question> = Object.fromEntries(
  followupQuestions.map((q) => [q.id, q]),
);

/**
 * followups[parentId][optionIdx] = 触发的 follow-up 子题数组。
 * 选项索引：0=A, 1=B, 2=C, 3=D, 4=E。
 *
 * 流程引擎（src/logic/flow.ts）在父题答完后查询本表，将子题插入当前路径。
 * 父题答案变更时，原路径上的 follow-up 及其子 follow-up 一并撤出。
 */
export const followups: Record<number, Record<number, Question[]>> = {
  // Q5（2h 没回）选 A or B → Q68
  5: {
    0: [followupById[68]],
    1: [followupById[68]],
  },
  // Q9（正向情绪）选 F（分支"起不了波澜"）→ Q78
  9: {
    5: [followupById[78]],
  },
  // Q10（吵架风格）选 F（分支"心平气和"）→ Q79
  10: {
    5: [followupById[79]],
  },
  // Q26（翻聊天记录）选 A or B → Q69
  26: {
    0: [followupById[69]],
    1: [followupById[69]],
  },
  // Q16（聊天频率）选 A → Q70
  16: {
    0: [followupById[70]],
  },
  // Q29（脑补不爱我）选 A or B → Q71
  29: {
    0: [followupById[71]],
    1: [followupById[71]],
  },
  // Q33（dating ATM 经济型）选 A → Q72
  33: {
    0: [followupById[72]],
  },
  // Q34（crush 情绪客服）选 A → Q73
  34: {
    0: [followupById[73]],
  },
  // Q47（ambiguous 直接问是否撩别人）选 A → Q74
  47: {
    0: [followupById[74]],
  },
  // Q53（crush 每天翻社交媒体）选 A → Q75
  53: {
    0: [followupById[75]],
  },
  // Q60（solo 一年以上没加异性）选 D or E → Q76
  60: {
    3: [followupById[76]],
    4: [followupById[76]],
  },
  // Q67（solo 被告白先查 TA）选 A → Q77
  67: {
    0: [followupById[77]],
  },
};

// ═══════════════════════════════════════════════════════════════════
// §四 · 派生结构（questions / questionIndex / questionIds）
// ═══════════════════════════════════════════════════════════════════

const allExtensionQuestions: Question[] = [
  ...datingExt,
  ...ambiguousExt,
  ...crushExt,
  ...soloExt,
];

/**
 * 全题扁平数组 · 供 codec 与 legacy 消费者迭代。
 * 顺序：META → trunk → 所有 extensions → 所有 follow-ups。
 * 请勿依赖此数组的顺序——路径渲染请使用 `buildQuestionPath`（src/logic/flow.ts）。
 */
export const questions: Question[] = [
  metaQuestion,
  ...trunk,
  ...allExtensionQuestions,
  ...followupQuestions,
];

/** id → Question 的 O(1) 快表。 */
export const questionIndex: Record<number, Question> = Object.fromEntries(
  questions.map((q) => [q.id, q]),
);

/**
 * Codec 专用的稳定题目顺序：按 id 升序。
 * append-only · 新题追加至末尾，不得插入或重排。
 */
export const questionIds: readonly number[] = questions
  .map((q) => q.id)
  .sort((a, b) => a - b);

// ═══════════════════════════════════════════════════════════════════
// §五 · Dev 不变量断言（DEV 构建开启，PROD 被 tree-shake 掉）
// ═══════════════════════════════════════════════════════════════════

function assertInvariants(): void {
  // 1. 唯一 id
  const seen = new Set<number>();
  for (const q of questions) {
    if (seen.has(q.id)) throw new Error(`[questions invariant] duplicate id ${q.id}`);
    seen.add(q.id);
  }

  // 2. META id === 32
  if (metaQuestion.id !== 32) {
    throw new Error(`[questions invariant] meta id must be 32, got ${metaQuestion.id}`);
  }
  if (metaQuestion.dimension !== 'META') {
    throw new Error('[questions invariant] meta dimension must be META');
  }

  // 3. options.length === scale（META 不参与此校验，scale=4 + 4 options 已天然相符）
  for (const q of questions) {
    if (q.options.length !== q.scale) {
      throw new Error(
        `[questions invariant] Q${q.id} options.length=${q.options.length} != scale=${q.scale}`,
      );
    }
  }

  // 4. scores in {-2,-1,0,1,2}（主维度与次维度同样校验）
  const allowed = new Set([-2, -1, 0, 1, 2]);
  for (const q of questions) {
    for (const opt of q.options) {
      if (!allowed.has(opt.score)) {
        throw new Error(
          `[questions invariant] Q${q.id} option "${opt.label}" invalid score ${opt.score}`,
        );
      }
      if (opt.secondary && !allowed.has(opt.secondary.score)) {
        throw new Error(
          `[questions invariant] Q${q.id} option "${opt.label}" invalid secondary score ${opt.secondary.score}`,
        );
      }
      if (opt.secondary && opt.secondary.dimension === q.dimension) {
        throw new Error(
          `[questions invariant] Q${q.id} option "${opt.label}" secondary dim must differ from primary`,
        );
      }
    }
  }

  // 5. follow-up 深度 <= 2（follow-up 的 follow-up 的 follow-up 禁止）
  // 本实现：follow-up 不能引用另一个 follow-up 作为父题，即 followups 的 key
  // 不能在 followupQuestions 的 id 集合中。
  const followupIds = new Set(followupQuestions.map((q) => q.id));
  for (const parentIdStr of Object.keys(followups)) {
    const parentId = Number(parentIdStr);
    if (followupIds.has(parentId)) {
      // 允许一层嵌套：follow-up 作为另一 follow-up 的父级（深度 2）；
      // 但该嵌套 follow-up 不得再有 follow-up（深度 3 禁止）。
      for (const childOptList of Object.values(followups[parentId])) {
        for (const child of childOptList) {
          if (followups[child.id]) {
            throw new Error(
              `[questions invariant] follow-up depth > 2: Q${child.id} nested under follow-up Q${parentId}`,
            );
          }
        }
      }
    }
  }

  // 6. 每状态每维 ≥ 5 题（trunk 恰好提供 5 每维；extensions 只加不减）
  const dims: QuestionDimension[] = ['GD', 'ZR', 'NL', 'YF'];
  const trunkDimCount = (dim: QuestionDimension) =>
    trunk.filter((q) => q.dimension === dim && q.tag !== '彩蛋').length;
  for (const dim of dims) {
    const n = trunkDimCount(dim);
    if (n < 5) {
      throw new Error(`[questions invariant] trunk dimension ${dim} has only ${n} questions, need ≥ 5`);
    }
  }

  // 7. extensions 内的 id 必须在 questionIndex 中
  for (const status of Object.keys(extensions) as StatusKey[]) {
    for (const q of extensions[status]) {
      if (!questionIndex[q.id]) {
        throw new Error(`[questions invariant] extensions.${status} Q${q.id} missing from registry`);
      }
    }
  }

  // 8. followups 的父题 id 必须存在，且每组子题都在 registry 中
  for (const parentIdStr of Object.keys(followups)) {
    const parentId = Number(parentIdStr);
    if (!questionIndex[parentId]) {
      throw new Error(`[questions invariant] followups parent Q${parentId} missing`);
    }
    for (const optIdxStr of Object.keys(followups[parentId])) {
      const optIdx = Number(optIdxStr);
      const parent = questionIndex[parentId];
      if (optIdx < 0 || optIdx >= parent.options.length) {
        throw new Error(
          `[questions invariant] followups Q${parentId} option idx ${optIdx} out of range`,
        );
      }
      for (const child of followups[parentId][optIdx]) {
        if (!questionIndex[child.id]) {
          throw new Error(
            `[questions invariant] followups Q${parentId}[${optIdx}] -> Q${child.id} missing from registry`,
          );
        }
      }
    }
  }
}

if (import.meta.env.DEV) {
  assertInvariants();
}
