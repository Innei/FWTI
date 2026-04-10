import {
  createSignal,
  createEffect,
  onCleanup,
  Show,
  For,
  type JSX,
} from 'solid-js';
import { questions } from './data/questions';
import {
  personalities,
  hiddenTitle,
  type Personality,
} from './data/personalities';
import { type Result } from './logic/scoring';
import { getFamilyTheme, FAMILY_THEMES, getFamily } from './logic/family';
import Portrait from './components/Portrait';

const GITHUB_REPO_URL = 'https://github.com/Innei/fwti';

export const totalQ = questions.length;
export const [answers, setAnswers] = createSignal<Record<number, number>>({});
const [previewDetail, setPreviewDetail] = createSignal<Personality | null>(null);

export function Layout(props: { children?: JSX.Element }) {
  return (
    <>
      <style>{globalStyles}</style>
      <div class="app">{props.children}</div>
      <PreviewModal />
    </>
  );
}

/* ===== HOME PAGE ===== */
export function HomePage(props: { onStart: () => void }) {
  return (
    <div class="page home-page">
      <TopNav meta="v1.0 · 娱乐测试" />

      <section class="home-hero">
        <div class="home-hero-inner">
          <div class="eyebrow eyebrow-on-green">Fèiwù Type Indicator</div>
          <h1 class="home-title">恋爱废物人格测试</h1>
          <p class="home-lede">
            三十一道灵魂拷问，四维交叉分析，<br />
            为君精准定位此生爱情之废料品类。
          </p>
          <div class="home-actions">
            <button class="btn btn-white" onClick={props.onStart}>
              <span>开始测试</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </button>
            <span class="home-time">约需 5 分钟</span>
          </div>
        </div>
        <div class="home-hero-shape" aria-hidden="true" />
      </section>

      <section class="home-tips">
        <Tip title="据实以答" desc="勿矫饰，废物亦有尊严。" />
        <Tip title="勿钻牛角" desc="首觉即真，过虑反失真。" />
        <Tip title="题必有选" desc="沉默非选项，爱情亦然。" />
      </section>

      <section class="home-preview">
        <div class="preview-head">
          <div class="preview-eyebrow">16 种废物 · The Waste Gallery</div>
          <h2 class="preview-title">君之归宿，四族十六型</h2>
          <p class="preview-hint">点击卡片查看类型释义</p>
        </div>
        <div class="preview-grid">
          <For each={Object.values(personalities)}>
            {(p) => {
              const theme = getFamilyTheme(p.code);
              return (
                <button
                  type="button"
                  class="preview-tile"
                  style={{
                    '--tile-color': theme.color,
                    '--tile-tint': theme.tint,
                  }}
                  onClick={() => setPreviewDetail(p)}
                  aria-label={`${p.name}（${p.code}）— 查看释义`}
                >
                  <Portrait
                    code={p.code}
                    size={200}
                    class="preview-tile-portrait"
                  />
                  <div class="preview-tile-meta">
                    <span class="preview-tile-code">{p.code}</span>
                    <span class="preview-tile-eng">{p.engName}</span>
                  </div>
                  <div class="preview-tile-name">{p.name}</div>
                  <div class="preview-tile-tagline">「{p.tagline}」</div>
                </button>
              );
            }}
          </For>
        </div>
        <div class="preview-legend">
          <For each={Object.values(FAMILY_THEMES)}>
            {(f) => (
              <div class="legend-item">
                <span class="legend-dot" style={{ background: f.color }} />
                <span class="legend-label">{f.name}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      <footer class="home-footer">
        <p class="home-disclaimer">
          本测试仅供娱乐，未经临床验证，<br class="mobile-only" />
          请勿用于相亲、挽回、分手或发律师函。
        </p>
      </footer>
    </div>
  );
}

function PreviewModal() {
  createEffect(() => {
    const p = previewDetail();
    if (p) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPreviewDetail(null);
      };
      window.addEventListener('keydown', onKey);
      onCleanup(() => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      });
    }
  });

  return (
    <Show when={previewDetail()} keyed>
      {(person) => {
        const modalTheme = getFamilyTheme(person.code);
        return (
          <div
            class="preview-modal-backdrop"
            role="presentation"
            onClick={() => setPreviewDetail(null)}
          >
            <div
              class="preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-modal-heading"
              onClick={(e) => e.stopPropagation()}
              style={{
                '--tile-color': modalTheme.color,
                '--tile-tint': modalTheme.tint,
              }}
            >
              <button
                type="button"
                class="preview-modal-close"
                onClick={() => setPreviewDetail(null)}
                aria-label="关闭"
              >
                ×
              </button>
              <div class="preview-modal-icon">
                <Portrait code={person.code} size={140} />
              </div>
              <div class="preview-modal-header">
                <div class="preview-modal-badges">
                  <span class="preview-modal-code">{person.code}</span>
                  <span class="preview-modal-eng">{person.engName}</span>
                </div>
                <h3 id="preview-modal-heading" class="preview-modal-name">
                  {person.name}
                </h3>
                <p class="preview-modal-tagline">「{person.tagline}」</p>
              </div>

              <hr class="preview-modal-divider" />

              <div class="preview-modal-waste">
                <span class="preview-modal-waste-label">废物指数</span>
                <div class="preview-modal-waste-dots">
                  <For each={Array.from({ length: 5 })}>
                    {(_, i) => (
                      <span
                        class={`preview-modal-waste-dot ${
                          i() < person.wasteLevel ? 'filled' : ''
                        }`}
                      />
                    )}
                  </For>
                </div>
                <span class="preview-modal-waste-num">
                  {person.wasteLevel}/5
                </span>
              </div>

              <p class="preview-modal-desc">{person.description}</p>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">常见病状</div>
                <ul class="preview-modal-traits">
                  <For each={person.traits}>
                    {(t) => <li>{t}</li>}
                  </For>
                </ul>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">口头禅</div>
                <ul class="preview-modal-phrases">
                  <For each={person.catchphrases}>
                    {(c) => <li>{c}</li>}
                  </For>
                </ul>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">配对</div>
                <div class="preview-modal-matches">
                  <div class="preview-modal-match best">
                    <span class="match-lbl">最佳</span>
                    <span class="match-code">{person.bestMatch}</span>
                    <span class="match-name">
                      {personalities[person.bestMatch]?.name}
                    </span>
                  </div>
                  <div class="preview-modal-match worst">
                    <span class="match-lbl">最糟</span>
                    <span class="match-code">{person.worstMatch}</span>
                    <span class="match-name">
                      {personalities[person.worstMatch]?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div class="preview-modal-advice">
                <div class="preview-modal-advice-label">一言以告</div>
                <p class="preview-modal-advice-text">{person.advice}</p>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
}

function Tip(props: { title: string; desc: string }) {
  return (
    <div class="tip-card">
      <div class="tip-title">{props.title}</div>
      <div class="tip-desc">{props.desc}</div>
    </div>
  );
}

/* ===== QUIZ PAGE ===== */
export function QuizPage(props: {
  totalQ: number;
  progress: number;
  answers: Record<number, number>;
  onSelect: (qId: number, optionIdx: number) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  const pct = () => Math.round((props.progress / props.totalQ) * 100);

  return (
    <div class="page quiz-page">
      <TopNav meta={`进行中 · ${props.progress} / ${props.totalQ}`} />

      <section class="quiz-hero">
        <div class="quiz-hero-inner">
          <h1 class="quiz-hero-title">恋爱废物人格测试</h1>
          <p class="quiz-hero-sub">据实作答，勿过虑，题题必选</p>
        </div>
      </section>

      <div class="quiz-list">
        <For each={questions}>
          {(q, idx) => (
              <article id={`q-${q.id}`} class="quiz-item">
                <div class="quiz-item-head">
                  <span class="quiz-item-num">Q{String(q.id).padStart(2, '0')}</span>
                  <Show when={q.tag}>
                    <span class="quiz-item-tag">{q.tag}</span>
                  </Show>
                </div>
                <p class="quiz-item-text">{q.text}</p>

                <div class="quiz-options" role="group" aria-label="选项">
                  <For each={q.options}>
                    {(opt, oi) => {
                      const badgeClass = () => {
                        const L = opt.label;
                        if (L === 'A') return 'quiz-opt-badge quiz-opt-badge-a';
                        if (L === 'B') return 'quiz-opt-badge quiz-opt-badge-b';
                        return 'quiz-opt-badge quiz-opt-badge-c';
                      };
                      return (
                        <button
                          type="button"
                          class="quiz-opt"
                          classList={{ 'is-selected': props.answers[q.id] === oi() }}
                          aria-pressed={props.answers[q.id] === oi()}
                          aria-label={`选项 ${opt.label}`}
                          onClick={() => props.onSelect(q.id, oi())}
                        >
                          <span class={badgeClass()}>{opt.label}</span>
                          <span class="quiz-opt-text">{opt.text}</span>
                        </button>
                      );
                    }}
                  </For>
                </div>

                <div class="quiz-item-meter">
                  <span>{idx() + 1} / {props.totalQ}</span>
                </div>
              </article>
          )}
        </For>
      </div>

      <div id="submit-bar" class="submit-bar">
        <div class="submit-bar-inner">
          <div class="submit-bar-progress">
            <div class="submit-progress-track">
              <div
                class="submit-progress-fill"
                style={{ width: `${pct()}%` }}
              />
            </div>
            <span class="submit-progress-pct">{pct()}%</span>
          </div>
          <button
            class="btn btn-green"
            onClick={props.onSubmit}
            disabled={!props.canSubmit}
          >
            <span>{props.canSubmit ? '查看结果' : `还差 ${props.totalQ - props.progress} 题`}</span>
            <Show when={props.canSubmit}>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </Show>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== RESULT PAGE ===== */
export function ResultPage(props: { result: Result; onRestart: () => void }) {
  const r = () => props.result;
  const p = () => r().personality;
  const family = () => getFamily(p().code);
  const theme = () => getFamilyTheme(p().code);

  return (
    <div
      class="page result-page"
      data-family={family()}
      style={{ '--fwti-accent': theme().color, '--fwti-accent-tint': theme().tint }}
    >
      <ResultNav onRestart={props.onRestart} />

      <div class="result-container">
        {/* Hero */}
        <section class="result-hero">
          <div class="hero-eyebrow">测试完成 · 你的废物类型是</div>
          <Portrait
            code={p().code}
            size={320}
            class="result-hero-portrait"
          />
          <div class="result-code">{p().code}</div>
          <h1 class="result-name">{p().name}</h1>
          <p class="result-eng">{p().engName}</p>
          <p class="result-tagline">「{p().tagline}」</p>
          <div class="waste-meter">
            <span class="waste-meter-label">废物指数</span>
            <div class="waste-meter-bar">
              <For each={Array.from({ length: 5 })}>
                {(_, i) => (
                  <span class={`waste-dot ${i() < p().wasteLevel ? 'filled' : ''}`} />
                )}
              </For>
            </div>
            <span class="waste-meter-num">{p().wasteLevel} / 5</span>
          </div>
        </section>

        {/* Hidden title */}
        <Show when={r().hasHiddenTitle}>
          <section class="hidden-title-card">
            <span class="hidden-badge">隐藏成就</span>
            <p class="hidden-name">「{hiddenTitle.name}」</p>
            <p class="hidden-desc">{hiddenTitle.description}</p>
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
                      <div
                        class="dim-bar-fill"
                        style={{ width: `${Math.min(d.valueA, 100)}%` }}
                      />
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
          <p class="result-desc">{p().description}</p>
        </section>

        {/* Traits */}
        <section class="result-section">
          <div class="section-eyebrow">行为特征 · Traits</div>
          <h2 class="section-title">恋爱中的你</h2>
          <ul class="trait-list">
            <For each={p().traits}>
              {(t, i) => (
                <li class="trait-item">
                  <span class="trait-num">{String(i() + 1).padStart(2, '0')}</span>
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
                setPreviewDetail(personalities[p().bestMatch] ?? null)
              }
              aria-label={`查看 ${personalities[p().bestMatch]?.name} 详情`}
            >
              <Portrait
                code={p().bestMatch}
                size={120}
                class="match-card-portrait"
              />
              <div class="match-card-body">
                <div class="match-label">最佳拍档</div>
                <div class="match-code">{p().bestMatch}</div>
                <div class="match-name">{personalities[p().bestMatch]?.name}</div>
                <div class="match-hint">天造地设，惺惺相惜</div>
              </div>
            </button>
            <button
              type="button"
              class="match-card worst"
              onClick={() =>
                setPreviewDetail(personalities[p().worstMatch] ?? null)
              }
              aria-label={`查看 ${personalities[p().worstMatch]?.name} 详情`}
            >
              <Portrait
                code={p().worstMatch}
                size={120}
                class="match-card-portrait"
              />
              <div class="match-card-body">
                <div class="match-label">最怕遇到</div>
                <div class="match-code">{p().worstMatch}</div>
                <div class="match-name">{personalities[p().worstMatch]?.name}</div>
                <div class="match-hint">相爱相杀，避之则吉</div>
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
          <p class="footer-text">FWTI v1.0 · 恋爱废物人格测试 · 仅供娱乐</p>
        </div>
      </div>
    </div>
  );
}

function GithubNavLink() {
  return (
    <a
      class="nav-github"
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 GitHub 上查看源码"
    >
      <svg class="nav-github-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        />
      </svg>
      <span>GitHub</span>
    </a>
  );
}

function TopNav(props: { meta?: string }) {
  return (
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="logo-mark" aria-hidden="true" />
          <span class="logo-text">FWTI</span>
        </div>
        <div class="nav-right">
          <Show when={props.meta}>
            <div class="nav-meta">{props.meta}</div>
          </Show>
          <GithubNavLink />
        </div>
      </div>
    </nav>
  );
}

function ResultNav(props: { onRestart: () => void }) {
  return (
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="logo-mark" aria-hidden="true" />
          <span class="logo-text">FWTI</span>
        </div>
        <div class="nav-right">
          <button class="nav-restart" type="button" onClick={props.onRestart}>
            重新测试
          </button>
          <GithubNavLink />
        </div>
      </div>
    </nav>
  );
}

/* ===== GLOBAL STYLES — 16p Design ===== */
const globalStyles = `
  :root {
    /* Brand (default) */
    --fwti-green: #33a474;
    --fwti-green-dark: #278a60;

    /* Surfaces */
    --fwti-bg: #ffffff;
    --fwti-bg-soft: #f9f9f9;
    --fwti-bg-tint: #eff8f3;

    /* Text */
    --fwti-text-dark: #343c4b;
    --fwti-text-mid: #576071;
    --fwti-text-soft: #8a95a7;

    /* Borders */
    --fwti-border: #eeeff1;
    --fwti-border-strong: #dddfe2;

    /* Family accents */
    --fwti-gz: #F25E62;
    --fwti-gr: #E4AE3A;
    --fwti-dz: #88619A;
    --fwti-dr: #33A474;

    /* Accent (overridden on Result via data-family) */
    --fwti-accent: var(--fwti-green);
    --fwti-accent-tint: rgba(51, 164, 116, 0.08);

    --fwti-font-title: 'Red Hat Display', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --fwti-font-body: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html { font-size: 16px; scroll-behavior: smooth; }

  body {
    font-family: var(--fwti-font-body);
    background: var(--fwti-bg);
    color: var(--fwti-text-dark);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "palt";
  }

  .app { min-height: 100vh; }

  /* ===== TOP NAV ===== */
  .top-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: saturate(160%) blur(10px);
    -webkit-backdrop-filter: saturate(160%) blur(10px);
    border-bottom: 1px solid var(--fwti-border);
  }
  .nav-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 14px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .nav-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    flex-shrink: 0;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-mark {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--fwti-green);
    position: relative;
  }
  .logo-mark::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 2px;
    background: #fff;
  }
  .logo-text {
    font-family: var(--fwti-font-title);
    font-size: 18px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    letter-spacing: 0.02em;
  }
  .nav-meta {
    font-size: 13px;
    color: var(--fwti-text-mid);
    letter-spacing: 0.02em;
  }
  .nav-github {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: var(--fwti-font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--fwti-text-mid);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .nav-github:hover {
    color: var(--fwti-text-dark);
  }
  .nav-github-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  .nav-restart {
    font-family: var(--fwti-font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--fwti-text-dark);
    background: var(--fwti-bg-soft);
    border: 1px solid var(--fwti-border);
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .nav-restart:hover {
    background: #f0f2f5;
    border-color: var(--fwti-border-strong);
  }

  /* ===== BUTTONS ===== */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: var(--fwti-font-body);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    text-decoration: none;
    line-height: 1;
    border-radius: 30px;
    padding: 16px 32px;
  }
  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .btn-arrow {
    font-size: 18px;
    transition: transform 0.2s ease;
  }
  .btn:hover:not(:disabled) .btn-arrow { transform: translateX(3px); }

  .btn-green {
    background: var(--fwti-green);
    color: #fff;
    box-shadow: 0 4px 16px rgba(51, 164, 116, 0.25);
  }
  .btn-green:hover:not(:disabled) {
    background: var(--fwti-green-dark);
    box-shadow: 0 6px 20px rgba(51, 164, 116, 0.35);
  }

  .btn-white {
    background: #fff;
    color: var(--fwti-green);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  .btn-white:hover {
    background: #f6fcf9;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.12);
  }

  .btn-accent {
    background: var(--fwti-accent);
    color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  .btn-accent:hover {
    filter: brightness(0.93);
  }

  /* ===== HOME ===== */
  .home-page {
    min-height: 100vh;
    background: var(--fwti-bg);
    display: flex;
    flex-direction: column;
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--fwti-font-body);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fwti-text-mid);
    margin-bottom: 18px;
  }
  .eyebrow-on-green {
    color: rgba(255, 255, 255, 0.85);
  }

  .home-hero {
    position: relative;
    background: var(--fwti-green);
    color: #fff;
    overflow: hidden;
    padding: 72px 32px 120px;
  }
  .home-hero-inner {
    max-width: 820px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 2;
  }
  .home-hero-shape {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12) 0, transparent 35%),
      radial-gradient(circle at 85% 80%, rgba(255,255,255,0.08) 0, transparent 40%);
    pointer-events: none;
  }
  .home-title {
    font-family: var(--fwti-font-title);
    font-weight: 700;
    font-size: 56px;
    line-height: 1.12;
    color: #fff;
    margin-bottom: 22px;
    letter-spacing: -0.01em;
  }
  .home-lede {
    font-size: 18px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 36px;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }
  .home-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }
  .home-time {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
  }

  /* ===== TIPS ===== */
  .home-tips {
    max-width: 1000px;
    margin: -60px auto 0;
    padding: 0 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    position: relative;
    z-index: 3;
  }
  .tip-card {
    background: #fff;
    border: 1px solid var(--fwti-border);
    border-radius: 16px;
    padding: 28px 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  }
  .tip-title {
    font-family: var(--fwti-font-title);
    font-size: 20px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    margin-bottom: 8px;
  }
  .tip-desc {
    font-size: 14px;
    color: var(--fwti-text-mid);
    line-height: 1.6;
  }

  /* ===== PORTRAIT RING ===== */
  .portrait-ring {
    aspect-ratio: 1 / 1;
    overflow: hidden;
    display: block;
    margin: 0 auto;
    -webkit-mask-image: radial-gradient(circle at 50% 48%, #000 45%, transparent 68%);
    mask-image: radial-gradient(circle at 50% 48%, #000 45%, transparent 68%);
  }
  .portrait-ring img {
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    display: block;
  }

  /* ===== PREVIEW GRID ===== */
  .home-preview {
    max-width: 1280px;
    margin: 80px auto 0;
    padding: 0 40px;
  }
  .preview-head {
    text-align: center;
    margin-bottom: 40px;
  }
  .preview-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fwti-text-soft);
    margin-bottom: 12px;
  }
  .preview-title {
    font-family: var(--fwti-font-title);
    font-size: 36px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    letter-spacing: -0.01em;
  }
  .preview-hint {
    margin-top: 14px;
    font-size: 14px;
    color: var(--fwti-text-soft);
    letter-spacing: 0.02em;
  }
  .preview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .preview-tile {
    appearance: none;
    -webkit-appearance: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    width: 100%;
    margin: 0;
    background: linear-gradient(180deg, var(--tile-tint) 0%, var(--fwti-bg) 72%);
    border: 1px solid var(--fwti-border);
    border-radius: 20px;
    padding: 26px 18px 22px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .preview-tile:focus-visible {
    outline: 2px solid var(--tile-color);
    outline-offset: 3px;
  }
  .preview-tile:hover {
    transform: translateY(-4px);
    border-color: var(--tile-color);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  }
  .preview-tile-portrait {
    position: relative;
    width: 180px;
    max-width: 100%;
    margin-bottom: 12px;
  }
  .preview-tile-meta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    position: relative;
    margin-bottom: 6px;
  }
  .preview-tile-code {
    font-family: var(--fwti-font-title);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.24em;
    color: var(--tile-color);
  }
  .preview-tile-eng {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--fwti-text-soft);
    text-transform: uppercase;
  }
  .preview-tile-name {
    font-family: var(--fwti-font-title);
    font-size: 20px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    letter-spacing: -0.01em;
    position: relative;
    margin-bottom: 6px;
  }
  .preview-tile-tagline {
    font-size: 12px;
    line-height: 1.55;
    color: var(--fwti-text-mid);
    font-style: italic;
    position: relative;
    max-width: 220px;
    margin: 0 auto;
  }

  .preview-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(10, 10, 10, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: preview-modal-in 0.18s ease-out;
  }
  @keyframes preview-modal-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .preview-modal {
    position: relative;
    width: 100%;
    max-width: 520px;
    max-height: min(88vh, 820px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: #ffffff;
    border-radius: 12px;
    padding: 32px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow:
      0 24px 48px -12px rgba(0, 0, 0, 0.18),
      0 0 0 1px rgba(0, 0, 0, 0.04);
    animation: preview-modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes preview-modal-pop {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .preview-modal::-webkit-scrollbar { width: 10px; }
  .preview-modal::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 999px;
    border: 2px solid #ffffff;
  }
  .preview-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #71717a;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .preview-modal-close:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #09090b;
  }
  .preview-modal-close:focus-visible {
    outline: 2px solid var(--tile-color);
    outline-offset: 2px;
  }

  .preview-modal-icon {
    display: flex;
    justify-content: center;
    margin: 4px 0 14px;
  }
  .preview-modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    margin-bottom: 14px;
  }
  .preview-modal-badges {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
  .preview-modal-code {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--tile-color);
    background: color-mix(in srgb, var(--tile-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--tile-color) 24%, transparent);
    border-radius: 6px;
  }
  .preview-modal-eng {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #71717a;
    background: #f4f4f5;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    text-transform: none;
    margin: 0;
  }
  .preview-modal-name {
    font-family: var(--fwti-font-title);
    font-size: 28px;
    font-weight: 700;
    color: #09090b;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 6px 0 0;
  }
  .preview-modal-tagline {
    font-size: 14px;
    line-height: 1.55;
    color: #71717a;
    font-style: italic;
    margin: 6px 0 0;
  }
  .preview-modal-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.08);
    margin: 20px 0;
    border: 0;
  }
  .preview-modal-desc {
    font-size: 14px;
    line-height: 1.7;
    color: #3f3f46;
    margin: 0;
  }

  .preview-modal-waste {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0;
    margin: 0 0 18px;
  }
  .preview-modal-waste-label {
    font-size: 12px;
    font-weight: 500;
    color: #71717a;
    letter-spacing: 0;
  }
  .preview-modal-waste-dots {
    display: flex;
    gap: 4px;
    flex: 1;
    justify-content: center;
  }
  .preview-modal-waste-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e4e4e7;
  }
  .preview-modal-waste-dot.filled {
    background: var(--tile-color);
  }
  .preview-modal-waste-num {
    font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    color: #52525b;
    min-width: 32px;
    text-align: right;
  }

  .preview-modal-section {
    margin-top: 22px;
  }
  .preview-modal-section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #71717a;
    margin-bottom: 10px;
  }
  .preview-modal-section-title::before { content: none; }

  .preview-modal-traits {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .preview-modal-traits li {
    position: relative;
    padding: 0 0 0 18px;
    background: transparent;
    border-radius: 0;
    font-size: 14px;
    line-height: 1.65;
    color: #3f3f46;
  }
  .preview-modal-traits li::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 10px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #a1a1aa;
  }

  .preview-modal-phrases {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .preview-modal-phrases li {
    font-size: 14px;
    line-height: 1.75;
    color: #52525b;
    font-style: italic;
  }
  .preview-modal-phrases li::before {
    content: "— ";
    color: #a1a1aa;
    font-style: normal;
  }

  .preview-modal-matches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .preview-modal-match {
    padding: 12px 14px;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .preview-modal-match.best {
    border-color: color-mix(in srgb, var(--tile-color) 35%, rgba(0, 0, 0, 0.08));
    background: color-mix(in srgb, var(--tile-color) 5%, #ffffff);
  }
  .match-lbl {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a1a1aa;
    margin-bottom: 2px;
  }
  .preview-modal-match.best .match-lbl { color: var(--tile-color); }
  .match-code {
    font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #09090b;
  }
  .match-name {
    font-size: 12px;
    color: #71717a;
  }

  .preview-modal-advice {
    margin-top: 22px;
    padding: 14px 16px;
    border-radius: 8px;
    background: #fafafa;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-left: 2px solid var(--tile-color);
  }
  .preview-modal-advice-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tile-color);
    margin-bottom: 4px;
  }
  .preview-modal-advice-text {
    font-size: 13px;
    line-height: 1.6;
    color: #3f3f46;
    margin: 0;
  }

  .preview-legend {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--fwti-text-mid);
  }
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  /* ===== HOME FOOTER ===== */
  .home-footer {
    margin-top: 96px;
    border-top: 1px solid var(--fwti-border);
    padding: 32px;
    text-align: center;
  }
  .home-disclaimer {
    font-size: 13px;
    color: var(--fwti-text-soft);
    line-height: 1.7;
  }
  .mobile-only { display: none; }

  /* ===== QUIZ ===== */
  .quiz-page {
    min-height: 100vh;
    background: var(--fwti-bg);
    padding-bottom: 120px;
  }
  .quiz-hero {
    background: var(--fwti-green);
    color: #fff;
    padding: 40px 24px 44px;
    text-align: center;
  }
  .quiz-hero-inner {
    max-width: 700px;
    margin: 0 auto;
  }
  .quiz-hero-title {
    font-family: var(--fwti-font-title);
    font-weight: 700;
    font-size: 32px;
    letter-spacing: -0.01em;
    margin-bottom: 8px;
  }
  .quiz-hero-sub {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
  }

  .quiz-list {
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 64px;
  }
  .quiz-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px 8px;
    scroll-margin: 100px;
  }
  .quiz-item-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .quiz-item-num {
    font-family: var(--fwti-font-title);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--fwti-text-soft);
  }
  .quiz-item-tag {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fwti-green);
    background: var(--fwti-bg-tint);
    padding: 4px 10px;
    border-radius: 999px;
  }
  .quiz-item-text {
    font-family: var(--fwti-font-title);
    font-size: 26px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--fwti-text-dark);
    margin-bottom: 32px;
    max-width: 560px;
  }
  .quiz-options {
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 8px;
    text-align: left;
  }
  .quiz-opt {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: var(--fwti-bg-soft);
    border: 2px solid var(--fwti-border);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: inherit;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .quiz-opt:hover {
    border-color: rgba(51, 164, 116, 0.35);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  .quiz-opt.is-selected {
    border-color: var(--fwti-green);
    background: var(--fwti-bg-tint);
    box-shadow: 0 0 0 1px rgba(51, 164, 116, 0.2);
  }
  .quiz-opt-badge {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: var(--fwti-font-title);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.02em;
  }
  .quiz-opt-badge-a { background: var(--fwti-green); }
  .quiz-opt-badge-b { background: var(--fwti-text-soft); }
  .quiz-opt-badge-c { background: #576071; }
  .quiz-opt-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.55;
    color: var(--fwti-text-dark);
    padding-top: 3px;
  }
  .quiz-item-meter {
    margin-top: 20px;
    font-size: 12px;
    color: var(--fwti-text-soft);
    letter-spacing: 0.08em;
  }

  /* ===== SUBMIT BAR ===== */
  .submit-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: saturate(160%) blur(10px);
    -webkit-backdrop-filter: saturate(160%) blur(10px);
    border-top: 1px solid var(--fwti-border);
    z-index: 40;
    padding: 14px 24px;
  }
  .submit-bar-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .submit-bar-progress {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .submit-progress-track {
    flex: 1;
    height: 6px;
    background: var(--fwti-border);
    border-radius: 999px;
    overflow: hidden;
  }
  .submit-progress-fill {
    height: 100%;
    background: var(--fwti-green);
    border-radius: 999px;
    transition: width 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .submit-progress-pct {
    font-family: var(--fwti-font-title);
    font-weight: 700;
    font-size: 13px;
    color: var(--fwti-text-dark);
    min-width: 40px;
    text-align: right;
  }
  .submit-bar .btn {
    padding: 13px 26px;
    font-size: 14px;
    border-radius: 999px;
  }

  /* ===== RESULT ===== */
  .result-page {
    min-height: 100vh;
    background: var(--fwti-bg);
  }
  .result-container {
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    padding: 56px 32px 80px;
    display: flex;
    flex-direction: column;
    gap: 72px;
  }

  .result-hero {
    text-align: center;
    padding: 20px 0 0;
  }
  .result-hero-portrait {
    position: relative;
    width: 320px;
    margin: 0 auto 24px;
  }
  .result-hero-portrait::before {
    content: "";
    position: absolute;
    inset: -12%;
    background: radial-gradient(
      circle at 50% 45%,
      var(--fwti-accent-tint) 0%,
      transparent 62%
    );
    z-index: -1;
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fwti-text-mid);
    margin-bottom: 28px;
  }
  .result-code {
    font-family: var(--fwti-font-title);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.32em;
    color: var(--fwti-accent);
    margin-bottom: 14px;
  }
  .result-name {
    font-family: var(--fwti-font-title);
    font-size: 56px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--fwti-text-dark);
    margin-bottom: 14px;
    letter-spacing: -0.015em;
  }
  .result-eng {
    font-size: 13px;
    font-weight: 600;
    color: var(--fwti-text-soft);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .result-tagline {
    font-size: 19px;
    line-height: 1.55;
    color: var(--fwti-text-mid);
    max-width: 520px;
    margin: 0 auto 32px;
  }
  .waste-meter {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: var(--fwti-bg-soft);
    padding: 12px 22px;
    border-radius: 999px;
    border: 1px solid var(--fwti-border);
  }
  .waste-meter-label {
    font-size: 13px;
    color: var(--fwti-text-mid);
    letter-spacing: 0.04em;
  }
  .waste-meter-bar {
    display: flex;
    gap: 6px;
  }
  .waste-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--fwti-border-strong);
  }
  .waste-dot.filled {
    background: var(--fwti-accent);
  }
  .waste-meter-num {
    font-family: var(--fwti-font-title);
    font-size: 14px;
    font-weight: 700;
    color: var(--fwti-text-dark);
  }

  /* Hidden title */
  .hidden-title-card {
    background: var(--fwti-accent-tint);
    border: 1px solid var(--fwti-accent);
    border-radius: 20px;
    padding: 36px 40px;
    text-align: center;
  }
  .hidden-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fff;
    background: var(--fwti-accent);
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 20px;
  }
  .hidden-name {
    font-family: var(--fwti-font-title);
    font-size: 32px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    margin-bottom: 10px;
    line-height: 1.2;
  }
  .hidden-desc {
    font-size: 15px;
    color: var(--fwti-text-mid);
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto;
  }

  /* Sections */
  .section-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--fwti-text-soft);
    margin-bottom: 12px;
  }
  .section-title {
    font-family: var(--fwti-font-title);
    font-size: 34px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--fwti-text-dark);
    margin-bottom: 28px;
    letter-spacing: -0.01em;
  }

  .dim-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .dim-bar-head {
    margin-bottom: 10px;
  }
  .dim-bar-label {
    font-family: var(--fwti-font-title);
    font-size: 16px;
    font-weight: 700;
    color: var(--fwti-text-dark);
  }
  .dim-bar-container {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .dim-bar-side {
    font-size: 13px;
    color: var(--fwti-text-mid);
    white-space: nowrap;
    min-width: 72px;
    letter-spacing: 0.02em;
    font-weight: 500;
  }
  .dim-bar-side.left { text-align: right; color: var(--fwti-accent); }
  .dim-bar-side.right { text-align: left; }
  .dim-bar-track {
    flex: 1;
    height: 8px;
    background: var(--fwti-border);
    border-radius: 999px;
    position: relative;
    overflow: hidden;
  }
  .dim-bar-fill {
    height: 100%;
    background: var(--fwti-accent);
    border-radius: 999px;
    transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  /* Description */
  .result-desc {
    font-size: 17px;
    line-height: 1.8;
    color: var(--fwti-text-dark);
    max-width: 620px;
  }

  /* Traits */
  .trait-list {
    list-style: none;
    padding: 0;
  }
  .trait-item {
    display: flex;
    gap: 20px;
    padding: 20px 0;
    border-top: 1px solid var(--fwti-border);
    align-items: baseline;
  }
  .trait-item:last-child {
    border-bottom: 1px solid var(--fwti-border);
  }
  .trait-num {
    font-family: var(--fwti-font-title);
    font-size: 13px;
    font-weight: 700;
    color: var(--fwti-accent);
    letter-spacing: 0.1em;
    min-width: 36px;
  }
  .trait-text {
    font-size: 15px;
    line-height: 1.7;
    color: var(--fwti-text-dark);
    flex: 1;
  }

  /* Catchphrases */
  .catchphrases {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .catchphrase {
    font-family: var(--fwti-font-title);
    font-size: 20px;
    font-weight: 500;
    line-height: 1.55;
    color: var(--fwti-text-dark);
    padding: 24px 28px;
    background: var(--fwti-bg-soft);
    border-radius: 14px;
    border-left: 4px solid var(--fwti-accent);
  }

  /* Matches */
  .match-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .match-card {
    appearance: none;
    -webkit-appearance: none;
    font: inherit;
    color: inherit;
    width: 100%;
    background: var(--fwti-bg);
    border: 1px solid var(--fwti-border);
    border-radius: 16px;
    padding: 24px 24px 24px 12px;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .match-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  }
  .match-card:focus-visible {
    outline: 2px solid var(--fwti-accent);
    outline-offset: 3px;
  }
  .match-card.best {
    background: var(--fwti-accent-tint);
    border-color: var(--fwti-accent);
  }
  .match-card.best:hover {
    border-color: var(--fwti-accent);
  }
  .match-card.worst {
    background: var(--fwti-bg-soft);
  }
  .match-card-portrait {
    flex: 0 0 auto;
    width: 120px;
  }
  .match-card-body {
    flex: 1 1 auto;
    min-width: 0;
  }
  .match-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fwti-text-soft);
    margin-bottom: 14px;
  }
  .match-card.best .match-label { color: var(--fwti-accent); }
  .match-code {
    font-family: var(--fwti-font-title);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: var(--fwti-text-mid);
    margin-bottom: 6px;
  }
  .match-name {
    font-family: var(--fwti-font-title);
    font-size: 22px;
    font-weight: 700;
    color: var(--fwti-text-dark);
    margin-bottom: 10px;
    line-height: 1.2;
  }
  .match-hint {
    font-size: 13px;
    color: var(--fwti-text-mid);
    line-height: 1.6;
  }

  /* Advice */
  .advice-section {
    background: var(--fwti-bg-soft);
    border-radius: 24px;
    padding: 56px 44px;
    text-align: center;
    border: 1px solid var(--fwti-border);
  }
  .advice-text {
    font-family: var(--fwti-font-title);
    font-size: 26px;
    font-weight: 500;
    line-height: 1.5;
    color: var(--fwti-text-dark);
    max-width: 580px;
    margin: 0 auto;
  }

  /* Footer */
  .result-footer {
    text-align: center;
    padding-top: 32px;
    border-top: 1px solid var(--fwti-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .footer-text {
    font-size: 12px;
    color: var(--fwti-text-soft);
    letter-spacing: 0.04em;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1100px) {
    .home-preview { padding: 0 28px; }
    .preview-grid { gap: 16px; }
    .preview-tile-portrait { width: 160px; }
  }
  @media (max-width: 900px) {
    .preview-tile-portrait { width: 140px; }
    .home-title { font-size: 44px; }
  }
  @media (max-width: 720px) {
    .nav-inner { padding: 12px 20px; }
    .home-hero { padding: 56px 20px 100px; }
    .home-title { font-size: 36px; }
    .home-lede { font-size: 16px; }
    .home-tips { grid-template-columns: 1fr; margin-top: -50px; }
    .home-preview { padding: 0 20px; }
    .preview-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .preview-tile { padding: 22px 14px 18px; }
    .preview-tile-portrait { width: 150px; }
    .preview-tile-name { font-size: 18px; }
    .preview-title { font-size: 28px; }
    .mobile-only { display: block; }

    .quiz-hero-title { font-size: 24px; }
    .quiz-list { padding: 28px 20px; gap: 56px; }
    .quiz-item-text { font-size: 21px; }
    .submit-bar { padding: 10px 16px; }
    .submit-bar-inner { gap: 14px; }
    .submit-bar .btn { padding: 11px 18px; font-size: 13px; }

    .result-container { padding: 40px 20px 64px; gap: 56px; }
    .result-name { font-size: 40px; }
    .result-tagline { font-size: 17px; }
    .result-hero-portrait { width: 240px; margin-bottom: 20px; }
    .section-title { font-size: 26px; }
    .advice-section { padding: 40px 28px; border-radius: 20px; }
    .advice-text { font-size: 20px; }
    .hidden-name { font-size: 24px; }
    .match-grid { grid-template-columns: 1fr; }
    .catchphrase { font-size: 17px; padding: 20px 22px; }
  }
  @media (max-width: 460px) {
    .home-title { font-size: 30px; }
    .result-name { font-size: 32px; }
    .quiz-item-text { font-size: 19px; }
    .preview-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .preview-tile { padding: 18px 10px 16px; }
    .preview-tile-portrait { width: 130px; }
    .preview-tile-name { font-size: 16px; }
    .preview-tile-tagline { font-size: 11px; }
  }
`;
