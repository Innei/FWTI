import { createSignal, For, Show } from 'solid-js';
import { personalities } from '../data/personalities';
import type { Result } from '../logic/scoring';
import { getFamilyTheme, getFamily } from '../logic/family';
import { getCompatibilityOutcome } from '../logic/compatibility';
import Portrait from './Portrait';
import { ShareImageModal } from './ShareImageModal';
import { ResultNav } from './Nav';
import { ResultReferences } from './ResultReferences';
import { setPreviewDetail, FWTI_SITE_URL } from '../state';

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
  const r = () => props.result;
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
        onShareImage={() => setShareOpen(true)}
      />

      <Show when={props.isLegacy}>
        <div class="legacy-banner" role="status">
          <div class="legacy-banner-inner">
            <span class="legacy-banner-badge">旧版测试结果</span>
            <span class="legacy-banner-text">
              此链接来自旧版题库，按当时规则解读。新版已引入分支题库与归一化评分，结果可能不同。
            </span>
            <button
              type="button"
              class="legacy-banner-cta"
              onClick={props.onRestart}
            >
              点此重测新版 →
            </button>
          </div>
        </div>
      </Show>

      <div class="result-container">
        {/* Hero */}
        <section class="result-hero">
          <div class="hero-eyebrow">
            {r().isHidden
              ? '隐藏人格解锁 · 你的恋爱人格是'
              : '测试完成 · 你的恋爱人格是'}
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
                共有 {r().tiedDimensions.length} 个维度打平；若硬要归类，你最接近
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
            <span class="waste-meter-label">废物指数</span>
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
            <div class="section-eyebrow">隐藏成就 · Achievements</div>
            <h2 class="section-title">
              你额外解锁了 {r().unlockedHiddenTitles.length} 个隐藏标签
            </h2>
            <div class="hidden-title-list">
              <For each={r().unlockedHiddenTitles}>
                {(t) => (
                  <div class="hidden-title-card">
                    <span class="hidden-badge">隐藏</span>
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
          <div class="section-eyebrow">维度分析 · Dimensions</div>
          <h2 class="section-title">四维坐标</h2>
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

        {/* Description */}
        <section class="result-section">
          <div class="section-eyebrow">人格解读 · Profile</div>
          <h2 class="section-title">这就是你</h2>
          <div class="result-desc">
            <For each={p().description.split('\n\n')}>
              {(para) => <p>{para}</p>}
            </For>
          </div>
        </section>

        {/* Traits */}
        <section class="result-section">
          <div class="section-eyebrow">行为特征 · Traits</div>
          <h2 class="section-title">恋爱中的你</h2>
          <ul class="trait-list">
            <For each={p().traits}>
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

        {/* Catchphrases */}
        <section class="result-section">
          <div class="section-eyebrow">语录 · Catchphrases</div>
          <h2 class="section-title">口头禅</h2>
          <div class="catchphrases">
            <For each={p().catchphrases}>
              {(c) => <blockquote class="catchphrase">{c}</blockquote>}
            </For>
          </div>
        </section>

        {/* Matches */}
        <section class="result-section">
          <div class="section-eyebrow">配对 · Compatibility</div>
          <h2 class="section-title">缘分图谱</h2>
          <div class="match-grid">
            <button
              type="button"
              class="match-card best"
              onClick={() =>
                setPreviewDetail(personalities[matches().best.code] ?? null)
              }
              aria-label={`查看 ${personalities[matches().best.code]?.name} 详情`}
            >
              <div class="match-card-top">
                <div class="match-card-header">
                  <div class="match-label">最佳拍档</div>
                  <div class="match-code">{matches().best.code}</div>
                  <div class="match-name">
                    {personalities[matches().best.code]?.name}
                  </div>
                  <div class="match-hint">天造地设，惺惺相惜</div>
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
              aria-label={`查看 ${personalities[matches().worst.code]?.name} 详情`}
            >
              <div class="match-card-top">
                <div class="match-card-header">
                  <div class="match-label">最怕遇到</div>
                  <div class="match-code">{matches().worst.code}</div>
                  <div class="match-name">
                    {personalities[matches().worst.code]?.name}
                  </div>
                  <div class="match-hint">相爱相杀，避之则吉</div>
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
          <div class="section-eyebrow">一句忠告 · Advice</div>
          <p class="advice-text">"{p().advice}"</p>
        </section>

        <div class="result-footer">
          <button class="btn btn-accent" onClick={props.onRestart}>
            再测一次 →
          </button>
          <p class="footer-text">FWTI · 自嘲型恋爱人格测试 · 仅供娱乐</p>
          <div class="result-site-qr-wrap">
            <p class="result-site-qr-label">扫码打开测试</p>
            <a
              class="result-site-qr"
              href={FWTI_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在新标签打开 ${FWTI_SITE_URL}`}
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
            <span class="result-site-qr-url">fwti.innei.dev</span>
          </div>
        </div>

        <ResultReferences />
      </div>
    </div>
  );
}
