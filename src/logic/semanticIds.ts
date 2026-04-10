/**
 * v0.4 · 语义锚 · trigger 与具体题 id 之间的唯一指向层。
 *
 * 所有 `scoring.ts` / `predicates.ts` 中的触发条件**必须**通过此层访问题 id，
 * 不得在 trigger 判定中出现裸 id 字面量。题库 append-only 扩展时只需修改此处的
 * 映射，scoring 行为自动跟进。
 *
 * 新增 anchor 必须在 DRAFT.md §三「语义锚速查」中同步登记。
 */

export const SEMANTIC = {
  // ── trunk (主干，四状态通用) ────────────────────────────
  /** Q2 · 约会地点谁来定 · 电子乙方触发之一 */
  DATE_LOCATION_DEFER: 2,
  /** Q5 · 2h 没回立即补发 · E-DOG / 电子乙方 */
  TWO_HOUR_NOREPLY: 5,
  /** Q8 · 首次约会后主动发 "今天很开心" · E-DOG */
  POST_DATE_TEXT: 8,
  /** Q24 · TA 和异性朋友吃饭你的内心 OS · 普信选手 */
  CALM_RIVAL: 24,
  /** Q26 · 翻 TA 的聊天记录 / 朋友圈考古 · 朋友圈考古学家 + LIMBO */
  JEALOUSY_EX_STALK: 26,
  /** Q27 · TA 点赞异性自拍你的反应 · 朋友圈考古 + BENCH */
  LIKE_OTHER_GENDER: 27,
  /** Q29 · 脑补 "对方其实不爱我" · CPU */
  IMAGINE_NOT_LOVED: 29,
  /** Q30 · TA 夸别人好看你的反应 · 普信选手 */
  OTHER_PRAISE: 30,
  /** Q31 · 撤回大师彩蛋 · hidden 纠结值通道 */
  REVOKE_RETRY: 31,

  // ── extensions.dating ──────────────────────────────────
  /** Q37 · 吵架后谁先低头 · 电子乙方 */
  COLD_WAR_APOLOGIZE: 37,

  // ── extensions.ambiguous ───────────────────────────────
  /** Q49 · 几天没找你脑子里第一个画面 · 薛定谔的前任 + CPU · BAD_NEWS_PANIC (ambiguous 版) */
  BAD_NEWS_PANIC: 49,

  // ── extensions.crush ───────────────────────────────────
  /** Q57 · 心里藏着的那位现在有了新对象 · 薛定谔的前任 crush 版 · FAREWELL_BLAME */
  FAREWELL_BLAME: 57,

  // ── extensions.solo 彩蛋 ───────────────────────────────
  /** Q35 · 长时间不回消息/不上线的感觉 · VOID 证据 */
  OFFLINE_RELIEF: 35,
} as const;

export type SemanticAnchor = keyof typeof SEMANTIC;
