import { createSignal, For, Show } from 'solid-js';
import { ArrowRight, Check } from 'lucide-solid';
import { personalities } from '../copy/personalities';
import { resultPageCopy } from '../copy/ui';
import type { Result } from '../logic/scoring';
import { getFamilyTheme, getFamily } from '../logic/family';
import { getCompatibilityOutcome } from '../logic/compatibility';
import Portrait from './Portrait';
import { ShareImageModal } from './ShareImageModal';
import { ResultNav } from './Nav';
import { ResultReferences } from './ResultReferences';
import { setPreviewDetail, FWTI_SITE_URL, GITHUB_REPO_URL } from '../state';
import { trackExplainAiClick, trackShareImageOpen } from '../telemetry/client';

const EXPLAIN_SKILL_README_ANCHOR = `${GITHUB_REPO_URL}#explain-result-skill`;

function evidenceFacetLabel(facet: string): string {
  switch (facet) {
    case 'initiative':
      return resultPageCopy.evidenceFacetLabels.initiative;
    case 'expression':
      return resultPageCopy.evidenceFacetLabels.expression;
    case 'closeness':
      return resultPageCopy.evidenceFacetLabels.closeness;
    case 'security':
      return resultPageCopy.evidenceFacetLabels.security;
    default:
      return resultPageCopy.evidenceFacetLabels.default;
  }
}

function axisPercent(value: number): string {
  return `${Math.round(Math.abs(value) * 100)}%`;
}

function axisPole(value: number, positive: string, negative: string): string {
  if (value >= 0.15) return positive;
  if (value <= -0.15) return negative;
  return '中';
}

/** Uppercase English line with each character in a fixed-width cell (visual grid). */
function ResultEngLine(props: { text: string }) {
  return (
    <p class="result-eng" aria-label={props.text}>
      <span class="result-eng-chars" aria-hidden="true">
        <For each={[...props.text]}>
          {(ch) => <span class="result-eng-char">{ch}</span>}
        </For>
      </span>
    </p>
  );
}

function ResultCodeLine(props: { text: string }) {
  return (
    <div class="result-code" aria-label={props.text}>
      <span class="result-code-chars" aria-hidden="true">
        <For each={[...props.text]}>
          {(ch) => <span class="result-code-char">{ch}</span>}
        </For>
      </span>
    </div>
  );
}

export function ResultPage(props: {
  result: Result;
  /** 此结果是否走 v0.3 legacy scoring（旧分享链接）。渲染一条提示条并引导重测新版。 */
  isLegacy?: boolean;
  /** 分享链接 hash，用于动态 QR 码生成。 */
  hash?: string;
  onRestart: () => void;
}) {
  const [shareOpen, setShareOpen] = createSignal(false);
  const [explainCopied, setExplainCopied] = createSignal(false);
  const r = () => props.result;

  const handleExplainWithAi = async () => {
    const shareUrl = props.hash
      ? `${FWTI_SITE_URL}/result/${props.hash}`
      : FWTI_SITE_URL;
    trackExplainAiClick(props.result, props.hash);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      /* 剪贴板失败不阻断跳转 */
    }
    setExplainCopied(true);
    window.setTimeout(() => setExplainCopied(false), 2400);
    if (typeof window !== 'undefined') {
      window.open(EXPLAIN_SKILL_README_ANCHOR, '_blank', 'noopener,noreferrer');
    }
  };
  const p = () => r().personality;
  const matches = () => getCompatibilityOutcome(p().code);
  const family = () => getFamily(p().code);
  const theme = () => getFamilyTheme(p().code);

  return (
    <div
      class="page result-page"
      data-family={family()}
      style={{
        '--fwti-accent': theme().color,
        '--fwti-accent-tint': theme().tint,
      }}
    >
      <ShareImageModal
        open={shareOpen()}
        onClose={() => setShareOpen(false)}
        result={props.result}
        hash={props.hash}
      />
      <ResultNav
        onRestart={props.onRestart}
        onShareImage={() => {
          trackShareImageOpen(props.result);
          setShareOpen(true);
        }}
      />

      <Show when={props.isLegacy}>
        <div class="legacy-banner" role="status">
          <div class="legacy-banner-inner">
            <span class="legacy-banner-badge">{resultPageCopy.legacyBanner.badge}</span>
            <span class="legacy-banner-text">
              {resultPageCopy.legacyBanner.text}
            </span>
            <button
              type="button"
              class="legacy-banner-cta"
              onClick={props.onRestart}
            >
              <span>{resultPageCopy.legacyBanner.cta}</span>
              <span class="btn-arrow" aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </Show>

      <div class="result-container">
        {/* Hero */}
        <section class="result-hero">
          <div class="hero-eyebrow">
            {resultPageCopy.heroEyebrow(r().isHidden)}
          </div>
          <div class="result-identity">
            <h1 class="result-name">{p().name}</h1>
            <ResultEngLine text={p().engName} />
            <Show when={p().cnSlang}>
              <p class="result-slang">{p().cnSlang}</p>
            </Show>
            <ResultCodeLine text={r().displayCode} />
            <Show when={r().isAll && r().closestPersonality}>
              <p class="result-tied-note">
                {resultPageCopy.tiedNote(r().tiedDimensions.length)}
                <span class="result-tied-closest">
                  {' '}
                  {r().closestCode} · {r().closestPersonality.name}
                </span>
              </p>
            </Show>
          </div>
          <Portrait code={p().code} size={320} class="result-hero-portrait" />
          <p class="result-tagline">「{p().tagline}」</p>
          <div class="waste-meter">
            <span class="waste-meter-label">{resultPageCopy.wasteLabel}</span>
            <div class="waste-meter-bar">
              <For each={Array.from({ length: 5 })}>
                {(_, i) => (
                  <span
                    class={`waste-dot ${i() < p().wasteLevel ? 'filled' : ''}`}
                  />
                )}
              </For>
            </div>
            <span class="waste-meter-num">{p().wasteLevel} / 5</span>
          </div>
        </section>

        {/* Hidden titles */}
        <Show when={r().unlockedHiddenTitles.length > 0}>
          <section class="hidden-title-section">
            <div class="section-eyebrow">{resultPageCopy.hiddenAchievementsEyebrow}</div>
            <h2 class="section-title">
              {resultPageCopy.hiddenAchievementsTitle(r().unlockedHiddenTitles.length)}
            </h2>
            <div class="hidden-title-list">
              <For each={r().unlockedHiddenTitles}>
                {(t) => (
                  <div class="hidden-title-card">
                    <span class="hidden-badge">{resultPageCopy.hiddenBadge}</span>
                    <p class="hidden-name">「{t.name}」</p>
                    <p class="hidden-desc">{t.description}</p>
                  </div>
                )}
              </For>
            </div>
          </section>
        </Show>

        {/* Dimensions */}
        <section class="result-section">
          <div class="section-eyebrow">{resultPageCopy.dimensionsEyebrow}</div>
          <h2 class="section-title">{resultPageCopy.dimensionsTitle}</h2>
          <div class="dim-list">
            <For each={r().dimensionLabels}>
              {(d) => (
                <div class="dim-bar-row">
                  <div class="dim-bar-head">
                    <span class="dim-bar-label">{d.dim}</span>
                  </div>
                  <div class="dim-bar-container">
                    <span class="dim-bar-side left">{d.labelA}</span>
                    <div class="dim-bar-track">
                      <Show when={d.valueA > 0}>
                        <div
                          class="dim-bar-fill dim-bar-fill--pole-a"
                          style={{ width: `${Math.min(d.valueA, 100)}%` }}
                        />
                      </Show>
                      <Show when={d.valueB > 0}>
                        <div
                          class="dim-bar-fill dim-bar-fill--pole-b"
                          style={{ width: `${Math.min(d.valueB, 100)}%` }}
                        />
                      </Show>
                    </div>
                    <span class="dim-bar-side right">{d.labelB}</span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>

        <Show when={r().attachmentApproximation}>
          {(attachment) => (
            <section class="result-section attachment-section">
              <div class="section-eyebrow">{resultPageCopy.attachmentEyebrow}</div>
              <h2 class="section-title">{resultPageCopy.attachmentTitle}</h2>
              <div class="attachment-summary">
                <div class="attachment-type">
                  <span class="attachment-type-label">{attachment().label}</span>
                  <span class="attachment-rule">{attachment().rule}</span>
                </div>
                <p class="attachment-copy">{attachment().summary}</p>
              </div>
              <div class="attachment-axis-list">
                <div class="attachment-axis">
                  <span class="attachment-axis-name">
                    {resultPageCopy.attachmentAxisAttachment}
                  </span>
                  <span class="attachment-axis-value">
                    {axisPercent(attachment().axis.attachment)}
                  </span>
                  <span class="attachment-axis-pole">
                    {axisPole(attachment().axis.attachment, '黏', '离')}
                  </span>
                </div>
                <div class="attachment-axis">
                  <span class="attachment-axis-name">
                    {resultPageCopy.attachmentAxisSecurity}
                  </span>
                  <span class="attachment-axis-value">
                    {axisPercent(attachment().axis.security)}
                  </span>
                  <span class="attachment-axis-pole">
                    {axisPole(attachment().axis.security, '疑', '佛')}
                  </span>
                </div>
              </div>
              <p class="attachment-disclaimer">
                {resultPageCopy.attachmentDisclaimer}
              </p>
            </section>
          )}
        </Show>

        {/* Dynamic profile */}
        <section class="result-section">
          <div class="section-eyebrow">{resultPageCopy.profileEyebrow}</div>
          <h2 class="section-title">{resultPageCopy.profileTitle}</h2>
          <div class="result-desc">
            <For each={r().narrative.profileParagraphs}>
              {(para) => <p>{para}</p>}
            </For>
          </div>
        </section>

        <section class="result-section">
          <div class="section-eyebrow">{resultPageCopy.evidenceEyebrow}</div>
          <h2 class="section-title">{resultPageCopy.evidenceTitle}</h2>
          <p class="result-evidence-summary">{r().narrative.summary}</p>
          <ul class="trait-list evidence-trait-list">
            <For each={r().narrative.evidenceTraits}>
              {(t, i) => (
                <li class="trait-item">
                  <span class="trait-num">
                    {String(i() + 1).padStart(2, '0')}
                  </span>
                  <span class="trait-text">{t}</span>
                </li>
              )}
            </For>
          </ul>
        </section>

        <Show when={r().narrative.evidenceCards.length > 0}>
          <section class="result-section">
            <div class="section-eyebrow">{resultPageCopy.signalsEyebrow}</div>
            <h2 class="section-title">{resultPageCopy.signalsTitle}</h2>
            <div class="evidence-signal-list">
              <For each={r().narrative.evidenceCards}>
                {(card, i) => (
                  <article class="evidence-signal">
                    <div class="evidence-signal-rail">
                      <span class="evidence-signal-step">
                        {String(i() + 1).padStart(2, '0')}
                      </span>
                      <span class="evidence-signal-qid">Q{card.questionId}</span>
                      <span class="evidence-signal-facet">
                        {evidenceFacetLabel(card.facet)}
                      </span>
                    </div>
                    <div class="evidence-signal-body">
                      <div class="evidence-signal-row">
                        <span class="evidence-signal-label">
                          {resultPageCopy.signalQuestionLabel}
                        </span>
                        <p class="evidence-signal-question">{card.question}</p>
                      </div>
                      <div class="evidence-signal-row evidence-signal-row--answer">
                        <span class="evidence-signal-label">
                          {resultPageCopy.signalAnswerLabel}
                        </span>
                        <blockquote class="evidence-signal-answer">
                          {card.answer}
                        </blockquote>
                      </div>
                      <div class="evidence-signal-row evidence-signal-row--note">
                        <span class="evidence-signal-label">
                          {resultPageCopy.signalNoteLabel}
                        </span>
                        <p class="evidence-signal-note">{card.note}</p>
                      </div>
                    </div>
                  </article>
                )}
              </For>
            </div>
          </section>
        </Show>

        {/* Matches */}
        <section class="result-section">
          <div class="section-eyebrow">{resultPageCopy.compatibilityEyebrow}</div>
          <h2 class="section-title">{resultPageCopy.compatibilityTitle}</h2>
          <div class="match-grid">
            <button
              type="button"
              class="match-card best"
              onClick={() =>
                setPreviewDetail(personalities[matches().best.code] ?? null)
              }
              aria-label={resultPageCopy.matchDetailAria(
                personalities[matches().best.code]?.name ?? matches().best.code,
              )}
            >
              <div class="match-card-top">
                <div class="match-card-header">
                  <div class="match-label">{resultPageCopy.bestMatchLabel}</div>
                  <div class="match-code">{matches().best.code}</div>
                  <div class="match-name">
                    {personalities[matches().best.code]?.name}
                  </div>
                  <div class="match-hint">{resultPageCopy.bestMatchHint}</div>
                </div>
                <Portrait
                  code={matches().best.code}
                  size={120}
                  class="match-card-portrait"
                />
              </div>
              <div class="match-card-body">
                <p class="match-rationale">{matches().best.summary}</p>
                <ul class="match-reasons">
                  <For each={matches().best.reasons.slice(0, 2)}>
                    {(reason) => <li>{reason}</li>}
                  </For>
                </ul>
              </div>
            </button>
            <button
              type="button"
              class="match-card worst"
              onClick={() =>
                setPreviewDetail(personalities[matches().worst.code] ?? null)
              }
              aria-label={resultPageCopy.matchDetailAria(
                personalities[matches().worst.code]?.name ?? matches().worst.code,
              )}
            >
              <div class="match-card-top">
                <div class="match-card-header">
                  <div class="match-label">{resultPageCopy.worstMatchLabel}</div>
                  <div class="match-code">{matches().worst.code}</div>
                  <div class="match-name">
                    {personalities[matches().worst.code]?.name}
                  </div>
                  <div class="match-hint">{resultPageCopy.worstMatchHint}</div>
                </div>
                <Portrait
                  code={matches().worst.code}
                  size={120}
                  class="match-card-portrait"
                />
              </div>
              <div class="match-card-body">
                <p class="match-rationale">{matches().worst.summary}</p>
                <ul class="match-reasons">
                  <For each={matches().worst.reasons.slice(0, 2)}>
                    {(reason) => <li>{reason}</li>}
                  </For>
                </ul>
              </div>
            </button>
          </div>
        </section>

        {/* Advice */}
        <section class="result-section advice-section">
          <div class="section-eyebrow">{resultPageCopy.adviceEyebrow}</div>
          <p class="advice-text">"{p().advice}"</p>
        </section>

        {/* AI explain · 复制链接 + 跳转到 README 使用说明 */}
        <section class="result-section ai-explain-section">
          <div class="section-eyebrow">{resultPageCopy.aiExplainEyebrow}</div>
          <h2 class="section-title">{resultPageCopy.aiExplainTitle}</h2>
          <p class="ai-explain-desc">
            {resultPageCopy.aiExplainDescription}
          </p>
          <button
            type="button"
            class="btn btn-accent ai-explain-btn"
            onClick={() => void handleExplainWithAi()}
            aria-label={resultPageCopy.aiExplainAria}
          >
            <Show
              when={explainCopied()}
              fallback={
                <>
                  <span>{resultPageCopy.aiExplainOpenLabel}</span>
                  <span class="btn-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </>
              }
            >
              <span class="btn-arrow" aria-hidden="true">
                <Check size={18} />
              </span>
              <span>{resultPageCopy.aiExplainCopiedLabel}</span>
            </Show>
          </button>
        </section>

        <div class="result-footer">
          <button class="btn btn-accent" onClick={props.onRestart}>
            <span>{resultPageCopy.restartButton}</span>
            <span class="btn-arrow" aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </button>
          <p class="footer-text">{resultPageCopy.footerText}</p>
          <div class="result-site-qr-wrap">
            <p class="result-site-qr-label">{resultPageCopy.siteQrLabel}</p>
            <a
              class="result-site-qr"
              href={FWTI_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={resultPageCopy.siteQrAria(FWTI_SITE_URL)}
            >
              <img
                src="/fwti-site-qr.png"
                width={160}
                height={160}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </a>
            <span class="result-site-qr-url">{resultPageCopy.siteQrText}</span>
          </div>
        </div>

        <ResultReferences />
      </div>
    </div>
  );
}
