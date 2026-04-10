# 首页 Hero 文案重构 — MBTI / FWTI 换代叙事

**日期：** 2026-04-11  
**状态：** 已定稿（实现前需用户确认本文件无修改）

## 背景

首页 `home-hero` 当前以「自嘲型恋爱人格测试」为主标题，信息量偏说明。产品希望主视觉采用「MBTI 已过时、FWTI 已到来」的梗式换代表达，与全站娱乐向、自嘲 tone 一致。

## 范围

- **仅** `src/components/HomePage.tsx` 中 hero 区块的**标题层级与文案**（eyebrow / 主标题 / 降级后的副标题 / lede / CTA 不动除非为排版所必需）。
- **不**改题库、编码、分享链、`QuizPage`/`ResultPage`。
- **不**改 `pages/+Head.tsx`（title、OG、description 维持现状）；若日后需要 SEO 与 hero 语气对齐，另起 small task。

## 定稿文案与层级

| 角色 | 元素建议 | 文案 |
|------|-----------|------|
| Eyebrow | 现有 `div.eyebrow` | `Fèiwù Type Indicator`（不变） |
| 主标题 | **唯一** `h1`，可两行（例如 `<br />` 或两行 `span` + CSS） | 第一行：`MBTI 已经过时了`<br>第二行：`FWTI 已经来了` |
| 副标题 | `h2` 或 `p`， class 与现有 `home-title` 区分（如 `home-subtitle`），视觉上小于 `h1` | `自嘲型恋爱人格测试` |
| Lede | 现有 `p.home-lede` | **原文保留**：「约 30–37 道灵魂拷问，四维交叉分析，为君精准定位此生爱情之废料品类。」 |
| 操作区 | `home-actions` | 不变 |

## 版式与可访问性

- 全页保持 **单个 `h1`**，避免双主标题。
- 副标题语义为「这是什么」，补足 `h1` 的梗向表述；朗读顺序：eyebrow → h1 → 副标题 → lede → 按钮。
- 样式：在 `src/styles`（或当前 home 样式所在文件）中为两行 `h1` 与副标题增加必要间距与字号阶梯，**不**引入新设计体系；与现有 `home-title` / `home-lede` 视觉层级协调即可。

## 验收

- 首页 hero：`h1` 为两句换代梗，副标题为「自嘲型恋爱人格测试」，lede 与 CTA 与现网一致。
- 窄屏下两行 `h1` 可读、不溢出（必要时 `line-height` / `font-size` 微调）。
- `pnpm build` 通过。

## 自检记录

- 无 TBD。
- 与「不改 +Head」一致；无矛盾。
- 范围单一可实现。
