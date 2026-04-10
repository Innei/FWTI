export type QuestionDimension = 'GD' | 'ZR' | 'NL' | 'YF' | 'META';

/** 与 RelationshipStatus 对齐；不导入以避免循环依赖。 */
type StatusKey = 'dating' | 'ambiguous' | 'crush' | 'solo';

/**
 * 单题在特定恋爱状态下的文本覆写。
 * - text：整题题干替换
 * - options：按索引覆写选项文案；null 表示该选项沿用默认
 */
export type QuestionVariant = {
  text?: string;
  options?: (string | null)[];
};

export interface Question {
  id: number;
  text: string;
  dimension: QuestionDimension;
  tag?: string; // 补充题 / 彩蛋 / 前置
  options: {
    label: string;
    text: string;
    score: number; // +2 = 极性A, 0 = 中立, -2 = 极性B; 对GD: G=+2, D=-2; 对ZR: Z=+2, R=-2; 对NL: N=+2, L=-2; 对YF: Y=+2, F=-2
    hidden?: number; // 隐藏纠结值
    meta?: string;   // META 题选项携带的语义标签（恋爱中 / 暧昧中 / 心里藏着谁 / 纯单身）
  }[];
  /**
   * 基于 META 前置题（恋爱状态）的题干 / 选项替换。
   * 默认 dating（"已经在关系里"）使用原文；
   * ambiguous / crush / solo 可按需覆写，让不同单身语境下不至于错位。
   */
  variants?: Partial<Record<StatusKey, QuestionVariant>>;
}

/** 根据当前恋爱状态返回该题应当显示的题干。 */
export function resolveQuestionText(
  q: Question,
  status: StatusKey | null,
): string {
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

/**
 * 题库中的第一题（id=32）为 META 前置题：不计入任何维度分数，
 * 仅用于路由题目措辞与触发隐藏"空想家"标签。
 *
 * 隐藏彩蛋题当前有三道：
 *   - id=31：撤回大师纠结值触发器
 *   - id=33：「人形 ATM · 经济型」触发器
 *   - id=34：「人形 ATM · 情绪客服型」触发器
 * 它们都用 tag='彩蛋'，dimension 占位写 'GD' 但实际会被 scoring 的彩蛋分支拦截，
 * 不会进入维度累加。
 *
 * 其余题目中凡是提到"对象"的位置，均替换为"TA"——代表"你在意的那个人"：
 * 有对象即对象，暧昧中即暧昧对象，单身但心里藏着谁即心里的那位，
 * 纯单身则代入假想中的那位。
 */
export const questions: Question[] = [
  // ===== 前置题：恋爱状态（META，不计分）=====
  {
    id: 32,
    dimension: 'META',
    tag: '前置',
    text: '开始之前——你目前的恋爱状态是？',
    options: [
      { label: 'A', text: '有对象 / 正在恋爱', score: 0, meta: 'dating' },
      { label: 'B', text: '暧昧中 / 有心动的 TA', score: 0, meta: 'ambiguous' },
      { label: 'C', text: '单身，但心里藏着某个人 / 念念不忘的历任', score: 0, meta: 'crush' },
      { label: 'D', text: '纯单身，古生物级别的自由人', score: 0, meta: 'solo' },
    ],
  },

  // ===== 维度一：G/D — 主动性（8 题）=====
  {
    id: 1,
    dimension: 'GD',
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
    text: '约会地点谁来定？',
    options: [
      { label: 'A', text: '当然是我来安排，攻略都做好了', score: 2 },
      { label: 'B', text: '谁有想法谁来，都行', score: 0 },
      { label: 'C', text: '你定吧，我"随便"和"都行"二选一', score: -2 },
    ],
  },
  {
    id: 3,
    dimension: 'GD',
    text: '你和 TA 吵架 / 冷战了两天，你会？',
    options: [
      { label: 'A', text: '忍不了了，先低头吧，冷战比吵架还难受', score: 2 },
      { label: 'B', text: '谁先受不了谁先开口，看缘分', score: 0 },
      { label: 'C', text: 'TA 不找我，我能冷到地球毁灭', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '你和暧昧中的 TA 关系突然变僵、两天没说话了，你会？',
      },
      crush: {
        text: '你和心里藏着的那个人突然关系变僵、两天没说话了，你会？',
      },
      solo: {
        text: '想象你正在恋爱，和对象冷战了两天，你会？',
      },
    },
  },
  {
    id: 4,
    dimension: 'GD',
    text: '暧昧到一定阶段了，你会主动表白吗？',
    options: [
      { label: 'A', text: '会，我不想错过，时机到了就冲', score: 2 },
      { label: 'B', text: '疯狂暗示，希望 TA 能领悟', score: 0 },
      { label: 'C', text: '表什么白，TA 不说我就把这份爱带进坟墓', score: -2 },
    ],
    variants: {
      dating: {
        text: '回忆一下你和对象还在暧昧的那会儿，你是主动表白的那一方吗？',
      },
      crush: {
        text: '想象你和心里藏着的那个人发展到暧昧阶段，你会主动表白吗？',
      },
      solo: {
        text: '想象你正在暧昧期，你会主动表白吗？',
      },
    },
  },
  {
    id: 5,
    dimension: 'GD',
    text: '你发消息给 TA，对方 2 小时没回，你的操作是？',
    options: [
      { label: 'A', text: '再发一条，或者直接打电话过去', score: 2 },
      { label: 'B', text: '放下手机做别的，偶尔瞄一眼', score: 0 },
      { label: 'C', text: '算了，TA 回不回都无所谓（其实有所谓）', score: -2 },
    ],
  },
  {
    id: 6,
    dimension: 'GD',
    text: '恋爱中你觉得"主动"这件事——',
    options: [
      { label: 'A', text: '喜欢就要冲，不寒碜', score: 2 },
      { label: 'B', text: '最好双向奔赴，谁都别太累', score: 0 },
      { label: 'C', text: '对方追我比较好，我负责被爱就行', score: -2 },
    ],
  },
  {
    id: 7,
    dimension: 'GD',
    text: '你发现 TA 最近好像有点冷淡了，你会？',
    options: [
      { label: 'A', text: '直接问："你最近怎么了？是不是我哪里做得不好？"', score: 2 },
      { label: 'B', text: '旁敲侧击试探一下，看看什么情况', score: 0 },
      { label: 'C', text: 'TA 冷我就冷回去，看谁先撑不住', score: -2 },
    ],
  },
  {
    id: 8,
    dimension: 'GD',
    text: '第一次见面 / 约会结束后，你会主动发消息说"今天很开心"吗？',
    options: [
      { label: 'A', text: '会！说不定还附带下次约会邀请', score: 2 },
      { label: 'B', text: '看对方反应，TA 发我就回', score: 0 },
      { label: 'C', text: '不会，万一显得我太上头呢', score: -2 },
    ],
  },

  // ===== 维度二：Z/R — 情绪表达（7 题）=====
  {
    id: 9,
    dimension: 'ZR',
    text: 'TA 做了让你不爽的事，你的第一反应是？',
    options: [
      { label: 'A', text: '当场就说出来，我忍不了一秒钟', score: 2 },
      { label: 'B', text: '先消化一下，看严不严重再决定说不说', score: 0 },
      { label: 'C', text: '算了，说了也没用，默默在心里记一笔', score: -2 },
    ],
  },
  {
    id: 10,
    dimension: 'ZR',
    text: '你们因为小事吵架了，你的吵架风格是？',
    options: [
      { label: 'A', text: '声音越来越大，新账旧账一起翻，恨不得写篇论文论证 TA 的过错', score: 2 },
      { label: 'B', text: '就事论事，吵完拉倒', score: 0 },
      { label: 'C', text: '沉默是金，你吵你的，我的嘴是缝上的', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '暧昧中的你们因为小事起了摩擦，你的反应是？',
      },
      crush: {
        text: '想象你和心里藏着的那个人在一起后因为小事吵架，你的吵架风格是？',
      },
      solo: {
        text: '想象你谈恋爱了，和对象因为小事吵架，你的吵架风格是？',
      },
    },
  },
  {
    id: 11,
    dimension: 'ZR',
    text: 'TA 忘了一个对你很重要的日子（生日 / 纪念日 / 你新裙子第一次穿给 TA 看），你会？',
    options: [
      { label: 'A', text: '当场兴师问罪："你心里还有没有我？！"', score: 2 },
      { label: 'B', text: '有点失望，找个机会委婉提醒', score: 0 },
      { label: 'C', text: '默默记了一笔账，不说，但永远不忘', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '暧昧中的 TA 忘了一个对你有意义的日子（约好的电话 / 第一次见面的纪念 / 你特意打扮给 TA 看那天），你会？',
      },
      crush: {
        text: '想象你们在一起了，TA 忘了一个对你很重要的日子（生日 / 纪念日 / 你新裙子第一次穿给 TA 看），你会？',
      },
      solo: {
        text: '想象你恋爱了，对象忘了一个对你很重要的日子（生日 / 纪念日 / 你新裙子第一次穿给 TA 看），你会？',
      },
    },
  },
  {
    id: 12,
    dimension: 'ZR',
    text: '在恋爱 / 暧昧里受了委屈，你通常会？',
    options: [
      { label: 'A', text: '哭 / 发脾气 / 发朋友圈阴阳怪气', score: 2 },
      { label: 'B', text: '找朋友倾诉一下就好了', score: 0 },
      { label: 'C', text: '自己消化，谁也不告诉，假装没事', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你在一段恋爱里受了委屈（或者回忆过去任何一次），你通常会？',
      },
    },
  },
  {
    id: 13,
    dimension: 'ZR',
    text: '你有多久没在 TA 面前哭过了？（可回忆历任或暗恋场景）',
    options: [
      { label: 'A', text: '昨天就哭了，我的眼泪不值钱', score: 2 },
      { label: 'B', text: '偶尔会，看情况', score: 0 },
      { label: 'C', text: '很久了 / 从来没有，在 TA 面前哭会显得我很弱', score: -2 },
    ],
  },
  {
    id: 14,
    dimension: 'ZR',
    text: '想象你们正在分手 / 或你正在跟心里那个人告别，你最可能说什么？',
    options: [
      { label: 'A', text: '"你对不起我！你知不知道我为你付出了多少！"', score: 2 },
      { label: 'B', text: '"好吧，我们都冷静想想。"', score: 0 },
      { label: 'C', text: '"……嗯。"', score: -2 },
    ],
  },
  {
    id: 15,
    dimension: 'ZR',
    text: 'TA 当着朋友的面说了让你没面子的话，你会？',
    options: [
      { label: 'A', text: '当场怼回去，面子比天大', score: 2 },
      { label: 'B', text: '当时忍住，回家关起门来算账', score: 0 },
      { label: 'C', text: '吞了，可能 TA 是无心的吧（但我记住了）', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '暧昧中的 TA 当着朋友的面说了让你没面子的话，你会？',
      },
      crush: {
        text: '想象你和心里藏着的那个人在一起了，TA 当着朋友的面说了让你没面子的话，你会？',
      },
      solo: {
        text: '想象你对象当着朋友的面说了让你没面子的话，你会？',
      },
    },
  },

  // ===== 维度三：N/L — 亲密需求（8 题）=====
  {
    id: 16,
    dimension: 'NL',
    text: '恋爱之后，你理想的聊天频率是？',
    options: [
      { label: 'A', text: '从早安到晚安，中间不断档最好', score: 2 },
      { label: 'B', text: '每天聊一聊就好，不用时刻在线', score: 0 },
      { label: 'C', text: '有事说事，没事各忙各的', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '如果有一天你和暧昧中的 TA 真的在一起了，你理想的聊天频率是？',
      },
      crush: {
        text: '如果有一天你和心里藏着的那个人真的在一起了，你理想的聊天频率是？',
      },
      solo: {
        text: '想象你谈恋爱了，你理想的聊天频率是？',
      },
    },
  },
  {
    id: 17,
    dimension: 'NL',
    text: 'TA 说今晚要和朋友出去玩，你的反应是？',
    options: [
      { label: 'A', text: '能不能带上我？我也想去嘛', score: 2 },
      { label: 'B', text: '好的，玩得开心，记得告诉我你到家了', score: 0 },
      { label: 'C', text: '太好了，我正好有个完美的独处之夜', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '假设暧昧中的 TA 成了你对象，TA 说今晚要和朋友出去玩，你的反应是？',
      },
      crush: {
        text: '假设心里藏着的那个人成了你对象，TA 说今晚要和朋友出去玩，你的反应是？',
      },
      solo: {
        text: '想象你的对象说今晚要和朋友出去玩，你的反应是？',
      },
    },
  },
  {
    id: 18,
    dimension: 'NL',
    text: '你的理想周末是？',
    options: [
      { label: 'A', text: '和 TA 从早腻到晚，做什么都行，只要在一起', score: 2 },
      { label: 'B', text: '一起待半天，各自安排半天', score: 0 },
      { label: 'C', text: '给我一整个下午独处，否则我会枯萎', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '如果你和暧昧中的 TA 真在一起了，你理想的周末是？',
      },
      crush: {
        text: '如果你和心里藏着的那个人真在一起了，你理想的周末是？',
      },
      solo: {
        text: '想象你谈恋爱了，你理想的周末是？',
        options: [
          '和对象从早腻到晚，做什么都行，只要在一起',
          null,
          null,
        ],
      },
    },
  },
  {
    id: 19,
    dimension: 'NL',
    text: '你怎么看"恋爱后把对象介绍给所有朋友"这件事？',
    options: [
      { label: 'A', text: '当然要！我想把 TA 融入我生活的每个角落', score: 2 },
      { label: 'B', text: '关系好的朋友会介绍', score: 0 },
      { label: 'C', text: '不太想，我的社交圈是我的，TA 的是 TA 的', score: -2 },
    ],
  },
  {
    id: 20,
    dimension: 'NL',
    text: 'TA 出差 / 离开你一个礼拜，你会？',
    options: [
      { label: 'A', text: '天天视频，度日如年，数着秒等 TA 回来', score: 2 },
      { label: 'B', text: '每天晚上通个电话就好', score: 0 },
      { label: 'C', text: '终于可以一个人看剧打游戏吃泡面了！', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '假设暧昧中的 TA 已经成了你对象，TA 出差 / 离开你一个礼拜，你会？',
      },
      crush: {
        text: '假设心里藏着的那个人已经成了你对象，TA 出差 / 离开你一个礼拜，你会？',
      },
      solo: {
        text: '想象你恋爱了，对象出差 / 离开你一个礼拜，你会？',
      },
    },
  },
  {
    id: 21,
    dimension: 'NL',
    text: '恋爱中你最怕的是？',
    options: [
      { label: 'A', text: '对方不够在意我 / 对方觉得我烦', score: 2 },
      { label: 'B', text: '两个人之间没有火花了', score: 0 },
      { label: 'C', text: '失去自我和个人空间', score: -2 },
    ],
  },
  {
    id: 22,
    dimension: 'NL',
    text: '如果你和 TA 在一起，你会主动分享你的手机密码 / 社交账号密码吗？',
    options: [
      { label: 'A', text: '会，我俩不分你我', score: 2 },
      { label: 'B', text: '知道但不怎么看对方的', score: 0 },
      { label: 'C', text: '不会，这是我最后的领土', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '假设暧昧中的 TA 和你在一起了，你会主动分享手机密码 / 社交账号密码吗？',
      },
      crush: {
        text: '假设心里藏着的那个人和你在一起了，你会主动分享手机密码 / 社交账号密码吗？',
      },
      solo: {
        text: '想象你谈恋爱了，你会主动跟对象分享手机密码 / 社交账号密码吗？',
      },
    },
  },
  {
    id: 23,
    dimension: 'NL',
    text: '你更喜欢哪种恋爱状态？',
    options: [
      { label: 'A', text: '无时无刻不在一起的"连体婴儿"模式', score: 2 },
      { label: 'B', text: '亲密有间，若即若离', score: 0 },
      { label: 'C', text: '各自精彩，偶尔交汇的"平行线"模式', score: -2 },
    ],
  },

  // ===== 维度四：Y/F — 安全感（7 题）=====
  {
    id: 24,
    dimension: 'YF',
    text: 'TA 和异性朋友吃饭，你的内心 OS 是？',
    options: [
      { label: 'A', text: '谁？照片发来看看。在哪吃？吃什么？几点回来？', score: 2 },
      { label: 'B', text: '嗯，别太晚回来就好', score: 0 },
      { label: 'C', text: '哦，知道了。（真的只是"知道了"，没有内心戏）', score: -2 },
    ],
    variants: {
      ambiguous: {
        text: '你看到暧昧中的 TA 和某个异性朋友单独吃饭，你的内心 OS 是？',
      },
      crush: {
        text: '你看到心里藏着的那个人和某个异性朋友单独吃饭，你的内心 OS 是？',
      },
      solo: {
        text: '想象你对象和异性朋友单独吃饭，你的内心 OS 是？',
      },
    },
  },
  {
    id: 25,
    dimension: 'YF',
    text: 'TA 突然对你特别好、送了你一个礼物，你会想什么？',
    options: [
      { label: 'A', text: '是不是做了什么亏心事？先查查再感动', score: 2 },
      { label: 'B', text: '开心但有一点点疑惑', score: 0 },
      { label: 'C', text: '收礼物嘛，开心就好，想那么多干嘛', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你对象突然对你特别好、送了你一个礼物，你会想什么？',
      },
    },
  },
  {
    id: 26,
    dimension: 'YF',
    text: '你有没有翻过 TA 的聊天记录 / 朋友圈考古？',
    options: [
      { label: 'A', text: '翻过 / 想翻但没敢 / 正在翻', score: 2 },
      { label: 'B', text: '偶尔无意间看到会在意一下', score: 0 },
      { label: 'C', text: '从来没有，也没兴趣', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你恋爱了，你会翻对象的聊天记录 / 朋友圈考古吗？',
      },
    },
  },
  {
    id: 27,
    dimension: 'YF',
    text: 'TA 点赞了一个异性的自拍，你会？',
    options: [
      { label: 'A', text: '立刻去看那个人是谁，翻完 TA 最近三年的朋友圈', score: 2 },
      { label: 'B', text: '注意到了，有点酸，但不至于太在意', score: 0 },
      { label: 'C', text: '点赞而已，你不也点吗', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你对象点赞了一个异性的自拍，你会？',
      },
    },
  },
  {
    id: 28,
    dimension: 'YF',
    text: 'TA 说"我有个事想跟你说"，你的第一反应是？',
    options: [
      { label: 'A', text: '完了。要分手了。一定是出轨了。我的天。', score: 2 },
      { label: 'B', text: '怎么了？有点紧张', score: 0 },
      { label: 'C', text: '嗯，你说', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你对象说"我有个事想跟你说"，你的第一反应是？',
      },
    },
  },
  {
    id: 29,
    dimension: 'YF',
    text: '恋爱中（或暗恋中），你有没有脑补过"对方其实不爱我"的场景？',
    options: [
      { label: 'A', text: '经常，而且脑补得很详细，堪比八点档狗血剧', score: 2 },
      { label: 'B', text: '偶尔闪过念头，很快就打消了', score: 0 },
      { label: 'C', text: '没有，想这些太累了', score: -2 },
    ],
  },
  {
    id: 30,
    dimension: 'YF',
    text: 'TA 夸别人好看，你的反应是？',
    options: [
      { label: 'A', text: '行，那你找 TA 去啊！（已经在脑中上演被抛弃的完整剧情）', score: 2 },
      { label: 'B', text: '酸一下，然后自我调节', score: 0 },
      { label: 'C', text: '确实好看，我也觉得', score: -2 },
    ],
    variants: {
      solo: {
        text: '想象你对象当着你的面夸别人好看，你的反应是？',
      },
    },
  },

  // ===== 隐藏彩蛋题 =====
  {
    id: 31,
    dimension: 'GD', // 不计入主维度；tag === '彩蛋' 会被 scoring 跳过维度累加
    tag: '彩蛋',
    text: '你有没有做过这种事：给 TA 发了一条消息 → 立刻撤回 → 重新编辑 → 再发出去 → 再撤回 → 最后决定不发了？',
    options: [
      { label: 'A', text: '你在监控我？？？', score: 0, hidden: 2 },
      { label: 'B', text: '偶尔吧……', score: 0, hidden: 1 },
      { label: 'C', text: '没有，发了就发了', score: 0, hidden: 0 },
    ],
  },
  // id 33 / 34 ——「人形 ATM」隐藏叠加标签触发器。
  // 与撤回大师一样 tag='彩蛋'，dimension 写成 'GD' 只是占位，实际会被 scoring 的
  // `q.tag === '彩蛋'` 分支拦截，不会进入任何维度累加。两题的 option.hidden 都留空
  // （undefined → 0），所以也不会污染"纠结值"这条通道。
  //
  // 对应 DRAFT §三「隐藏叠加标签」中的「人形 ATM」规则：
  //   - Q33 选 A 或 Q34 选 A        → 解锁「人形 ATM」
  //   - Q33 选 A 且 Q34 选 A        → 升级为「ATM Pro / 全自动提款机」
  {
    id: 33,
    dimension: 'GD',
    tag: '彩蛋',
    text: '在这段关系里（或你脑补的那段关系里），钱这件事大概是——',
    options: [
      {
        label: 'A',
        text: '基本都是我买单 / 送礼 / 请客，账单到我这就停了；我不太好意思让 TA 花钱',
        score: 0,
      },
      { label: 'B', text: 'AA 或者轮流请，挺公平的', score: 0 },
      { label: 'C', text: '主要是 TA 花，我负责被宠就行', score: 0 },
    ],
    variants: {
      ambiguous: {
        text: '暧昧阶段到现在，花钱这件事大概是——',
      },
      crush: {
        text: '如果你和心里藏着的那个人真的在一起了，花钱这件事你大概会——',
      },
      solo: {
        text: '想象你谈恋爱了，花钱这件事你大概会——',
      },
    },
  },
  {
    id: 34,
    dimension: 'GD',
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
    variants: {
      ambiguous: {
        text: '暧昧中的 TA 凌晨 2 点找你倾诉情绪垃圾，你的反应是？',
      },
      crush: {
        text: '想象心里藏着的那个人凌晨 2 点找你倾诉情绪垃圾，你的反应是？',
      },
      solo: {
        text: '想象你有对象了，对象凌晨 2 点找你倾诉情绪垃圾，你的反应是？',
      },
    },
  },
];

/**
 * 编解码用的稳定题目顺序：按 ID 升序。
 *
 * 不直接用 questions.map(q => q.id) 是因为题库数组顺序（META 放最前）
 * 跟 v1 URL 的字节布局（位置 i = 答案 id = i+1）不一致；
 * 排序后 [1, 2, ..., 30, 31, 32] 正好与旧 URL 兼容，并且将来如果插入
 * 跳号 ID 也不会破坏现有分享链接。
 */
export const questionIds: readonly number[] = questions
  .map((q) => q.id)
  .sort((a, b) => a - b);

export const legacyQuestionsV1: readonly Question[] = questions;
export const legacyQuestionIdsV1: readonly number[] = questionIds;
