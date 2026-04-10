import { createSignal } from 'solid-js';
import type { Personality } from './data/personalities';

export const GITHUB_REPO_URL = 'https://github.com/Innei/fwti';
export const FWTI_SITE_URL = 'https://fwti.innei.dev';

/**
 * v0.4 · 题库总量不再是静态常量——每状态的路径长度不同，单路径更因 follow-up
 * 动态变化。对外文案统一走此常量。进度条基于当前路径的实时长度
 * （`path()` 从 `buildQuestionPath` 派生）。
 *
 * 当前可达上下界（含 META · 2026-04 后）：
 *   - dating     31..38  (base 31 + follow-up 0..7)
 *   - ambiguous  30..37  (base 30 + follow-up 0..7)
 *   - crush      31..39  (base 31 + follow-up 0..8)
 *   - solo       31..39  (base 31 + follow-up 0..8)
 */
export const QUIZ_RANGE_TEXT = '约 30 至 39 题';

/** 当前作答状态。key=题 id，value=选项索引。 */
export const [answers, setAnswers] = createSignal<Record<number, number>>({});

/**
 * v0.3 · 答题过程中的"改答次数"。用户把一道已答主线题的答案换到另一个选项时递增一次。
 * 用于触发「退退退」隐藏标签（≥3 次即解锁）。
 *
 * 只在当前会话内有效：刷新页面或通过分享链接进入 /result/<hash> 时都会回落到 0——这就是
 * 故意的，因为「退退退」是一个描述答题过程的 meta 标签，不该跟着分享链接传给观众。
 */
export const [retreatCount, setRetreatCount] = createSignal(0);

/** 首页人格卡预览弹窗 · 全局单例（HomePage 点击卡片触发、Layout 内 PreviewModal 消费）。 */
export const [previewDetail, setPreviewDetail] = createSignal<Personality | null>(null);
