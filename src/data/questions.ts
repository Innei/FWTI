export interface Question {
  id: number;
  text: string;
  dimension: 'GD' | 'ZR' | 'NL' | 'YF';
  tag?: string; // 补充题 / 彩蛋
  options: {
    label: string;
    text: string;
    score: number; // +2 = 极性A, 0 = 中立, -2 = 极性B; 对GD: G=+2, D=-2; 对ZR: Z=+2, R=-2; 对NL: N=+2, L=-2; 对YF: Y=+2, F=-2
    hidden?: number; // 隐藏纠结值
  }[];
}

export const questions: Question[] = [
  // ===== 维度一：G/D — 主动性（8 题）=====
  {
    id: 1,
    dimension: 'GD',
    text: '你暗恋一个人时，你最可能怎么做？',
    options: [
      { label: 'A', text: '创造各种"偶遇"，拼命找话题聊', score: 2 },
      { label: 'B', text: '默默关注 ta 的朋友圈，偶尔点个赞', score: 0 },
      { label: 'C', text: '什么都不做，在心里跟 ta 谈了三年恋爱', score: -2 },
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
    text: '你和对象吵架冷战了两天，你会？',
    options: [
      { label: 'A', text: '忍不了了，先低头吧，冷战比吵架还难受', score: 2 },
      { label: 'B', text: '谁先受不了谁先开口，看缘分', score: 0 },
      { label: 'C', text: 'ta 不找我，我能冷到地球毁灭', score: -2 },
    ],
  },
  {
    id: 4,
    dimension: 'GD',
    text: '暧昧到一定阶段了，你会主动表白吗？',
    options: [
      { label: 'A', text: '会，我不想错过，时机到了就冲', score: 2 },
      { label: 'B', text: '疯狂暗示，希望 ta 能领悟', score: 0 },
      { label: 'C', text: '表什么白，ta 不说我就把这份爱带进坟墓', score: -2 },
    ],
  },
  {
    id: 5,
    dimension: 'GD',
    text: '你发消息给对象，对方 2 小时没回，你的操作是？',
    options: [
      { label: 'A', text: '再发一条，或者直接打电话过去', score: 2 },
      { label: 'B', text: '放下手机做别的，偶尔瞄一眼', score: 0 },
      { label: 'C', text: '算了，ta 回不回都无所谓（其实有所谓）', score: -2 },
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
    text: '你发现对象最近好像有点冷淡了，你会？',
    options: [
      { label: 'A', text: '直接问："你最近怎么了？是不是我哪里做得不好？"', score: 2 },
      { label: 'B', text: '旁敲侧击试探一下，看看什么情况', score: 0 },
      { label: 'C', text: 'ta 冷我就冷回去，看谁先撑不住', score: -2 },
    ],
  },
  {
    id: 8,
    dimension: 'GD',
    text: '第一次约会结束后，你会主动发消息说"今天很开心"吗？',
    options: [
      { label: 'A', text: '会！说不定还附带下次约会邀请', score: 2 },
      { label: 'B', text: '看对方反应，ta 发我就回', score: 0 },
      { label: 'C', text: '不会，万一显得我太上头呢', score: -2 },
    ],
  },

  // ===== 维度二：Z/R — 情绪表达（7 题）=====
  {
    id: 9,
    dimension: 'ZR',
    text: '对象做了让你不爽的事，你的第一反应是？',
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
      { label: 'A', text: '声音越来越大，新账旧账一起翻，恨不得写篇论文', score: 2 },
      { label: 'B', text: '就事论事，吵完拉倒', score: 0 },
      { label: 'C', text: '沉默是金，你吵你的，我的嘴是缝上的', score: -2 },
    ],
  },
  {
    id: 11,
    dimension: 'ZR',
    text: '对象忘了你们的纪念日，你会？',
    options: [
      { label: 'A', text: '当场兴师问罪："你心里还有没有我？！"', score: 2 },
      { label: 'B', text: '有点失望，找个机会委婉提醒', score: 0 },
      { label: 'C', text: '默默记了一笔账，不说，但永远不忘', score: -2 },
    ],
  },
  {
    id: 12,
    dimension: 'ZR',
    text: '在恋爱里受了委屈，你通常会？',
    options: [
      { label: 'A', text: '哭 / 发脾气 / 发朋友圈阴阳怪气', score: 2 },
      { label: 'B', text: '找朋友倾诉一下就好了', score: 0 },
      { label: 'C', text: '自己消化，谁也不告诉，假装没事', score: -2 },
    ],
  },
  {
    id: 13,
    dimension: 'ZR',
    text: '你有多久没在对象面前哭过了？',
    options: [
      { label: 'A', text: '昨天就哭了，我的眼泪不值钱', score: 2 },
      { label: 'B', text: '偶尔会，看情况', score: 0 },
      { label: 'C', text: '很久了，在 ta 面前哭会显得我很弱', score: -2 },
    ],
  },
  {
    id: 14,
    dimension: 'ZR',
    text: '分手的时候，你最可能说什么？',
    options: [
      { label: 'A', text: '"你对不起我！你知不知道我为你付出了多少！"', score: 2 },
      { label: 'B', text: '"好吧，我们都冷静想想。"', score: 0 },
      { label: 'C', text: '"……嗯。"', score: -2 },
    ],
  },
  {
    id: 15,
    dimension: 'ZR',
    text: '对象当着朋友的面说了让你没面子的话，你会？',
    options: [
      { label: 'A', text: '当场怼回去，面子比天大', score: 2 },
      { label: 'B', text: '当时忍住，回家关起门来算账', score: 0 },
      { label: 'C', text: '吞了，可能 ta 是无心的吧（但我记住了）', score: -2 },
    ],
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
  },
  {
    id: 17,
    dimension: 'NL',
    text: '对象说今晚要和朋友出去玩，你的反应是？',
    options: [
      { label: 'A', text: '能不能带上我？我也想去嘛', score: 2 },
      { label: 'B', text: '好的，玩得开心，记得告诉我你到家了', score: 0 },
      { label: 'C', text: '太好了，我正好有个完美的独处之夜', score: -2 },
    ],
  },
  {
    id: 18,
    dimension: 'NL',
    text: '你的理想周末是？',
    options: [
      { label: 'A', text: '和对象从早腻到晚，做什么都行，只要在一起', score: 2 },
      { label: 'B', text: '一起待半天，各自安排半天', score: 0 },
      { label: 'C', text: '给我一整个下午独处，否则我会枯萎', score: -2 },
    ],
  },
  {
    id: 19,
    dimension: 'NL',
    text: '你怎么看"恋爱后把对象介绍给所有朋友"这件事？',
    options: [
      { label: 'A', text: '当然要！我想把 ta 融入我生活的每个角落', score: 2 },
      { label: 'B', text: '关系好的朋友会介绍', score: 0 },
      { label: 'C', text: '不太想，我的社交圈是我的，ta 的是 ta 的', score: -2 },
    ],
  },
  {
    id: 20,
    dimension: 'NL',
    text: '对象出差一个礼拜，你会？',
    options: [
      { label: 'A', text: '天天视频，度日如年，数着秒等 ta 回来', score: 2 },
      { label: 'B', text: '每天晚上通个电话就好', score: 0 },
      { label: 'C', text: '终于可以一个人看剧打游戏吃泡面了！', score: -2 },
    ],
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
    text: '你会和对象分享你的手机密码吗？',
    options: [
      { label: 'A', text: '会，我俩不分你我', score: 2 },
      { label: 'B', text: '知道但不怎么看对方的', score: 0 },
      { label: 'C', text: '不会，这是我最后的领土', score: -2 },
    ],
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
    text: '对象和异性朋友吃饭，你的内心 OS 是？',
    options: [
      { label: 'A', text: '谁？照片发来看看。在哪吃？吃什么？几点回来？', score: 2 },
      { label: 'B', text: '嗯，别太晚回来就好', score: 0 },
      { label: 'C', text: '哦，知道了。（真的只是"知道了"，没有内心戏）', score: -2 },
    ],
  },
  {
    id: 25,
    dimension: 'YF',
    text: '对象突然对你特别好、送了你一个礼物，你会想什么？',
    options: [
      { label: 'A', text: '是不是做了什么亏心事？先查查再感动', score: 2 },
      { label: 'B', text: '开心但有一点点疑惑', score: 0 },
      { label: 'C', text: '收礼物嘛，开心就好，想那么多干嘛', score: -2 },
    ],
  },
  {
    id: 26,
    dimension: 'YF',
    text: '你有没有翻过对象的聊天记录？',
    options: [
      { label: 'A', text: '翻过 / 想翻但没敢 / 正在翻', score: 2 },
      { label: 'B', text: '偶尔无意间看到会在意一下', score: 0 },
      { label: 'C', text: '从来没有，也没兴趣', score: -2 },
    ],
  },
  {
    id: 27,
    dimension: 'YF',
    text: '对象点赞了一个异性的自拍，你会？',
    options: [
      { label: 'A', text: '立刻去看那个人是谁，翻完 ta 最近三年的朋友圈', score: 2 },
      { label: 'B', text: '注意到了，有点酸，但不至于太在意', score: 0 },
      { label: 'C', text: '点赞而已，你不也点吗', score: -2 },
    ],
  },
  {
    id: 28,
    dimension: 'YF',
    text: '对象说"我有个事想跟你说"，你的第一反应是？',
    options: [
      { label: 'A', text: '完了。要分手了。一定是出轨了。我的天。', score: 2 },
      { label: 'B', text: '怎么了？有点紧张', score: 0 },
      { label: 'C', text: '嗯，你说', score: -2 },
    ],
  },
  {
    id: 29,
    dimension: 'YF',
    text: '恋爱中，你有没有脑补过"对方其实不爱我"的场景？',
    options: [
      { label: 'A', text: '经常，而且脑补得很详细，堪比八点档狗血剧', score: 2 },
      { label: 'B', text: '偶尔闪过念头，很快就打消了', score: 0 },
      { label: 'C', text: '没有，想这些太累了', score: -2 },
    ],
  },
  {
    id: 30,
    dimension: 'YF',
    text: '你对象夸别人好看，你的反应是？',
    options: [
      { label: 'A', text: '行，那你找 ta 去啊！（已经在脑中上演被抛弃的完整剧情）', score: 2 },
      { label: 'B', text: '酸一下，然后自我调节', score: 0 },
      { label: 'C', text: '确实好看，我也觉得', score: -2 },
    ],
  },

  // ===== 隐藏彩蛋题 =====
  {
    id: 31,
    dimension: 'GD', // 不计入主维度
    tag: '彩蛋',
    text: '你有没有做过这种事：给对象发了一条消息 → 立刻撤回 → 重新编辑 → 再发出去 → 再撤回 → 最后决定不发了？',
    options: [
      { label: 'A', text: '你在监控我？？？', score: 0, hidden: 2 },
      { label: 'B', text: '偶尔吧……', score: 0, hidden: 1 },
      { label: 'C', text: '没有，发了就发了', score: 0, hidden: 0 },
    ],
  },
];
