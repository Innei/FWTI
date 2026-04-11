export type NarrativeStatus =
  | 'dating'
  | 'ambiguous'
  | 'crush'
  | 'solo'
  | null;

export interface NarrativeScores {
  GD: number;
  ZR: number;
  NL: number;
  YF: number;
}

export interface NarrativeQuestion {
  id: number;
  dimension: 'GD' | 'ZR' | 'NL' | 'YF' | 'META';
  tag?: string;
  text: string;
  options: Array<{
    text: string;
    score: number;
  }>;
}

export interface ResultEvidenceCard {
  facet: string;
  questionId: number;
  question: string;
  answer: string;
  note: string;
}

export interface ResultNarrative {
  summary: string;
  evidenceTraits: string[];
  evidenceCards: ResultEvidenceCard[];
  archetypeTraits: string[];
}

export type EvidenceFacet =
  | 'initiative'
  | 'expression'
  | 'closeness'
  | 'security';

type EvidenceTag =
  | 'initiative_push_hard'
  | 'initiative_wait_signal'
  | 'initiative_follow_up_push'
  | 'initiative_follow_up_freeze'
  | 'expression_public_showy'
  | 'expression_public_commemorative'
  | 'expression_public_private'
  | 'expression_outward'
  | 'expression_inward'
  | 'expression_conflict_direct'
  | 'expression_conflict_silent'
  | 'closeness_high_contact'
  | 'closeness_need_space'
  | 'closeness_offline_distress'
  | 'closeness_offline_relief'
  | 'security_checking'
  | 'security_low_checking'
  | 'security_catastrophize'
  | 'security_low_catastrophize';

type MatchTier = 'exact_hit' | 'weak_hit' | 'ratio_fallback';

interface BuildNarrativeParams {
  mode: 'current' | 'legacy';
  answers: Record<number, number>;
  status: NarrativeStatus;
  scores: NarrativeScores;
  path: NarrativeQuestion[];
  questionById: Record<number, NarrativeQuestion>;
  resolveQuestionText: (
    question: NarrativeQuestion,
    status: NarrativeStatus,
  ) => string;
  resolveOptionText: (
    question: NarrativeQuestion,
    optionIdx: number,
    status: NarrativeStatus,
  ) => string;
  archetypeTraits: string[];
  isHidden: boolean;
  isAll: boolean;
}

interface CollectedEvidence {
  facet: EvidenceFacet;
  tag: EvidenceTag;
  questionId: number;
}

interface EvidenceCollectorRule {
  facet: EvidenceFacet;
  tag: EvidenceTag;
  questionId: number;
  optionIndexes: number[];
}

interface NarrativeCopyRule {
  id: string;
  facet: EvidenceFacet;
  tier: Exclude<MatchTier, 'ratio_fallback'>;
  all?: EvidenceTag[];
  any?: EvidenceTag[];
  none?: EvidenceTag[];
  copy: string;
  note: string;
  preferQuestionIds?: number[];
}

interface NarrativeSelection {
  facet: EvidenceFacet;
  tier: MatchTier;
  copy: string;
  note: string;
  primaryQuestionId?: number;
}

type FacetNarrativeState =
  | { facet: EvidenceFacet; state: 'pending' }
  | {
      facet: EvidenceFacet;
      state: 'exact_hit' | 'weak_hit' | 'ratio_fallback';
      selection: NarrativeSelection;
    };

interface NarrativeMachineContext {
  params: BuildNarrativeParams;
  pathIds: Set<number>;
  evidence: CollectedEvidence[];
  facets: Record<EvidenceFacet, FacetNarrativeState>;
}

type NarrativeMachine =
  | { phase: 'idle'; context: NarrativeMachineContext }
  | { phase: 'collecting'; context: NarrativeMachineContext }
  | { phase: 'matching'; context: NarrativeMachineContext }
  | { phase: 'filling'; context: NarrativeMachineContext }
  | { phase: 'finalized'; context: NarrativeMachineContext };

type NarrativeMachineEvent =
  | { type: 'START' }
  | { type: 'COLLECT_EVIDENCE' }
  | { type: 'MATCH_FACETS' }
  | { type: 'FILL_FACETS' };

const FACET_ORDER: EvidenceFacet[] = [
  'initiative',
  'expression',
  'closeness',
  'security',
];

const FACET_DIMENSION: Record<EvidenceFacet, keyof NarrativeScores> = {
  initiative: 'GD',
  expression: 'ZR',
  closeness: 'NL',
  security: 'YF',
};

const PRIORITY_QUESTION_IDS: Record<EvidenceFacet, number[]> = {
  initiative: [68, 5, 8, 37, 44, 45, 46, 52, 60, 61, 62, 77],
  expression: [41, 42, 10, 12, 15, 47, 48, 54, 58, 63, 78, 79],
  closeness: [70, 20, 16, 23, 36, 38, 50, 51, 55, 59, 64, 65, 76],
  security: [26, 27, 29, 43, 49, 53, 57, 67, 24, 30, 40, 66, 69, 74, 75],
};

const EVIDENCE_COLLECTOR_RULES: EvidenceCollectorRule[] = [
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 37, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 44, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 45, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 46, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 52, optionIndexes: [0, 1] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 60, optionIndexes: [0, 1] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 61, optionIndexes: [0, 1] },
  { facet: 'initiative', tag: 'initiative_push_hard', questionId: 62, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 37, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 44, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 45, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 46, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 52, optionIndexes: [3, 4] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 60, optionIndexes: [3, 4] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 61, optionIndexes: [3, 4] },
  { facet: 'initiative', tag: 'initiative_wait_signal', questionId: 62, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_follow_up_push', questionId: 5, optionIndexes: [0, 1] },
  { facet: 'initiative', tag: 'initiative_follow_up_push', questionId: 8, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_follow_up_push', questionId: 68, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_follow_up_push', questionId: 77, optionIndexes: [0] },
  { facet: 'initiative', tag: 'initiative_follow_up_freeze', questionId: 5, optionIndexes: [3, 4] },
  { facet: 'initiative', tag: 'initiative_follow_up_freeze', questionId: 8, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_follow_up_freeze', questionId: 68, optionIndexes: [2] },
  { facet: 'initiative', tag: 'initiative_follow_up_freeze', questionId: 77, optionIndexes: [2] },

  { facet: 'expression', tag: 'expression_public_showy', questionId: 41, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_public_commemorative', questionId: 41, optionIndexes: [1] },
  { facet: 'expression', tag: 'expression_public_private', questionId: 41, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_outward', questionId: 10, optionIndexes: [0, 1] },
  { facet: 'expression', tag: 'expression_outward', questionId: 12, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 15, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 47, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 48, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 54, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 58, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_outward', questionId: 63, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_inward', questionId: 10, optionIndexes: [3, 4] },
  { facet: 'expression', tag: 'expression_inward', questionId: 12, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 15, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 47, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 48, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 54, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 58, optionIndexes: [1, 2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 63, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_inward', questionId: 78, optionIndexes: [1] },
  { facet: 'expression', tag: 'expression_inward', questionId: 79, optionIndexes: [1] },
  { facet: 'expression', tag: 'expression_conflict_direct', questionId: 42, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_conflict_direct', questionId: 10, optionIndexes: [0, 1] },
  { facet: 'expression', tag: 'expression_conflict_direct', questionId: 47, optionIndexes: [0] },
  { facet: 'expression', tag: 'expression_conflict_silent', questionId: 42, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_conflict_silent', questionId: 15, optionIndexes: [2] },
  { facet: 'expression', tag: 'expression_conflict_silent', questionId: 47, optionIndexes: [2] },

  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 16, optionIndexes: [0, 1] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 20, optionIndexes: [0, 1] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 23, optionIndexes: [0, 1] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 36, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 38, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 50, optionIndexes: [0, 1] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 51, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 55, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 59, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 64, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_high_contact', questionId: 65, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 16, optionIndexes: [3, 4] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 20, optionIndexes: [3, 4] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 23, optionIndexes: [3, 4] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 36, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 38, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 50, optionIndexes: [3, 4] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 51, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 55, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 59, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 64, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 65, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 78, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_need_space', questionId: 79, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_offline_distress', questionId: 20, optionIndexes: [0, 1] },
  { facet: 'closeness', tag: 'closeness_offline_distress', questionId: 70, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_offline_distress', questionId: 76, optionIndexes: [0] },
  { facet: 'closeness', tag: 'closeness_offline_relief', questionId: 20, optionIndexes: [3, 4] },
  { facet: 'closeness', tag: 'closeness_offline_relief', questionId: 64, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_offline_relief', questionId: 65, optionIndexes: [2] },
  { facet: 'closeness', tag: 'closeness_offline_relief', questionId: 76, optionIndexes: [2] },

  { facet: 'security', tag: 'security_checking', questionId: 24, optionIndexes: [0] },
  { facet: 'security', tag: 'security_checking', questionId: 26, optionIndexes: [0, 1] },
  { facet: 'security', tag: 'security_checking', questionId: 27, optionIndexes: [0] },
  { facet: 'security', tag: 'security_checking', questionId: 43, optionIndexes: [0] },
  { facet: 'security', tag: 'security_checking', questionId: 53, optionIndexes: [0, 1] },
  { facet: 'security', tag: 'security_checking', questionId: 66, optionIndexes: [0] },
  { facet: 'security', tag: 'security_checking', questionId: 69, optionIndexes: [0, 2] },
  { facet: 'security', tag: 'security_checking', questionId: 74, optionIndexes: [0] },
  { facet: 'security', tag: 'security_checking', questionId: 75, optionIndexes: [0] },
  { facet: 'security', tag: 'security_low_checking', questionId: 26, optionIndexes: [3, 4] },
  { facet: 'security', tag: 'security_low_checking', questionId: 27, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_checking', questionId: 43, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_checking', questionId: 53, optionIndexes: [3, 4] },
  { facet: 'security', tag: 'security_low_checking', questionId: 66, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_checking', questionId: 74, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_checking', questionId: 75, optionIndexes: [2] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 24, optionIndexes: [0] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 29, optionIndexes: [0, 1] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 30, optionIndexes: [0] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 40, optionIndexes: [0] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 49, optionIndexes: [0] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 57, optionIndexes: [0] },
  { facet: 'security', tag: 'security_catastrophize', questionId: 67, optionIndexes: [0, 1] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 24, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 29, optionIndexes: [3, 4] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 30, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 40, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 49, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 57, optionIndexes: [2] },
  { facet: 'security', tag: 'security_low_catastrophize', questionId: 67, optionIndexes: [3, 4] },
];

const NARRATIVE_COPY_RULES: NarrativeCopyRule[] = [
  {
    id: 'initiative-double-push',
    facet: 'initiative',
    tier: 'exact_hit',
    all: ['initiative_push_hard', 'initiative_follow_up_push'],
    copy: '推进关系时，你不只是会先动，而且会在对方停顿时继续补一步，把节奏往前顶。',
    note: '你的答案同时命中了“先主动”和“停顿后继续追近”两类证据。',
    preferQuestionIds: [68, 5, 8, 37, 44, 45, 46],
  },
  {
    id: 'initiative-double-wait',
    facet: 'initiative',
    tier: 'exact_hit',
    all: ['initiative_wait_signal', 'initiative_follow_up_freeze'],
    copy: '推进关系这件事上，你不是单纯慢半拍，而是会在对方一停顿时明显收手，把自己从台前撤回去。',
    note: '你的答案同时命中了“先等信号”和“停顿后继续后撤”两类证据。',
    preferQuestionIds: [68, 5, 8, 37, 44, 45, 46],
  },
  {
    id: 'expression-public-showy',
    facet: 'expression',
    tier: 'exact_hit',
    all: ['expression_public_showy'],
    copy: '公开表达关系这件事上，你偏向把关系放到台前；完全不留痕迹，会让你觉得这段关系不够成立。',
    note: '这里命中的是明确愿意公开关系，而不是只在特殊节点留下痕迹。',
    preferQuestionIds: [41],
  },
  {
    id: 'expression-public-commemorative',
    facet: 'expression',
    tier: 'exact_hit',
    all: ['expression_public_commemorative'],
    copy: '公开表达关系这件事上，你接受留下痕迹，但更偏向纪念节点式官宣，而不是高频营业。',
    note: '这里命中的是“纪念性质”的公开表达，而不是日常高频晒关系。',
    preferQuestionIds: [41],
  },
  {
    id: 'expression-public-private',
    facet: 'expression',
    tier: 'exact_hit',
    all: ['expression_public_private'],
    copy: '公开表达关系这件事上，你更想把关系留在私域，不愿把朋友圈直接变成恋爱公告栏。',
    note: '这道题显示你更在意表达边界，而不是公开热度。',
    preferQuestionIds: [41],
  },
  {
    id: 'expression-direct-conflict',
    facet: 'expression',
    tier: 'exact_hit',
    all: ['expression_outward', 'expression_conflict_direct'],
    copy: '情绪一旦被触发，你通常不会把它悄悄吞掉，而是更倾向让对方当场知道现场已经起波澜了。',
    note: '你的答案同时命中了外放表达和直接摊牌两类证据。',
    preferQuestionIds: [42, 10, 47],
  },
  {
    id: 'expression-silent-conflict',
    facet: 'expression',
    tier: 'exact_hit',
    all: ['expression_inward', 'expression_conflict_silent'],
    copy: '情绪处理上你更偏内收，尤其遇到冲突时，常常先自己记账、自己消化，不急着把话摊平。',
    note: '你的答案同时命中了内收表达和冲突时先憋住两类证据。',
    preferQuestionIds: [42, 15, 47],
  },
  {
    id: 'closeness-high-distress',
    facet: 'closeness',
    tier: 'exact_hit',
    all: ['closeness_high_contact', 'closeness_offline_distress'],
    copy: '亲密节奏上，你需要较高在场感；联系一旦降频，你很难真的把它当成无事发生。',
    note: '你的答案同时命中了高频在场偏好和降频时明显不适两类证据。',
    preferQuestionIds: [20, 70, 16, 23],
  },
  {
    id: 'closeness-space-relief',
    facet: 'closeness',
    tier: 'exact_hit',
    all: ['closeness_need_space', 'closeness_offline_relief'],
    copy: '亲密节奏上，你需要明确的呼吸区；关系存在可以，但并不意味着必须持续高频在线。',
    note: '你的答案同时命中了需要空间和降频反而更轻松两类证据。',
    preferQuestionIds: [20, 64, 65, 76, 16, 23],
  },
  {
    id: 'security-high-stack',
    facet: 'security',
    tier: 'exact_hit',
    all: ['security_checking', 'security_catastrophize'],
    copy: '一旦关系里出现模糊信号，你既会想确认现场，也容易把后果继续往坏处演算，警觉链路启动得很快。',
    note: '你的答案同时命中了“去查”和“往坏处想”两类证据。',
    preferQuestionIds: [26, 27, 29, 49, 53],
  },
  {
    id: 'security-low-stack',
    facet: 'security',
    tier: 'exact_hit',
    all: ['security_low_checking', 'security_low_catastrophize'],
    copy: '面对关系里的模糊信号，你相对能放过去，不会默认每个细节都值得立刻进入侦查和演算模式。',
    note: '你的答案同时命中了低监控和低脑补两类证据。',
    preferQuestionIds: [26, 27, 29, 49, 53],
  },

  {
    id: 'initiative-push',
    facet: 'initiative',
    tier: 'weak_hit',
    any: ['initiative_push_hard', 'initiative_follow_up_push'],
    copy: '推进关系时，你更像会先动手的一方；对方稍微慢一点，你通常也会想办法把话题继续往前推。',
    note: '这类题目里，你交出的证据更接近主动追近，而不是原地等信号。',
    preferQuestionIds: [68, 5, 8, 37, 44, 45, 46],
  },
  {
    id: 'initiative-wait',
    facet: 'initiative',
    tier: 'weak_hit',
    any: ['initiative_wait_signal', 'initiative_follow_up_freeze'],
    copy: '推进关系这件事上，你更习惯先看风向、先等回应，不会轻易把自己整个摆到台前。',
    note: '这类题目更像在证明你会先收着，而不是直接把关系往前顶。',
    preferQuestionIds: [68, 5, 8, 37, 44, 45, 46],
  },
  {
    id: 'expression-outward',
    facet: 'expression',
    tier: 'weak_hit',
    any: ['expression_outward'],
    copy: '情绪一旦被触发，你通常不会完全藏起来；无论是开心还是委屈，你都更倾向让对方感知到。',
    note: '这类题目里的答案更接近外放表达，而不是先压住不说。',
    preferQuestionIds: [42, 10, 12, 15, 47],
  },
  {
    id: 'expression-inward',
    facet: 'expression',
    tier: 'weak_hit',
    any: ['expression_inward'],
    copy: '情绪处理上你更偏向内收；即使心里已经翻江倒海，也常常先把表面维持住。',
    note: '这类题目更像在证明你会把情绪压住，而不是当场摊开。',
    preferQuestionIds: [42, 10, 12, 15, 47],
  },
  {
    id: 'closeness-near',
    facet: 'closeness',
    tier: 'weak_hit',
    any: ['closeness_high_contact', 'closeness_offline_distress'],
    copy: '亲密节奏上，你更偏好高频在场与稳定回应；关系降温时，你不会真的把它当成小事。',
    note: '这类题目显示你更在意关系持续在线，而不是低频放养。',
    preferQuestionIds: [20, 16, 23, 70],
  },
  {
    id: 'closeness-space',
    facet: 'closeness',
    tier: 'weak_hit',
    any: ['closeness_need_space', 'closeness_offline_relief'],
    copy: '亲密节奏上，你需要保留可呼吸的空间；靠近可以，但不代表必须全天候捆绑。',
    note: '这类题目命中的更像是“需要空间”，而不是“必须高频贴近”。',
    preferQuestionIds: [20, 16, 23, 64, 65, 76],
  },
  {
    id: 'security-high',
    facet: 'security',
    tier: 'weak_hit',
    any: ['security_checking', 'security_catastrophize'],
    copy: '只要关系里出现一点模糊信号，你的大脑就比较容易自动开工，把它往风险方向继续演算。',
    note: '这类题目里的选择更接近高警觉处理，而不是把信号当成背景噪音。',
    preferQuestionIds: [26, 27, 29, 49, 53],
  },
  {
    id: 'security-low',
    facet: 'security',
    tier: 'weak_hit',
    any: ['security_low_checking', 'security_low_catastrophize'],
    copy: '面对关系里的模糊信号，你相对能放过去，不会默认每个细节都值得立刻进入侦查模式。',
    note: '这类题目更接近低监控、低脑补，而不是一有异动就全面警戒。',
    preferQuestionIds: [26, 27, 29, 49, 53],
  },
];

function createPendingFacetState(facet: EvidenceFacet): FacetNarrativeState {
  return { facet, state: 'pending' };
}

function createInitialContext(
  params: BuildNarrativeParams,
): NarrativeMachineContext {
  return {
    params,
    pathIds: new Set(params.path.map((question) => question.id)),
    evidence: [],
    facets: {
      initiative: createPendingFacetState('initiative'),
      expression: createPendingFacetState('expression'),
      closeness: createPendingFacetState('closeness'),
      security: createPendingFacetState('security'),
    },
  };
}

function createMachine(params: BuildNarrativeParams): NarrativeMachine {
  return {
    phase: 'idle',
    context: createInitialContext(params),
  };
}

function matchesCollectorRule(
  context: NarrativeMachineContext,
  rule: EvidenceCollectorRule,
): boolean {
  if (!context.pathIds.has(rule.questionId)) return false;
  const answer = context.params.answers[rule.questionId];
  return answer !== undefined && rule.optionIndexes.includes(answer);
}

function collectEvidence(context: NarrativeMachineContext): CollectedEvidence[] {
  return EVIDENCE_COLLECTOR_RULES
    .filter((rule) => matchesCollectorRule(context, rule))
    .map((rule) => ({
      facet: rule.facet,
      tag: rule.tag,
      questionId: rule.questionId,
    }));
}

function groupEvidenceByFacet(
  evidence: CollectedEvidence[],
  facet: EvidenceFacet,
): CollectedEvidence[] {
  return evidence.filter((entry) => entry.facet === facet);
}

function hasTag(entries: CollectedEvidence[], tag: EvidenceTag): boolean {
  return entries.some((entry) => entry.tag === tag);
}

function matchesCopyRule(
  entries: CollectedEvidence[],
  rule: NarrativeCopyRule,
): boolean {
  if (rule.all && !rule.all.every((tag) => hasTag(entries, tag))) return false;
  if (rule.any && !rule.any.some((tag) => hasTag(entries, tag))) return false;
  if (rule.none && rule.none.some((tag) => hasTag(entries, tag))) return false;
  return true;
}

function findPrimaryQuestionId(
  entries: CollectedEvidence[],
  rule: NarrativeCopyRule,
): number | undefined {
  if (rule.preferQuestionIds) {
    for (const id of rule.preferQuestionIds) {
      if (entries.some((entry) => entry.questionId === id)) return id;
    }
  }
  return entries[0]?.questionId;
}

function createSelectionFromRule(
  facet: EvidenceFacet,
  rule: NarrativeCopyRule,
  entries: CollectedEvidence[],
): NarrativeSelection {
  return {
    facet,
    tier: rule.tier,
    copy: rule.copy,
    note: rule.note,
    primaryQuestionId: findPrimaryQuestionId(entries, rule),
  };
}

function buildFallbackSelection(
  context: NarrativeMachineContext,
  facet: EvidenceFacet,
): NarrativeSelection {
  const score = context.params.scores[FACET_DIMENSION[facet]];
  const primaryQuestionId = pickFallbackQuestionId(context, facet);

  if (facet === 'initiative') {
    if (score >= 0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '推进关系这件事上，你明显更像先伸手的人；有空档时，你通常会主动把节奏接回来。',
        note: '这一类没有命中更具体的题目组合，因此回退到主动性整体落点来补足。',
        primaryQuestionId,
      };
    }
    if (score <= -0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '推进关系这件事上，你更习惯先观察、先等待，不会轻易把主动权全部拎到自己手里。',
        note: '这一类没有命中更具体的题目组合，因此回退到主动性整体落点来补足。',
        primaryQuestionId,
      };
    }
    return {
      facet,
      tier: 'ratio_fallback',
      copy: '在主动推进和先看对方反应之间，你这次答得相对居中，更像看场景决定谁先动。',
      note: '这一类没有命中更具体的题目组合，因此回退到主动性中段落点来补足。',
      primaryQuestionId,
    };
  }

  if (facet === 'expression') {
    if (score >= 0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '情绪被触发时，你倾向让对方感知到，不太会把所有不舒服都闷成静音模式。',
        note: '这一类没有命中更具体的题目组合，因此回退到情绪表达整体落点来补足。',
        primaryQuestionId,
      };
    }
    if (score <= -0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '情绪处理上你更偏内收，即使不舒服也常常先自己消化，不会第一时间把话摊到台面。',
        note: '这一类没有命中更具体的题目组合，因此回退到情绪表达整体落点来补足。',
        primaryQuestionId,
      };
    }
    return {
      facet,
      tier: 'ratio_fallback',
      copy: '情绪表达这件事上，你并不固定站在某一端，更多是看事情大小再决定要不要说开。',
      note: '这一类没有命中更具体的题目组合，因此回退到情绪表达中段落点来补足。',
      primaryQuestionId,
    };
  }

  if (facet === 'closeness') {
    if (score >= 0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '亲密节奏上，你偏好高频在场和稳定回应；关系一旦降温，你会比较快察觉到落差。',
        note: '这一类没有命中更具体的题目组合，因此回退到亲密需求整体落点来补足。',
        primaryQuestionId,
      };
    }
    if (score <= -0.6) {
      return {
        facet,
        tier: 'ratio_fallback',
        copy: '亲密节奏上，你需要明确的个人空间；关系存在不等于必须持续高频在线。',
        note: '这一类没有命中更具体的题目组合，因此回退到亲密需求整体落点来补足。',
        primaryQuestionId,
      };
    }
    return {
      facet,
      tier: 'ratio_fallback',
      copy: '亲密和空间这两端，你这次答得较为平衡，既不要求全天候黏连，也不追求彻底抽离。',
      note: '这一类没有命中更具体的题目组合，因此回退到亲密需求中段落点来补足。',
      primaryQuestionId,
    };
  }

  if (score >= 0.6) {
    return {
      facet,
      tier: 'ratio_fallback',
      copy: '遇到关系里的不确定信号时，你的大脑会比较快接管现场，很难把它们当成纯背景噪音。',
      note: '这一类没有命中更具体的题目组合，因此回退到安全感整体落点来补足。',
      primaryQuestionId,
    };
  }
  if (score <= -0.6) {
    return {
      facet,
      tier: 'ratio_fallback',
      copy: '面对关系里的模糊信号，你相对能放过去，不会默认每个细节都意味着风险升级。',
      note: '这一类没有命中更具体的题目组合，因此回退到安全感整体落点来补足。',
      primaryQuestionId,
    };
  }
  return {
    facet,
    tier: 'ratio_fallback',
    copy: '在安全感这件事上，你这次答得偏中段，既会留意风险，也不会把所有细节都放大成警报。',
    note: '这一类没有命中更具体的题目组合，因此回退到安全感中段落点来补足。',
    primaryQuestionId,
  };
}

function pickFallbackQuestionId(
  context: NarrativeMachineContext,
  facet: EvidenceFacet,
): number | undefined {
  for (const id of PRIORITY_QUESTION_IDS[facet]) {
    if (!context.pathIds.has(id)) continue;
    if (context.params.answers[id] !== undefined) return id;
  }

  const dimension = FACET_DIMENSION[facet];
  let best: { id: number; strength: number } | null = null;
  for (const question of context.params.path) {
    if (question.dimension !== dimension || question.tag === '彩蛋') continue;
    const answerIdx = context.params.answers[question.id];
    if (answerIdx === undefined) continue;
    const option = question.options[answerIdx];
    if (!option) continue;
    const strength = Math.abs(option.score);
    if (!best || strength > best.strength) {
      best = { id: question.id, strength };
    }
  }
  return best?.id;
}

function resolveFacetFromRules(
  context: NarrativeMachineContext,
  facet: EvidenceFacet,
): FacetNarrativeState {
  const entries = groupEvidenceByFacet(context.evidence, facet);

  for (const rule of NARRATIVE_COPY_RULES) {
    if (rule.facet !== facet || rule.tier !== 'exact_hit') continue;
    if (!matchesCopyRule(entries, rule)) continue;
    return {
      facet,
      state: 'exact_hit',
      selection: createSelectionFromRule(facet, rule, entries),
    };
  }

  for (const rule of NARRATIVE_COPY_RULES) {
    if (rule.facet !== facet || rule.tier !== 'weak_hit') continue;
    if (!matchesCopyRule(entries, rule)) continue;
    return {
      facet,
      state: 'weak_hit',
      selection: createSelectionFromRule(facet, rule, entries),
    };
  }

  return createPendingFacetState(facet);
}

function transition(
  machine: NarrativeMachine,
  event: NarrativeMachineEvent,
): NarrativeMachine {
  if (machine.phase === 'idle' && event.type === 'START') {
    return { phase: 'collecting', context: machine.context };
  }

  if (machine.phase === 'collecting' && event.type === 'COLLECT_EVIDENCE') {
    return {
      phase: 'matching',
      context: {
        ...machine.context,
        evidence: collectEvidence(machine.context),
      },
    };
  }

  if (machine.phase === 'matching' && event.type === 'MATCH_FACETS') {
    const facets = { ...machine.context.facets };
    for (const facet of FACET_ORDER) {
      facets[facet] = resolveFacetFromRules(machine.context, facet);
    }
    return {
      phase: 'filling',
      context: {
        ...machine.context,
        facets,
      },
    };
  }

  if (machine.phase === 'filling' && event.type === 'FILL_FACETS') {
    const facets = { ...machine.context.facets };
    for (const facet of FACET_ORDER) {
      if (facets[facet].state !== 'pending') continue;
      facets[facet] = {
        facet,
        state: 'ratio_fallback',
        selection: buildFallbackSelection(machine.context, facet),
      };
    }
    return {
      phase: 'finalized',
      context: {
        ...machine.context,
        facets,
      },
    };
  }

  return machine;
}

function runNarrativeMachine(
  params: BuildNarrativeParams,
): Extract<NarrativeMachine, { phase: 'finalized' }> {
  let machine = createMachine(params);
  machine = transition(machine, { type: 'START' });
  machine = transition(machine, { type: 'COLLECT_EVIDENCE' });
  machine = transition(machine, { type: 'MATCH_FACETS' });
  machine = transition(machine, { type: 'FILL_FACETS' });
  if (machine.phase !== 'finalized') {
    throw new Error('[result narrative] machine failed to reach finalized state');
  }
  return machine;
}

function buildEvidenceCard(
  context: NarrativeMachineContext,
  selection: NarrativeSelection,
): ResultEvidenceCard | null {
  const questionId = selection.primaryQuestionId;
  if (questionId === undefined) return null;

  const question = context.params.questionById[questionId];
  if (!question) return null;

  const answerIdx = context.params.answers[questionId];
  if (answerIdx === undefined) return null;

  return {
    facet: selection.facet,
    questionId,
    question: context.params.resolveQuestionText(question, context.params.status),
    answer: context.params.resolveOptionText(
      question,
      answerIdx,
      context.params.status,
    ),
    note: selection.note,
  };
}

function summarizeMatchCounts(
  machine: Extract<NarrativeMachine, { phase: 'finalized' }>,
): { exact: number; weak: number; fallback: number } {
  let exact = 0;
  let weak = 0;
  let fallback = 0;

  for (const facet of FACET_ORDER) {
    const state = machine.context.facets[facet];
    if (state.state === 'exact_hit') exact += 1;
    else if (state.state === 'weak_hit') weak += 1;
    else if (state.state === 'ratio_fallback') fallback += 1;
  }

  return { exact, weak, fallback };
}

function buildSummary(
  params: BuildNarrativeParams,
  counts: { exact: number; weak: number; fallback: number },
): string {
  const leading =
    params.mode === 'legacy'
      ? '以下条目按旧版题库中的已答证据归纳。'
      : params.isAll
        ? '这次结果存在多维打平，因此先由兜底规则归类。'
        : params.isHidden
          ? '这次结果先命中了特殊触发条件。'
          : '以下条目优先依据你这次答题中直接命中的证据规则生成。';

  return `${leading} 本次共命中 ${counts.exact} 条精确规则、${counts.weak} 条宽匹配规则，另有 ${counts.fallback} 条由四维落点兜底补足。`;
}

export function buildResultNarrative(
  params: BuildNarrativeParams,
): ResultNarrative {
  const machine = runNarrativeMachine(params);
  const counts = summarizeMatchCounts(machine);

  const selections = FACET_ORDER.map((facet) => {
    const state = machine.context.facets[facet];
    if (state.state === 'pending') {
      throw new Error(`[result narrative] facet ${facet} unexpectedly left pending`);
    }
    return state.selection;
  });

  const evidenceCards = selections
    .map((selection) => buildEvidenceCard(machine.context, selection))
    .filter((card): card is ResultEvidenceCard => card !== null);

  return {
    summary: buildSummary(params, counts),
    evidenceTraits: selections.map((selection) => selection.copy),
    evidenceCards,
    archetypeTraits: params.archetypeTraits,
  };
}
