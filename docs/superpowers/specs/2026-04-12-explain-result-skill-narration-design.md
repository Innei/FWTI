# explain-result skill · 叙事层增厚设计

**Date:** 2026-04-12
**Status:** Draft, pending implementation plan
**Scope:** `.claude/skills/explain-result/SKILL.md` + `scripts/explain-result.ts`（Claude 端 skill / bun 脚本）

## 1 · 背景

`explain-result` skill v1 已落地：bun 脚本复用仓内 codec + scoring + predicates，把分享链接解码为结构化 JSON；SKILL.md 指引 Claude 叙述。v1 的叙述停在"梗图式分数表 + 一句定性"——与 v1 产品结果页的"复读机"相似，对读者无增量。

作者（仓主）意图：skill 的输出不应止于"反推到哪一型"，而应承载**为何、依据何在、原文何人**三层内容。反推本身无意义；**以反推为线索把答题者的模式与心理测量学构念对齐**才有意义。

（注：`docs/superpowers/plans/2026-04-12-result-narrative-refactor.md` 是结果页 runtime 叙事层的改版，与此 skill 叙事模板互不干涉。此 spec 只动 Claude-facing skill + 其驱动脚本。）

## 2 · 目标

改完之后，任何一次 `bun scripts/explain-result.ts <url>` 跑完由 Claude narrate 的输出，须满足以下三条硬指标：

1. **参考文献** · 四维解剖各段须引出对应学理锚（ECR-R / ERQ / BIS-BAS / Gable 或其衍生）之作者 + 年份，隐藏人格触发若命中则引 `predicates.ts` 注释或 DRAFT.md 中的机制描述。
2. **详细展开** · 每维一段（non-trivial prose, 非 bullet 罗列），包含「本例 ratio + 2–3 条决定性 evidence + 学理锚 + 为何此用户答题 cluster 正映此构念」。
3. **依据可追溯** · 每一句"为何是 X"之断言须指回具体题 id（perQuestion 里的 Qxx）、语义锚（SEMANTIC.*）或触发条件表达式，读者可逐条复核。

## 3 · 非目标

- **不改** `src/logic/resultNarrative.ts` 及 `ResultPage.tsx` —— 那是产品结果页的 runtime 叙事层，自走一条 plan（见 2026-04-12-result-narrative-refactor.md）。
- **不改** `predicates.ts` / `scoring.ts` / `codec.ts` —— 触发判定与分数语义维持不变；此处只读不写。
- **不新增** `src/data/citations.ts` 类引文数据文件 —— DRAFT.md §「学术依据」既是 single source of truth，复制即漂移。
- **不追求** 自动化构念聚类（Approach C 的"Q12+Q13+Q54 是 suppression cluster"是写作手法，由 Claude 现写现聚，不要 script 预做）。

## 4 · 叙事模板（五节）

### §1 · 结论

一句：`{code} · {personality.name}（{family} 家）· {status} 语境 · {hidden 覆盖 | 无隐藏覆盖}`。

### §2 · 四维解剖（主体）

四节，各一段 prose + evidence bullets，统一结构：

```
### {dim 中文名} {DIM} = {ratio}（{极性字}·{极性中文}）· {n} 题

- **Q{id}** {anchor 名或短标}「{选项原文}」· {delta}
- **Q{id}** ... · {delta}
- ({2–4 条决定性 evidence; 按 |delta| 降序; 只列足以影响分类的题)

**学理**：{dim} 锚于 {作者 (年份)} 之 {构念英文名}。{一到三句：此构念怎么讲 / 本例 evidence cluster 为何正映此构念 / 若有反向 evidence 如何解读}。
```

**排序规则**：§2 内四维顺序按 `|ratio|` 从大到小（让"最决定性"的维度先出场），不按 GD/ZR/NL/YF 字母序。

### §3 · 归格推演

一段技术 recap：复述 `scoring.ts::classify16` 的不对称符号表（照抄代码块），再把本例 ratio 代入，给出 16-grid code，引一句 personality 卡的核心人格语，**并说明人格卡语如何落在 §2 的 evidence 上**。

### §4 · 触发审计

两部分：

1. **隐藏人格** · 若命中：列出命中 trigger 的条件（`predicates.ts` 原表达式）+ 引文或注释中的机制解释。若未命中：按"最接近成立的两条 near miss"原则，列出"哪两条差在哪里"，并指明**达到此 trigger 需要改哪几题**（帮作者审题时校对边界）。
2. **叠加标签** · 命中项列出 trigger 条件与对应 semanticIds；未命中项简略一行。结构性不可判的标签（当前仅**退退退** · retreatCount session-only）须明示其不可判性，不得臆造。

### §5 · 综合与局限

- 一段综合画像（~80–120 字）· 把四维 + 触发合成一句整体叙事，解释"为何是此 code 而非相邻 code"（即 §4 near miss 的对位差）。
- **一句**局限声明 · 格式："FWTI 借 ECR-R / ERQ / BIS-BAS / Gable 维度结构，未经信效度验证，非诊断工具，仅供自嘲。" 或等价改写。**不得扩成段**。

（此条是 v2 相对最初草案的唯一 trim：早先版本把 §5 局限声明写成一整段，含中文 ECR-R 版本引用 + 建议转正规量表；本 spec 明确压至一句。）

## 5 · script 变更

`scripts/explain-result.ts` 增一步：读 `DRAFT.md` 的 `## 学术依据` 段落（粗约第 775–830 行），解析出按维度归属的 citation 原文段，随 JSON 输出一并返回。Claude 取用即可，不再需要每次 Read DRAFT.md。

### 新增 JSON 字段

```ts
{
  // ... 现有字段
  citations: {
    GD: string[]  // 数组，每项一条 markdown 格式的 citation 原文（作者 年份 + 说明）
    ZR: string[]
    NL: string[]
    YF: string[]
    hidden: Record<string, string>  // key = hidden code (MAD/RAT/...), value = 注释中的机制一句（可空）
    disclaimer: string  // DRAFT.md §「郑重声明」一句，原文抽取
  }
}
```

### 解析方式

- 从 `## 学术依据` header 起至下一个 `##` 或文件尾，切为 section。
- 以 section 内的 `### {维度名}` 或"以下文献 / 四维分别 ..."作锚拆分（精确锚定见实现时 DRAFT.md 真实结构，不在 spec 预设）。
- hidden 机制一句从 `predicates.ts` 对应 trigger 上方的块注释抽取（regex 匹配 `/^\s*\/\/ {CODE} · .*$/m` 及紧随的注释行）。
- 解析失败（DRAFT.md 结构漂移）不阻断主流程：citations 降级为空对象，skill 指引 Claude fallback 到实时 Read DRAFT.md。

## 6 · SKILL.md 变更

- 描述字段保持不变（已合 writing-skills 规范：Use-when 形式、< 500 字符、无 workflow 摘要）。
- Body 新增一节「叙事模板」照搬 §4 的五节结构，给出字段填法与排序规则。
- 新增一节「引文来源优先级」：
  1. JSON.citations.{dim} · 若存在即用
  2. DRAFT.md §「学术依据」· 若 citations 字段空则主动 Read
  3. personalities.ts 的 `认真版解读` bullet · 仅作补充，非主引
  4. 不得自己编造作者或年份
- 「narration 约束」节新增三条硬规则：
  - 不得把 retreatCount / hiddenCount 不可还原性遮掉（必须在 §4 明示）
  - 不得把 v1 legacy link 套 v0.4 规则解释（沿用 v1 版的 early-return）
  - §5 局限声明不得超过一句
- 保留现有 voice guidance（文言 / 半文言 / 自嘲 > 攻击）。

## 7 · 验收样本

以本日 GRNY crush 例（`v2.c.MTAzMTAxMjIyMTExMzAxMDAwMTIyMi0xLS0tLS0tLS0tLS0tLS0tLS0xMTIxMjExMC0tLS0tLS0tLTEtMi0tLS0tLS0t`）为 fixture：

- §1 须含 "GRNY · 卑微战士 · crush · 无隐藏覆盖"
- §2 四维皆须有 ≥2 条 evidence 并各自引一个维度锚（ECR-R / ERQ / BIS-BAS 任一）
- §4 须识别 **LIMBO near miss**（YF 差 0.47）**并**说明达标所需之题
- §4 须识别 **朋友圈考古学家** 命中
- §4 须标注 **退退退** 结构性不可判
- §5 局限声明一句，不成段
- 全文字数目标 1000–1400

## 8 · 开放项

无。五节模板与一句局限声明为 approved shape。

## 9 · 后续

写 implementation plan 入 `docs/superpowers/plans/2026-04-12-explain-result-skill-narration.md`，分两个 chunk：

1. 脚本增 citations 字段（含 DRAFT.md 解析 + fallback）
2. SKILL.md 改版 + 样本回归（以 §7 fixture 跑一次人工验收）
