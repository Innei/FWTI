export interface Personality {
  code: string;
  name: string;
  engName: string;
  cnSlang: string; // 中文网络梗 / 缩写
  tagline: string;
  emoji: string;
  color: string; // 主题色
  wasteLevel: number; // 1-5
  description: string;
  traits: string[];
  catchphrases: string[];
  bestMatch: string;
  worstMatch: string;
  advice: string;
}

export const personalities: Record<string, Personality> = {
  GZNY: {
    code: 'GZNY',
    name: '自爆卡车',
    engName: 'BOOM',
    cnSlang: '原地 BBQ',
    tagline: '爱你爱到自毁，怀疑你怀疑到自闭',
    emoji: '💥',
    color: '#FF4444',
    wasteLevel: 5,
    description:
      '你在恋爱中就像一辆装满了TNT的卡车，油门焊死直冲对方。你不仅主动，还特别能闹腾——有情绪就炸，炸完了又黏上去求和，然后开始怀疑对方是不是不爱自己了。一段感情下来，对方累，你更累，但你就是停不下来。你的爱情模式是：冲锋→爆炸→黏合→怀疑→再冲锋，无限循环。',
    traits: [
      '表白从不犹豫，被拒也能东山再起',
      '吵架声音能穿透三堵墙，吵完又要抱抱',
      'TA 回消息晚了 5 分钟就开始编排分手剧情',
    ],
    catchphrases: ['"你是不是不爱我了？！"', '"我为你付出了这么多你看到了吗！"', '"好我不闹了……你先说你爱我"'],
    bestMatch: 'GRNF',
    worstMatch: 'DRLY',
    advice: '你的热情是珍贵的，但别把它变成对方的负担。试试在怀疑的念头升起时，先深呼吸十秒再行动。',
  },
  GZNF: {
    code: 'GZNF',
    name: '恋爱脑',
    engName: 'DAZE',
    cnSlang: 'LAN / 脑淤血',
    tagline: '脑子空了，全是你',
    emoji: '🧠',
    color: '#FF69B4',
    wasteLevel: 4,
    description:
      '一旦喜欢上一个人，你的整个世界就只剩下 TA 了。工作？不重要。朋友？下次再约。自我？那是什么？你主动追求、情绪外放、极度黏人，但好在你心大佛系，不怎么吃醋——因为你满脑子都在想怎么对 TA 更好，根本没空怀疑。恋爱脑不是病，但你这个程度……有点病。',
    traits: [
      '恋爱后朋友圈画风突变，全是撒狗粮',
      'TA 放个屁你都觉得是爱的信号',
      '为 TA 可以取消任何计划，包括但不限于家里人的生日',
    ],
    catchphrases: ['"你开心就好！"', '"宝宝今天想吃什么？我去买！"', '"我没有朋友了？有你就够了啊"'],
    bestMatch: 'DZLF',
    worstMatch: 'DRLF',
    advice: '爱一个人没错，但别把自己爱没了。维持恋爱之外的社交和爱好，才能让感情更长久。',
  },
  GZLY: {
    code: 'GZLY',
    name: '醋王',
    engName: 'SOUR',
    cnSlang: '柠檬精 / 吃醋达人',
    tagline: '我不是在吃醋，我是在喝醋',
    emoji: '🍋',
    color: '#FFD700',
    wasteLevel: 4,
    description:
      '你在恋爱中又冲又飒，独立得像个霸道总裁，但偏偏有个致命弱点：醋坛子一碰就翻。你不需要天天黏在一起，但你需要确认 TA 的心里只有你。一旦嗅到"威胁"，你就会炸毛——先是冷嘲热讽，然后直接质问，最后赌气不说话。你的醋，比山西老陈醋还浓。',
    traits: [
      'TA 多看别人一眼你就能写一部悬疑小说',
      '嘴上说"我不在意"，手已经在翻 TA 的关注列表',
      '吃醋的时候特别能说，平时倒话不多',
    ],
    catchphrases: ['"你和 TA 什么关系？"', '"哦，随便你（转身偷偷查对方主页）"', '"我没生气，我只是在想一些事情"'],
    bestMatch: 'GRNF',
    worstMatch: 'GRLF',
    advice: '醋意的本质是不安全感。与其盯着对方的社交动态，不如想想你自己值得被爱的理由——很多的。',
  },
  GZLF: {
    code: 'GZLF',
    name: '海王 / 浪子',
    engName: 'WILD',
    cnSlang: '海王 / 海后',
    tagline: '爱得热烈，走得潇洒，鱼塘永远在扩建',
    emoji: '🏄',
    color: '#00CED1',
    wasteLevel: 3,
    description:
      '你享受恋爱的过程，但不会被恋爱绑架。你主动出击、敢爱敢恨、有情绪就表达、要空间就要空间，而且完全不会患得患失——因为你知道，你值得被爱，如果这段不行，下一段也不会差。你是恋爱场上的弄潮儿，唯一的问题是：你有时候走得太潇洒了，留下对方一脸懵，鱼塘里的 TA 们还在排队等你回复。',
    traits: [
      '追人的时候像开了涡轮增压',
      '说分就分，绝不拖泥带水',
      '前任 + 暧昧对象数量可能需要用两只手来数',
    ],
    catchphrases: ['"来嘛，有什么不敢的"', '"算了，不开心就换一个"', '"人生苦短，不要在一棵树上吊死"'],
    bestMatch: 'DZNF',
    worstMatch: 'DRNY',
    advice: '潇洒是你的魅力，但偶尔也试试为一段关系多停留一会儿。深度的幸福，值得你放慢脚步。',
  },
  GRNY: {
    code: 'GRNY',
    name: '卑微战士',
    engName: 'DUST',
    cnSlang: '尘埃爱人 / 卑微人',
    tagline: '把自己低到尘埃里，还觉得尘埃嫌弃我',
    emoji: '🪖',
    color: '#8B7355',
    wasteLevel: 5,
    description:
      '你在恋爱中永远在付出，而且是那种默默的、不求回报的、把委屈吞进肚子里的付出。你明明很主动，但你的主动全都花在了"讨好"上——帮 TA 做这做那，TA 不开心你比 TA 还急，但你从来不表达自己的不满。你很黏人，又极度缺乏安全感，总觉得自己不够好、配不上对方。你是恋爱中的"i人战士"——冲锋陷阵，但声音全消了。',
    traits: [
      'TA 发脾气你先道歉，不管是不是你的错',
      '半夜睡不着在想"TA 是不是觉得我烦了"',
      '付出了 99 分却因为那 1 分没做好而自责一整天',
    ],
    catchphrases: ['"没事没事，是我不好"', '"你要是觉得我烦就说，我可以改"', '"（内心 OS）TA 是不是已经不爱我了…"'],
    bestMatch: 'GZLF',
    worstMatch: 'DZLY',
    advice: '你的温柔和付出值得被珍惜，而不是被消耗。学会把对自己的善意至少调到和对别人一样的音量。',
  },
  GRNF: {
    code: 'GRNF',
    name: '舔狗',
    engName: 'SIMP',
    cnSlang: 'TG（舔狗）/ 狗系',
    tagline: '你骂我我汪汪叫，你打我我摇尾巴',
    emoji: '🐕',
    color: '#DEB887',
    wasteLevel: 4,
    description:
      '你和「卑微战士」很像，但你多了一份可贵的佛系——你虽然无条件付出，但不会因此焦虑到失眠。你就是单纯地、快乐地、忠诚地爱着对方。你主动、隐忍、黏人，但心态出奇地稳。别人说你舔，你笑笑说"我乐意啊"。你是恋爱中的金毛犬：忠诚、热情、怎么打都不记仇。',
    traits: [
      '"TA 开心我就开心"不是嘴上说说，是真的',
      '被放鸽子也能自我安慰"TA 可能真的有事"',
      '朋友都劝你清醒点，你：汪',
    ],
    catchphrases: ['"没关系！你忙你的！"', '"我等你，多久都行"', '"你开心就好，真的"'],
    bestMatch: 'GZLY',
    worstMatch: 'GZNY',
    advice: '善良是你最大的优点，但善良不等于没有底线。记住：你值得被同等对待。',
  },
  GRLY: {
    code: 'GRLY',
    name: '钓系大师',
    engName: 'BAIT',
    cnSlang: '绿茶 / 钓系',
    tagline: '我不是在恋爱，我在下棋',
    emoji: '🎣',
    color: '#9370DB',
    wasteLevel: 3,
    description:
      '你是恋爱场上的战略家。你会主动出击，但绝不盲目；你有情绪但选择按住不表——因为在你看来，"暴露情绪等于暴露弱点"。你享受独立空间，同时对这段关系保持高度警惕。你的若即若离让对方上头，你的克制让对方猜不透。你不是不爱，你只是……在用最安全的方式爱。',
    traits: [
      '回消息速度永远比对方慢一点点，刚好让 TA 着急',
      '偶尔甩一个甜蜜炸弹，然后迅速恢复高冷',
      '对方越上头你越冷静，但对方一冷你就慌了',
    ],
    catchphrases: ['"嗯"（意思是我很在意但我不说）', '"忙"（在刷手机）', '"随你吧"（其实有标准答案）'],
    bestMatch: 'DZNF',
    worstMatch: 'GRNY',
    advice: '博弈也许能赢得一时，但真诚才能赢得一个人。试着把内心的柔软展示出来，天不会塌。',
  },
  GRLF: {
    code: 'GRLF',
    name: '正常人',
    engName: 'SANE',
    cnSlang: 'NPC / 清醒派',
    tagline: '理论上存在的生物',
    emoji: '😎',
    color: '#4CAF50',
    wasteLevel: 1,
    description:
      '恭喜你，你是整个废物图鉴里最不像废物的存在。你在恋爱中主动但不过火，有情绪但选择理性处理，享受亲密也尊重独立，对这段关系有安全感但不盲目。简直是恋爱教科书级别的选手。唯一的问题是：你来做恋爱废物测试干嘛？是来审判别人的吗？',
    traits: [
      '喜欢就说，不喜欢也说，不内耗',
      '恋爱之外有完整的自我和社交',
      '能跟 TA 好好沟通，不用猜，不用作',
    ],
    catchphrases: ['"有什么事我们聊聊？"', '"我需要一些自己的时间，不是不爱你"', '"我也会生气，但咱们不靠猜。"'],
    bestMatch: 'DRNF',
    worstMatch: 'GZNY',
    advice: '你已经很好了。唯一的建议是偶尔允许自己犯一点傻，恋爱嘛，太理性了也少了点味道。',
  },

  DZNY: {
    code: 'DZNY',
    name: '定时炸弹',
    engName: 'TICK',
    cnSlang: '内爆党 / 闷葫芦',
    tagline: '表面风平浪静，内心已经核爆十七次了',
    emoji: '💣',
    color: '#DC143C',
    wasteLevel: 5,
    description:
      '你是整个图鉴里最"闷"的爆炸型选手。你不主动、不争取、不挽留，但你有情绪，而且这些情绪全都堆在心里——像一个计时器一直在走。你黏人又缺安全感，所以不满的弹药越攒越多，直到某一天某一个微不足道的小事成了导火索……BOOM。事后对方一脸懵："你怎么突然发这么大火？"你："突然？我忍你三个月了。"',
    traits: [
      '平时看起来脾气超好，其实只是在充能',
      '爆发的时候把从认识到现在的事全翻出来',
      '炸完又后悔，后悔完又憋着，开始下一轮充能',
    ],
    catchphrases: ['"没事。"（第 47 次说没事）', '"你自己想想你做了什么。"', '"我不是今天才生气的！！！"'],
    bestMatch: 'GRLF',
    worstMatch: 'DRLF',
    advice: '情绪不是洪水猛兽，小水流比决堤好控制得多。试试每周设一个"坦白时间"，把小事在它还小的时候说出来。',
  },
  DZNF: {
    code: 'DZNF',
    name: '林黛玉',
    engName: 'WILT',
    cnSlang: '林妹妹 / 玻璃心',
    tagline: '风吹一下我就能哭半小时',
    emoji: '🌸',
    color: '#FFB6C1',
    wasteLevel: 4,
    description:
      '你是恋爱中的多愁善感代言人。你不会主动追人，但一旦进入恋爱，你就变得特别敏感、特别能哭、特别黏。好在你心态上是佛系的——你不会疑神疑鬼，你只是……很容易被感动，也很容易被伤到。一首歌、一句话、一个眼神都能让你红了眼眶。你的眼泪就像 Wi-Fi 信号一样，永远是满格的。',
    traits: [
      '看恋爱综艺能哭，看 TA 发的表情包也能哭',
      'TA 说"你最近辛苦了"能让你感动一整天',
      '虽然总是哭，但不记仇，哭完就翻篇',
    ],
    catchphrases: ['"我没哭……是风吹的……"', '"你怎么对我这么好（哭）"', '"我也不知道为什么就哭了……"'],
    bestMatch: 'GRLF',
    worstMatch: 'DRLY',
    advice: '你的感受力是一种天赋。但别让眼泪代替了语言——比起哭，说出"我需要什么"更有力量。',
  },
  DZLY: {
    code: 'DZLY',
    name: '刺猬',
    engName: 'OUCH',
    cnSlang: '傲娇 / 口是心非',
    tagline: '别靠近我！……你怎么真走了？',
    emoji: '🦔',
    color: '#A0522D',
    wasteLevel: 4,
    description:
      '你的恋爱模式是一个经典矛盾体：你渴望爱但害怕被伤害，所以你用"不主动+保持距离"当作铠甲。但你又极度缺乏安全感，所以当对方真的保持距离时，你又慌了。更要命的是，你一慌就不会好好说话，而是炸毛攻击——把最亲近的人推得最远。然后你一个人在角落里后悔，但嘴上死也不认。',
    traits: [
      '对方靠近你就后退，对方后退你就焦虑',
      '嘴上说着"你走吧"，心里在喊"你别走"',
      '受伤了不会示弱，而是发脾气把人推开',
    ],
    catchphrases: ['"随便你"（求你别随便）', '"我不需要任何人"（需要，很需要）', '"你走啊"（别走别走别走）'],
    bestMatch: 'GRNF',
    worstMatch: 'DRLY',
    advice: '那些被你推开的人，不一定都会转身离开。但他们需要你告诉他们："我其实很害怕。"',
  },
  DZLF: {
    code: 'DZLF',
    name: '猫系恋人',
    engName: 'MEOW',
    cnSlang: '猫猫 / 猫咪学',
    tagline: '叫你别碰我，没叫你走啊',
    emoji: '🐱',
    color: '#E6A8D7',
    wasteLevel: 3,
    description:
      '你就是恋爱中的猫：高冷是你的默认状态，但偶尔也会过来蹭一下。你不会主动追人，需要大量个人空间，没什么安全感焦虑——但你有脾气。开心的时候甜到炸，不开心的时候全世界都别惹你。你的恋人必须学会一项技能：分辨你是真的想独处，还是假装想独处其实在等 TA 来哄。',
    traits: [
      '被追的时候嫌人烦，不被追了又觉得寂寞',
      '心情好了会突然撒娇，对方会被吓一跳',
      '别人说你高冷，其实你只是懒得热情',
    ],
    catchphrases: ['"别烦我"（过 10 分钟来找我）', '"随便"（我有标准答案但懒得说）', '"哼"（其实被哄了很开心）'],
    bestMatch: 'GZNF',
    worstMatch: 'GZNY',
    advice: '猫的魅力在于偶尔的亲近让人加倍珍惜。但别让"高冷"变成"冷漠"，TA 需要确认你爱 TA。',
  },

  DRNY: {
    code: 'DRNY',
    name: '透明人',
    engName: 'GHOST',
    cnSlang: '小透明 / 工具人',
    tagline: '我的存在感和我的安全感一样低',
    emoji: '👻',
    color: '#B0C4DE',
    wasteLevel: 5,
    description:
      '你是恋爱中最"隐形"的存在。你不主动、不表达、不争吵，但你内心其实特别想黏着对方，也特别害怕被抛弃。问题是你把这些全藏起来了。你像一个透明的影子，安安静静跟在对方身后，从不出声，但一直在那。你内心的戏比谁都多，但嘴巴比谁都紧。最怕的一天是：TA 终于说"我觉得你根本不在乎我"——而你明明为 TA 失眠了一百个夜晚。',
    traits: [
      '想对方想到失眠，但绝对不会主动发消息',
      '对方问"你在想什么"，永远回答"没想什么"',
      '默默为对方做了很多事，但从来不提',
    ],
    catchphrases: ['"嗯。"', '"都行。"', '"（已经想了三百字但最后发出去的只有一个表情包）"'],
    bestMatch: 'GZNY',
    worstMatch: 'DRLF',
    advice: '爱不说出口，对方就收不到。你不需要变成另一个人，但请至少让 TA 知道：你在。',
  },
  DRNF: {
    code: 'DRNF',
    name: '树懒',
    engName: 'SLOW',
    cnSlang: '摆烂党 / 佛系恋人',
    tagline: '恋爱这件事急不来的……大概……三年后见？',
    emoji: '🦥',
    color: '#90EE90',
    wasteLevel: 3,
    description:
      '你是恋爱中的慢节奏选手。你不主动、情绪稳定、喜欢依赖但不焦虑——总之一切都是慢慢来。你的恋爱时间线比别人长三倍：别人暧昧两周你暧昧两月，别人牵手第三天你牵手第三月。你不是不爱，你只是……所有感情都像被设了 0.5 倍速。',
    traits: [
      '被追的时候答应也慢，拒绝也慢，对方不知道你到底什么意思',
      '在一起了也不着急见家长、不着急秀恩爱',
      '对方急死了你还在说"慢慢来嘛"',
    ],
    catchphrases: ['"不着急……"', '"慢慢来嘛"', '"（已读，三小时后回复）嗯嗯好"'],
    bestMatch: 'GRLF',
    worstMatch: 'GZNY',
    advice: '慢节奏没有错，但要确认对方也 OK。不是每个人都能等——适时给一个明确的信号，是对 TA 的尊重。',
  },
  DRLY: {
    code: 'DRLY',
    name: '仙人掌',
    engName: 'DRY',
    cnSlang: '沙漠系 / 冷淡风',
    tagline: '三年浇一次水就够了',
    emoji: '🌵',
    color: '#228B22',
    wasteLevel: 4,
    description:
      '你是恋爱沙漠中最顽强的物种。你不主动追、不表达情绪、不黏人、还疑神疑鬼。你把自己包裹得严严实实，外面全是刺，里面其实柔软——但没人能碰到里面。你在恋爱中像一株仙人掌：自给自足，几乎不需要任何人的灌溉。问题是……你确定你是在恋爱？不是在单人修仙？',
    traits: [
      '可以一周不联系对方也不觉得有什么问题',
      '对方主动靠近时第一反应是后退',
      '偶尔怀疑对方的动机，但懒得去求证',
    ],
    catchphrases: ['"我一个人挺好的"', '"你去忙你的"', '"……（三天后）你说什么？"'],
    bestMatch: 'GZNF',
    worstMatch: 'GZNY',
    advice: '你的独立令人敬佩，但恋爱的意义就在于让另一个人走进来。偶尔拔掉一根刺，让 TA 碰碰你。',
  },
  DRLF: {
    code: 'DRLF',
    name: '已读不回',
    engName: 'SEEN',
    cnSlang: '不婚党 / EMO 离线',
    tagline: '看到了。然后呢？',
    emoji: '✅',
    color: '#708090',
    wasteLevel: 5,
    description:
      '你是恋爱废物图鉴里的终极形态——不是因为你在恋爱中表现很废，而是你根本不怎么参与恋爱。你不主动、不表达、不黏人、不焦虑，对感情的态度就像刷到一条推送：已读，不回。你不是不能爱，你只是觉得恋爱这件事的性价比太低——要花时间、花精力、还要处理情绪？算了算了。你的废，是哲学层面的废。',
    traits: [
      '对方表白你可能要想三个工作日才回复',
      '恋爱状态约等于单身状态，对方经常怀疑你俩是不是在一起',
      '分手了可能也要过两周才有实感',
    ],
    catchphrases: ['"嗯。"', '"哦。"', '"好（句号）"'],
    bestMatch: 'GZNY',
    worstMatch: 'DRNY',
    advice: '你的超然是一种能力，但偶尔也值得为一个人心动一下。人生已经够硬核了，软一次不丢人。',
  },

  // ===== 隐藏人格 =====
  LIMBO: {
    code: 'LIMBO',
    name: '骑墙党',
    engName: 'LIMBO',
    cnSlang: '薛定谔 / 端水大师',
    tagline: '每个维度都恰好一半，测完反而更迷茫',
    emoji: '⚖️',
    color: '#6B7280',
    wasteLevel: 3,
    description:
      '恭喜你触发了隐藏人格——你在四大维度里有至少两个恰好打平，像一杯被精确端平的水。你不是没有态度，而是态度都被你自己和稀泥了：想主动又怕上头，想表达又怕过火，想黏又怕烦，想疑又嫌累。你在每一道题前都在犹豫，做完测试反而比做之前更迷茫了。这本身，就是一种非常独特的"废"。',
    traits: [
      '做任何题都要在两个选项之间反复横跳',
      '别人的结果是四个字母，你的结果是四个问号',
      '既不热烈也不冷漠，活成一张 B 选项合集',
    ],
    catchphrases: ['"其实……都行？"', '"我也不知道我是怎么想的"', '"你说得对，但你说得也对"'],
    bestMatch: 'GRLF',
    worstMatch: 'GZNY',
    advice: '中立不是缺点，但如果所有维度都中立，往往意味着你还没真正允许自己想要什么。试着对一件小事说出"我就是想这样"，不解释、不平衡。',
  },
};

// ===== 隐藏叠加标签 =====
export interface HiddenTitle {
  id: string;
  name: string;
  description: string;
}

export const hiddenTitles: Record<string, HiddenTitle> = {
  retractMaster: {
    id: 'retractMaster',
    name: '撤回大师',
    description: '恭喜你，你发消息的过程比写毕业论文还纠结——撤回键被你按出了包浆。',
  },
  nightTalkChamp: {
    id: 'nightTalkChamp',
    name: '夜谈冠军',
    description: '凌晨三点，别人在睡觉，你在心里给 TA 写小作文。你内心的戏，值得一个艾美奖。',
  },
  momentsArchaeologist: {
    id: 'momentsArchaeologist',
    name: '朋友圈考古学家',
    description: '你能从 TA 三年前点的一个赞里，挖出一整段可疑的前情提要。建议转行做侦探。',
  },
  schrodingerEx: {
    id: 'schrodingerEx',
    name: '薛定谔的前任',
    description: '你心里一直压着一个没放下的人——说放下了但没真放下，说没放下又不想承认。这个人既存在又不存在，像量子态。',
  },
  electronicVendor: {
    id: 'electronicVendor',
    name: '电子乙方',
    description: '地点让对方定、道歉你先说、消息你先发——你在这段关系里几乎承担了全部的"主动成本"。打工都没你这么卷。',
  },
  daydreamer: {
    id: 'daydreamer',
    name: '空想家',
    description: '你纯单身，但这不妨碍你单方面地把恋爱的废全都演一遍。在心里，你已经谈了一百场。',
  },
};

// 旧 API 兼容：单一的隐藏称号（等价于「撤回大师」）
export const hiddenTitle = {
  name: hiddenTitles.retractMaster.name,
  description: hiddenTitles.retractMaster.description,
  threshold: 1,
};
