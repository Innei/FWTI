/**
 * FWTI v3 · 题库（纯白话 + 2024-2025 网络梗）
 *
 * 结构：
 *   - metaQuestionV3（id=0）：前置题，决定 status。
 *   - questionsV3：32 道主干，每维 8 题，每维内 A 选项极性 4+/4-（第 A 位 4 次 +2，4 次 -2）。
 *   - questionIdsV3：codec 编码顺序（与 questionsV3.map(q=>q.id) 等价）。
 *
 * 分布：
 *   C 接触  · ids 1-8   · A=+2 次序 [1,3,5,7] / A=-2 次序 [2,4,6,8]
 *   R 调节  · ids 9-16  · A=+2 次序 [9,11,13,15] / A=-2 次序 [10,12,14,16]
 *   A 黏附  · ids 17-24 · A=+2 次序 [17,19,21,23] / A=-2 次序 [18,20,22,24]
 *   S 安全  · ids 25-32 · A=+2 次序 [25,27,29,31] / A=-2 次序 [26,28,30,32]
 *
 * 档次：
 *   - 3 档：A=±2 / B=0 / C=∓2（视 A 方向镜像 C）
 *   - 5 档（Q5/Q13/Q21/Q29，每维一题点彩）：A=+2 / B=+1 / C=0 / D=-1 / E=-2
 *
 * 选项 tag：
 *   - 'rat'  · RAT 鼠鼠恋人 自贬源（现附 Q17 C / Q22 A / Q29 A 等个别选项，见下）
 *   - 'void' · VOID 恋爱绝缘体 证据（solo variants 中 Q17 C / Q19 C 等标记）
 *   - 'mad'  · 发疯辅助信号（Q10 C / Q13 A）
 */

import type {
  OptionV3,
  QuestionV3,
  StatusKey,
  QuestionVariantV3,
} from './types';

// ═══════════════════════════════════════════════════════════════════
// §〇 · META 前置题（id=0，独立于 questionsV3）
// ═══════════════════════════════════════════════════════════════════

export const metaQuestionV3: QuestionV3 = {
  id: 0,
  dimension: 'META',
  scale: 3,
  text: '开始之前，你目前的恋爱状态是？',
  options: [
    { label: 'A', text: '有对象 / 正在恋爱中', score: 0, meta: 'dating' },
    { label: 'B', text: '暧昧中 / 有心动的那个人', score: 0, meta: 'ambiguous' },
    { label: 'C', text: '单身，但心里还藏着某个人（暗恋 / 念念不忘的前任）', score: 0, meta: 'crush' },
    { label: 'D', text: '纯单身，没有任何心动对象', score: 0, meta: 'solo' },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// §一 · C 接触维（追 ↔ 避）· 8 题 · ids 1-8
// ═══════════════════════════════════════════════════════════════════

const C_QUESTIONS: QuestionV3[] = [
  {
    id: 1,
    dimension: 'C',
    scale: 3,
    text: '深夜 12 点突然想起心里那个人，你——',
    options: [
      { label: 'A', text: '直接发消息问"在干嘛"', score: 2 },
      { label: 'B', text: '去翻 ta 最近朋友圈', score: 0 },
      { label: 'C', text: '忍住，别打扰', score: -2 },
    ],
    variants: {
      dating: { text: '深夜 12 点突然很想对象，你——' },
      ambiguous: { text: '深夜 12 点突然想起暧昧对象，你——' },
      crush: { text: '深夜 12 点突然想起那个放不下的人，你——' },
      solo: {
        text: '深夜 12 点想联系一个人（任谁都行），你——',
        options: [
          '挑一个直接发消息',
          '去翻某人的朋友圈',
          '忍住，谁都别打扰',
        ],
      },
    },
  },
  {
    id: 2,
    dimension: 'C',
    scale: 3,
    text: '发消息给 ta，三小时没回——',
    options: [
      { label: 'A', text: '不打扰了，ta 可能在忙', score: -2 },
      { label: 'B', text: '再等等', score: 0 },
      { label: 'C', text: '再追一条问 ta 怎么了', score: 2 },
    ],
    variants: {
      dating: { text: '发消息给对象，三小时没回——' },
      ambiguous: { text: '发消息给暧昧对象，三小时没回——' },
      crush: { text: '鼓起勇气发消息给心动对象，三小时没回——' },
      solo: { text: '发消息给关系不确定的人，三小时没回——' },
    },
  },
  {
    id: 3,
    dimension: 'C',
    scale: 3,
    text: '周末 ta 没约你——',
    options: [
      { label: 'A', text: '我主动发"要不要一起"', score: 2 },
      { label: 'B', text: '在线等 ta 开口', score: 0 },
      { label: 'C', text: '各玩各的正好', score: -2 },
    ],
    variants: {
      dating: { text: '周末对象没主动约你——' },
      ambiguous: { text: '周末暧昧对象没约你——' },
      crush: { text: '周末心动对象没约你——' },
      solo: {
        text: '周末身边朋友都各忙各的，没约你——',
        options: ['我主动拉一个出来', '在线等有人开口', '各玩各的正好'],
      },
    },
  },
  {
    id: 4,
    dimension: 'C',
    scale: 3,
    text: 'ta 发了条新朋友圈——',
    options: [
      { label: 'A', text: '不特意看，刷到再说', score: -2 },
      { label: 'B', text: '点个赞就划走', score: 0 },
      { label: 'C', text: '秒看 + 评论引话题', score: 2 },
    ],
    variants: {
      dating: { text: '对象发了条新朋友圈——' },
      ambiguous: { text: '暧昧对象发了条新朋友圈——' },
      crush: { text: '心里那个人发了条新朋友圈——' },
      solo: {
        text: '你默默关注的那个人发了条新朋友圈——',
        options: ['不特意看，刷到再说', '点个赞就划走', '秒看 + 评论引话题'],
      },
    },
  },
  {
    id: 5,
    dimension: 'C',
    scale: 5,
    text: '聊得挺好的 ta，三天没动静——',
    options: [
      { label: 'A', text: '立刻主动找新话题救场', score: 2 },
      { label: 'B', text: '发个表情包戳一下', score: 1 },
      { label: 'C', text: '看谁先憋不住', score: 0 },
      { label: 'D', text: '默默翻聊天记录，不发', score: -1 },
      { label: 'E', text: '就这么淡掉挺好', score: -2 },
    ],
    variants: {
      dating: { text: '和对象最近聊得少了，已经三天没主动话题——' },
      ambiguous: { text: '暧昧对象三天没主动找你——' },
      crush: { text: '心动对象已经三天没动静——' },
      solo: { text: '很久不联系的那个人，三天没动静——' },
    },
  },
  {
    id: 6,
    dimension: 'C',
    scale: 3,
    text: '遇到想认识的人——',
    options: [
      { label: 'A', text: '不太会主动打招呼，等缘分', score: -2 },
      { label: 'B', text: '有机会再说', score: 0 },
      { label: 'C', text: '直接上去要联系方式', score: 2 },
    ],
    variants: {
      dating: {
        text: '朋友局遇到新认识的异性（假设你单身）——',
        options: [
          '不太会主动打招呼，等缘分',
          '有机会再说',
          '直接上去要联系方式',
        ],
      },
      ambiguous: { text: '朋友局遇到另一个想认识的人——' },
      crush: { text: '朋友局遇到一个感觉不错的人——' },
      solo: { text: '朋友局遇到想认识的人——' },
    },
  },
  {
    id: 7,
    dimension: 'C',
    scale: 3,
    text: 'ta 发了条伤感动态——',
    options: [
      { label: 'A', text: '立刻私信关心一句', score: 2 },
      { label: 'B', text: '点个赞表示看到了', score: 0 },
      { label: 'C', text: '不评论，ta 愿意说自然会说', score: -2 },
    ],
    variants: {
      dating: { text: '对象发了条伤感动态——' },
      ambiguous: { text: '暧昧对象发了条伤感动态——' },
      crush: { text: '心里那个人发了条伤感动态——' },
      solo: {
        text: '好朋友 / 关心的人发了条伤感动态——',
        options: [
          '立刻私信关心一句',
          '点个赞表示看到了',
          '不评论，ta 愿意说自然会说',
        ],
      },
    },
  },
  {
    id: 8,
    dimension: 'C',
    scale: 3,
    text: '恋爱中"主动"这件事，你觉得——',
    options: [
      { label: 'A', text: '最好对方更主动点，我负责被爱就行', score: -2 },
      { label: 'B', text: '双向奔赴最舒服', score: 0 },
      { label: 'C', text: '喜欢就得冲，主动不寒碜', score: 2 },
    ],
    variants: {
      dating: { text: '谈恋爱时"主动联系"这件事，你觉得——' },
      ambiguous: { text: '暧昧期"谁更主动"这件事，你觉得——' },
      crush: { text: '对喜欢的人"主动"这件事，你觉得——' },
      solo: { text: '谈恋爱时"主动"这件事，你觉得——' },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// §二 · R 调节维（暴 ↔ 闷）· 8 题 · ids 9-16
// ═══════════════════════════════════════════════════════════════════

const R_QUESTIONS: QuestionV3[] = [
  {
    id: 9,
    dimension: 'R',
    scale: 3,
    text: 'ta 说了句你不爱听的话——',
    options: [
      { label: 'A', text: '当场怼回去，有气不憋', score: 2 },
      { label: 'B', text: '先忍一下，事后再聊', score: 0 },
      { label: 'C', text: '当场"没事"，心里存档一年', score: -2 },
    ],
    variants: {
      dating: { text: '对象说了句你不爱听的话——' },
      ambiguous: { text: '暧昧对象说了句你不爱听的话——' },
      crush: { text: '心里那个人说了句你不爱听的话——' },
      solo: {
        text: '亲近的人（朋友 / 家人）说了句你不爱听的话——',
        options: [
          '当场怼回去，有气不憋',
          '先忍一下，事后再聊',
          '当场"没事"，心里存档一年',
        ],
      },
    },
  },
  {
    id: 10,
    dimension: 'R',
    scale: 3,
    text: '你俩吵架当下——',
    options: [
      { label: 'A', text: '憋住不说，直接冷战一周', score: -2 },
      { label: 'B', text: '冷静一晚上就过了', score: 0 },
      { label: 'C', text: '当场爆发，话全倒出来', score: 2, tag: 'mad' },
    ],
    variants: {
      dating: { text: '和对象吵架当下——' },
      ambiguous: { text: '和暧昧对象闹小别扭——' },
      crush: { text: '和心里那个人（前任 / 暗恋）起冲突——' },
      solo: {
        text: '跟最亲近的人（朋友 / 家人）起大冲突——',
        options: [
          '憋住不说，直接冷战一周',
          '冷静一晚上就过了',
          '当场爆发，话全倒出来',
        ],
      },
    },
  },
  {
    id: 11,
    dimension: 'R',
    scale: 3,
    text: '上班被气到要炸——',
    options: [
      { label: 'A', text: '立刻跟 ta 吐槽输出一通', score: 2 },
      { label: 'B', text: '回家讲，讲有分寸', score: 0 },
      { label: 'C', text: '不说，自己消化掉', score: -2 },
    ],
    variants: {
      dating: { text: '上班被气到要炸，回到家——' },
      ambiguous: { text: '上班被气到要炸，你会——' },
      crush: { text: '上班被气到要炸，你会——' },
      solo: {
        text: '上班被气到要炸，你会——',
        options: [
          '立刻找人吐槽输出一通',
          '回家讲，讲有分寸',
          '不说，自己消化掉',
        ],
      },
    },
  },
  {
    id: 12,
    dimension: 'R',
    scale: 3,
    text: 'ta 忘了你很在意的日子（生日 / 纪念日）——',
    options: [
      { label: 'A', text: '装没事，心里默默记账一年', score: -2 },
      { label: 'B', text: '当天轻描淡写提一下，不闹', score: 0 },
      { label: 'C', text: '当场爆发"你根本不在意我"', score: 2 },
    ],
    variants: {
      dating: { text: '对象忘了重要纪念日——' },
      ambiguous: { text: '暧昧对象忘了你生日——' },
      crush: { text: '心里那个人忘了你生日（或曾经忘过）——' },
      solo: {
        text: '最亲的朋友 / 家人忘了你生日——',
        options: [
          '装没事，心里默默记账一年',
          '当天轻描淡写提一下，不闹',
          '当场爆发"你根本不在意我"',
        ],
      },
    },
  },
  {
    id: 13,
    dimension: 'R',
    scale: 5,
    text: '看到 ta 跟异性暧昧聊天记录——',
    options: [
      { label: 'A', text: '立刻质问，不藏', score: 2, tag: 'mad' },
      { label: 'B', text: '当天找机会提一嘴', score: 1 },
      { label: 'C', text: '隔天若无其事问一句', score: 0 },
      { label: 'D', text: '暗戳戳观察，不说', score: -1 },
      { label: 'E', text: '当作没看见，假装 ok', score: -2 },
    ],
    variants: {
      dating: { text: '看到对象跟异性的暧昧聊天截图——' },
      ambiguous: { text: '看到暧昧对象跟别人也聊得火热——' },
      crush: { text: '看到心里那个人跟别人暧昧——' },
      solo: { text: '看到暗恋 / 前任跟新对象暧昧——' },
    },
  },
  {
    id: 14,
    dimension: 'R',
    scale: 3,
    text: '生活压力大，心情一团糟——',
    options: [
      { label: 'A', text: '不想连累 ta，自己扛', score: -2 },
      { label: 'B', text: '讲一句，不展开', score: 0 },
      { label: 'C', text: '长篇吐槽到凌晨三点', score: 2 },
    ],
    variants: {
      dating: { text: '生活压力大，心情一团糟，对象在旁——' },
      ambiguous: { text: '生活压力大，心情一团糟，你会——' },
      crush: { text: '生活压力大，心情一团糟，你会——' },
      solo: {
        text: '生活压力大，心情一团糟，你会——',
        options: [
          '不想连累谁，自己扛',
          '跟朋友讲一句，不展开',
          '长篇吐槽到凌晨三点',
        ],
      },
    },
  },
  {
    id: 15,
    dimension: 'R',
    scale: 3,
    text: 'ta 不小心说了句扎你的话——',
    options: [
      { label: 'A', text: '表情管理失败，当场变脸', score: 2 },
      { label: 'B', text: '装镇定，事后再讲', score: 0 },
      { label: 'C', text: '面无表情继续，装没听见', score: -2 },
    ],
    variants: {
      dating: { text: '对象不小心说了句扎你的话——' },
      ambiguous: { text: '暧昧对象一句话戳到你——' },
      crush: { text: '心里那个人说了句戳到你的话——' },
      solo: {
        text: '好朋友不小心说了句扎你的话——',
        options: [
          '表情管理失败，当场变脸',
          '装镇定，事后再讲',
          '面无表情继续，装没听见',
        ],
      },
    },
  },
  {
    id: 16,
    dimension: 'R',
    scale: 3,
    text: '恋爱里"发火"这件事——',
    options: [
      { label: 'A', text: '尽量不发，伤感情', score: -2 },
      { label: 'B', text: '该表达就表达', score: 0 },
      { label: 'C', text: '有情绪就要当场给，不憋', score: 2 },
    ],
    variants: {
      dating: { text: '谈恋爱时"发火"这件事，你觉得——' },
      ambiguous: { text: '和暧昧对象"表达负面情绪"这件事——' },
      crush: { text: '对心里那个人"发脾气"这件事——' },
      solo: { text: '在亲密关系里"发火"这件事，你觉得——' },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// §三 · A 黏附维（黏 ↔ 离）· 8 题 · ids 17-24
// ═══════════════════════════════════════════════════════════════════

const A_QUESTIONS: QuestionV3[] = [
  {
    id: 17,
    dimension: 'A',
    scale: 3,
    text: '一整天没联系上 ta——',
    options: [
      { label: 'A', text: '就很慌，开始脑补是不是出事了', score: 2 },
      { label: 'B', text: '正常，大人都忙', score: 0 },
      { label: 'C', text: '正好，各自清净', score: -2, tag: 'rat' },
    ],
    variants: {
      dating: { text: '一整天没联系上对象——' },
      ambiguous: { text: '一整天没收到暧昧对象消息——' },
      crush: { text: '一整天心里那个人没任何动静——' },
      solo: {
        text: '一整天没有人主动找你——',
        options: [
          '就很慌，是不是被全世界遗忘了',
          '正常，不至于',
          '正好，清净', // void signal
        ],
      },
    },
  },
  {
    id: 18,
    dimension: 'A',
    scale: 3,
    text: '周末最喜欢的安排是——',
    options: [
      { label: 'A', text: '自己一个人待着最舒服', score: -2 },
      { label: 'B', text: '看情况，有约就出', score: 0 },
      { label: 'C', text: '跟 ta 泡一整天', score: 2 },
    ],
    variants: {
      dating: { text: '周末最喜欢的安排是——' },
      ambiguous: { text: '周末最喜欢的安排是——' },
      crush: { text: '周末最喜欢的安排是——' },
      solo: {
        text: '周末最喜欢的安排是——',
        options: [
          '自己一个人待着最舒服',
          '看情况，有约就出',
          '跟一个人泡一整天（朋友 / 家人 / 宠物都行）',
        ],
      },
    },
  },
  {
    id: 19,
    dimension: 'A',
    scale: 3,
    text: '每天"晚安"这件事——',
    options: [
      { label: 'A', text: '必须互道晚安才能睡', score: 2 },
      { label: 'B', text: '看情况，不强求', score: 0 },
      { label: 'C', text: '没必要，睡了就是睡了', score: -2, tag: 'void' },
    ],
    variants: {
      dating: { text: '每天跟对象"晚安"这件事——' },
      ambiguous: { text: '每天跟暧昧对象"晚安"这件事——' },
      crush: { text: '想跟心里那个人说"晚安"这件事——' },
      solo: {
        text: '每天睡前有没有一个"必须说晚安的人"——',
        options: [
          '必须有，睡前要跟某个人说一句',
          '看情况',
          '没有也不需要，睡就完事',
        ],
      },
    },
  },
  {
    id: 20,
    dimension: 'A',
    scale: 3,
    text: 'ta 要出差一周，你——',
    options: [
      { label: 'A', text: '正好我也能清静清静', score: -2 },
      { label: 'B', text: '偶尔联系就行', score: 0 },
      { label: 'C', text: '必须每天视频，少一天都不行', score: 2 },
    ],
    variants: {
      dating: { text: '对象要出差一周，你——' },
      ambiguous: { text: '暧昧对象要出差一周不怎么联系得上，你——' },
      crush: { text: '心里那个人要离开一阵，你——' },
      solo: {
        text: '最亲的朋友 / 家人要离开你一周，你——',
        options: [
          '正好我也能清静清静',
          '偶尔联系就行',
          '必须每天视频，少一天都不行',
        ],
      },
    },
  },
  {
    id: 21,
    dimension: 'A',
    scale: 5,
    text: '你和 ta 在彼此朋友圈的出现频率——',
    options: [
      { label: 'A', text: '几乎互相占满，官宣常驻', score: 2 },
      { label: 'B', text: '常发合照', score: 1 },
      { label: 'C', text: '偶尔合影', score: 0 },
      { label: 'D', text: '基本不发对方', score: -1 },
      { label: 'E', text: '完全不混进彼此动态', score: -2 },
    ],
    variants: {
      dating: { text: '你和对象在彼此朋友圈的出现频率——' },
      ambiguous: { text: '你和暧昧对象在彼此朋友圈的出现频率——' },
      crush: { text: '你和心里那个人在彼此朋友圈的出现频率——' },
      solo: {
        text: '假设你正在恋爱，你希望两个人在彼此朋友圈——',
      },
    },
  },
  {
    id: 22,
    dimension: 'A',
    scale: 3,
    text: '恋爱里的"个人时间"——',
    options: [
      { label: 'A', text: '是刚需，每天都要有', score: -2 },
      { label: 'B', text: '重要但可谈', score: 0 },
      { label: 'C', text: '没也行，跟 ta 在一起就是充电', score: 2, tag: 'rat' },
    ],
    variants: {
      dating: { text: '你和对象之间的"个人时间"——' },
      ambiguous: { text: '暧昧期你自己的"个人时间"——' },
      crush: { text: '想到心里那个人时，你的"个人时间"——' },
      solo: {
        text: '理想状态下，恋爱里的"个人时间"——',
      },
    },
  },
  {
    id: 23,
    dimension: 'A',
    scale: 3,
    text: '一件重要决定（换工作 / 搬家），你会——',
    options: [
      { label: 'A', text: '必须问 ta，ta 的意见我特别在意', score: 2 },
      { label: 'B', text: '会告诉 ta，但自己拿主意', score: 0 },
      { label: 'C', text: '自己事自己定，不用 ta 参与', score: -2 },
    ],
    variants: {
      dating: { text: '一件重要决定（换工作 / 搬家），对象——' },
      ambiguous: { text: '一件重要决定，你会告诉暧昧对象吗——' },
      crush: { text: '一件重要决定，你会想跟心里那个人商量吗——' },
      solo: {
        text: '一件重要决定（换工作 / 搬家），你会——',
        options: [
          '必须问最在意的那个人（家人 / 挚友）',
          '会告诉身边人，但自己拿主意',
          '自己事自己定，不用谁参与',
        ],
      },
    },
  },
  {
    id: 24,
    dimension: 'A',
    scale: 3,
    text: '"两个人各忙各的"这种状态——',
    options: [
      { label: 'A', text: '挺好，健康距离', score: -2 },
      { label: 'B', text: '可以但别太久', score: 0 },
      { label: 'C', text: '接受不了，要黏在一起', score: 2 },
    ],
    variants: {
      dating: { text: '你和对象"各忙各的"这种状态——' },
      ambiguous: { text: '暧昧里"各忙各的"这种状态——' },
      crush: { text: '想到心里那个人各忙各的，你觉得——' },
      solo: { text: '理想恋爱里"各忙各的"这种状态——' },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// §四 · S 安全维（疑 ↔ 佛）· 8 题 · ids 25-32
// ═══════════════════════════════════════════════════════════════════

const S_QUESTIONS: QuestionV3[] = [
  {
    id: 25,
    dimension: 'S',
    scale: 3,
    text: 'ta 突然不怎么回消息了——',
    options: [
      { label: 'A', text: '开始脑补"是不是不喜欢我了"', score: 2 },
      { label: 'B', text: '给 ta 空间', score: 0 },
      { label: 'C', text: '大概在忙，没想太多', score: -2 },
    ],
    variants: {
      dating: { text: '对象最近突然不怎么回消息——' },
      ambiguous: { text: '暧昧对象突然不怎么回消息了——' },
      crush: { text: '心里那个人突然冷下来——' },
      solo: { text: '一个在意的人（暗恋 / 朋友 / 前任）突然不怎么回——' },
    },
  },
  {
    id: 26,
    dimension: 'S',
    scale: 3,
    text: 'ta 的异性朋友——',
    options: [
      { label: 'A', text: '我不在意，谁还没有朋友', score: -2 },
      { label: 'B', text: '知道一下就行', score: 0 },
      { label: 'C', text: '必须明明白白，名单给一份', score: 2 },
    ],
    variants: {
      dating: { text: '对象的异性朋友——' },
      ambiguous: { text: '暧昧对象的异性朋友——' },
      crush: { text: '心里那个人的异性朋友——' },
      solo: { text: '假设你正在恋爱，对象的异性朋友——' },
    },
  },
  {
    id: 27,
    dimension: 'S',
    scale: 3,
    text: 'ta 手机响了一下，没告诉你是谁发的——',
    options: [
      { label: 'A', text: '想看，但忍住（心里转一百种猜测）', score: 2 },
      { label: 'B', text: '忍得住，不问', score: 0 },
      { label: 'C', text: 'ta 的事，我不管', score: -2 },
    ],
    variants: {
      dating: { text: '对象手机响了一下，没告诉你是谁发的——' },
      ambiguous: { text: '暧昧对象手机响了一下，没告诉你是谁——' },
      crush: { text: '心里那个人手机响了一下，没告诉你是谁——' },
      solo: { text: '假设恋爱中，对象手机响了却不说是谁——' },
    },
  },
  {
    id: 28,
    dimension: 'S',
    scale: 3,
    text: '"异地恋"你觉得——',
    options: [
      { label: 'A', text: '没问题，信任就行', score: -2 },
      { label: 'B', text: '有挑战但可克服', score: 0 },
      { label: 'C', text: '会焦虑，看不见就不安', score: 2 },
    ],
    variants: {
      dating: { text: '假如你和对象异地，你觉得——' },
      ambiguous: { text: '假如暧昧对象要去异地，你觉得——' },
      crush: { text: '心里那个人去了异地，你觉得——' },
      solo: { text: '"异地恋"你觉得——' },
    },
  },
  {
    id: 29,
    dimension: 'S',
    scale: 5,
    text: 'ta 给你的爱——',
    options: [
      { label: 'A', text: '总觉得不够，还想要更多证据', score: 2, tag: 'rat' },
      { label: 'B', text: '偶尔会怀疑', score: 1 },
      { label: 'C', text: '大部分时候能感受到', score: 0 },
      { label: 'D', text: '基本放心', score: -1 },
      { label: 'E', text: '我完全相信', score: -2 },
    ],
    variants: {
      dating: { text: '对象给你的爱——' },
      ambiguous: { text: '暧昧对象给你的信号——' },
      crush: { text: '心里那个人对你的在意——' },
      solo: { text: '过往被爱 / 被在意的感觉，回想一下——' },
    },
  },
  {
    id: 30,
    dimension: 'S',
    scale: 3,
    text: '看到 ta 跟前任的合照——',
    options: [
      { label: 'A', text: '过去就过去，无所谓', score: -2 },
      { label: 'B', text: '有点介意但不提', score: 0 },
      { label: 'C', text: '必须删掉，留着什么意思', score: 2 },
    ],
    variants: {
      dating: { text: '对象手机里还留着跟前任的合照——' },
      ambiguous: { text: '暧昧对象手机里还有跟前任的合照——' },
      crush: { text: '心里那个人跟前任的合照还在——' },
      solo: { text: '假设对象跟前任的合照还留着——' },
    },
  },
  {
    id: 31,
    dimension: 'S',
    scale: 3,
    text: 'ta 说"我爱你"——',
    options: [
      { label: 'A', text: '我会反复确认"真的吗？你爱我什么？"', score: 2, tag: 'rat' },
      { label: 'B', text: '开心接住', score: 0 },
      { label: 'C', text: '嗯嗯知道了', score: -2 },
    ],
    variants: {
      dating: { text: '对象跟你说"我爱你"——' },
      ambiguous: { text: '暧昧对象第一次说"我喜欢你"——' },
      crush: { text: '心里那个人对你说"我喜欢你"——' },
      solo: { text: '假如有人对你认真说"我爱你"——' },
    },
  },
  {
    id: 32,
    dimension: 'S',
    scale: 3,
    text: '"吃醋"这件事——',
    options: [
      { label: 'A', text: '醋意是信任不足，我尽量不吃', score: -2 },
      { label: 'B', text: '适量吃，能调情', score: 0 },
      { label: 'C', text: '醋精在线，连 ta 同事都能嫉妒', score: 2 },
    ],
    variants: {
      dating: { text: '你和对象之间"吃醋"这件事——' },
      ambiguous: { text: '暧昧期"吃醋"这件事——' },
      crush: { text: '对心里那个人"吃醋"这件事——' },
      solo: { text: '假设恋爱里"吃醋"这件事——' },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// §五 · solo-only 题（替换 5 道以"假设正在恋爱 / 暗恋 / 前任"为锚的 variants）
//
// META Q0 D = "纯单身，没有任何心动对象" 的用户原本需答 Q13/Q21/Q26/Q27/Q30 的
// solo variant，其措辞仍假设"你正在恋爱 / 暗恋 / 前任"，纯单身作答违和。
// 此五题在 solo 路径被替换为同维同极性的 solo-native 题（Q33-Q37），以保
// 每 status 四维 8/8/8/8 + 4+/4- A 极性。
//
// 极性映射：
//   Q13 (R, A=+2, 5-scale) → Q33 (R, A=+2, 5-scale)
//   Q21 (A, A=+2, 5-scale) → Q35 (A, A=+2, 5-scale)
//   Q26 (S, A=-2, 3-scale) → Q34 (S, A=-2, 3-scale)
//   Q27 (S, A=+2, 3-scale) → Q37 (S, A=+2, 3-scale)
//   Q30 (S, A=-2, 3-scale) → Q36 (S, A=-2, 3-scale)
//
// 非 solo 用户不答此 5 题；solo 用户不答被替题——两组于 codec 中相当于
// 互斥补位，位点皆为 `-`，不破坏既往 v3 链接（`decodeAnswersV3` 尾部
// 右 pad `-`）。
// ═══════════════════════════════════════════════════════════════════

export const SOLO_EXCLUDED_IDS_V3: ReadonlySet<number> = new Set([
  13, 21, 26, 27, 30,
]);

const SOLO_ONLY_QUESTIONS: QuestionV3[] = [
  {
    id: 33,
    dimension: 'R',
    scale: 5,
    text: '独处时突然想起一件多年前让你很难受的往事——',
    options: [
      { label: 'A', text: '立刻找个人倾诉（朋友 / 家人 / 树洞都行）', score: 2 },
      { label: 'B', text: '写出来，发一条小作文 / 朋友圈', score: 1 },
      { label: 'C', text: '叹口气，继续手头事', score: 0 },
      { label: 'D', text: '心里翻一遍，一个字不说', score: -1 },
      { label: 'E', text: '早翻篇了，无感', score: -2 },
    ],
  },
  {
    id: 34,
    dimension: 'S',
    scale: 3,
    text: '身边重要的朋友突然有了新的"知己"，你好像被冷落——',
    options: [
      { label: 'A', text: '挺好，各有各的圈子', score: -2 },
      { label: 'B', text: '有点酸，但不说', score: 0 },
      { label: 'C', text: '忍不住去查 TA 最近跟谁走得近', score: 2 },
    ],
  },
  {
    id: 35,
    dimension: 'A',
    scale: 5,
    text: '你主动联系亲密好友 / 家人的频率——',
    options: [
      { label: 'A', text: '几乎每天，至少有一两个人要讲话', score: 2 },
      { label: 'B', text: '一周三四次', score: 1 },
      { label: 'C', text: '想到才联系', score: 0 },
      { label: 'D', text: '两周一次都算频繁', score: -1 },
      { label: 'E', text: '有事才找，没事各过各的', score: -2 },
    ],
  },
  {
    id: 36,
    dimension: 'S',
    scale: 3,
    text: '想到自己过往被辜负 / 心意落空的某段经历——',
    options: [
      { label: 'A', text: '早翻篇了，不会再想', score: -2 },
      { label: 'B', text: '偶尔想起，叹口气就过', score: 0 },
      { label: 'C', text: '反复想，有时还会气到', score: 2 },
    ],
  },
  {
    id: 37,
    dimension: 'S',
    scale: 3,
    text: '一个重要的朋友最近变神秘（朋圈三天可见 / 问什么都说"忙"）——',
    options: [
      { label: 'A', text: '第一反应：是不是我哪里做错了', score: 2 },
      { label: 'B', text: '可能 TA 自己有事，等等看', score: 0 },
      { label: 'C', text: 'TA 有自己的节奏，我不管', score: -2 },
    ],
  },
];

export const SOLO_ONLY_IDS_V3: ReadonlySet<number> = new Set(
  SOLO_ONLY_QUESTIONS.map((q) => q.id),
);

// ═══════════════════════════════════════════════════════════════════
// §六 · 合并 · questionsV3 / questionIdsV3 / questionByIdV3
// ═══════════════════════════════════════════════════════════════════

export const questionsV3: QuestionV3[] = [
  ...C_QUESTIONS,
  ...R_QUESTIONS,
  ...A_QUESTIONS,
  ...S_QUESTIONS,
  ...SOLO_ONLY_QUESTIONS,
];

/** codec 编码顺序 · append-only。未来若增题一律追加至尾部，勿插入中段。 */
export const questionIdsV3: readonly number[] = questionsV3.map((q) => q.id);

export const questionByIdV3: ReadonlyMap<number, QuestionV3> = new Map(
  questionsV3.map((q) => [q.id, q]),
);

// 平衡不变量（手工审计于题库初版，见头注分布表）：
//   - 每维 8 题 · A 选项极性 4+/4- · 已手工校验通过。
//   - 如题库扩增，应补入单元测试做自动校验；运行期不再做 dev flag 探测。

// Re-export helpers for convenience.
export { resolveQuestionText, resolveOptionText } from './types';
export type {
  OptionV3,
  QuestionV3,
  StatusKey,
  QuestionVariantV3,
  DimV3,
  ScoringDim,
  Scale,
  OptionTag,
} from './types';
