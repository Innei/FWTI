import { createSignal, createMemo, Show, For, type JSX } from 'solid-js';
import {
  Router,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from '@solidjs/router';
import { questions } from './data/questions';
import { personalities, hiddenTitle } from './data/personalities';
import { getResult, type Result } from './logic/scoring';
import { encodeAnswers, decodeAnswers } from './logic/codec';
import { getFamilyTheme, FAMILY_THEMES, getFamily } from './logic/family';
import PersonalityIcon from './components/PersonalityIcon';
import QuestionScale from './components/QuestionScale';

const totalQ = questions.length;
const [answers, setAnswers] = createSignal<Record<number, number>>({});

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={HomeRoute} />
      <Route path="/quiz" component={QuizRoute} />
      <Route path="/result/:hash" component={ResultRoute} />
      <Route path="*" component={() => <Navigate href="/" />} />
    </Router>
  );
}

function Layout(props: { children?: JSX.Element }) {
  return (
    <>
      <style>{globalStyles}</style>
      <div class="app">{props.children}</div>
    </>
  );
}

function HomeRoute() {
  const navigate = useNavigate();
  return (
    <HomePage
      onStart={() => {
        setAnswers({});
        navigate('/quiz');
      }}
    />
  );
}

function QuizRoute() {
  const navigate = useNavigate();

  const progress = () => Object.keys(answers()).length;

  function selectOption(qId: number, scaleIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: scaleIdx }));
    // 滚动至下一未答题
    queueMicrotask(() => scrollToNextUnanswered(qId));
  }

  function scrollToNextUnanswered(fromId: number) {
    const cur = answers();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.id <= fromId) continue;
      if (cur[q.id] === undefined) {
        const el = document.getElementById(`q-${q.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    // 全答：滚至底栏
    const submit = document.getElementById('submit-bar');
    if (submit) submit.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function submitQuiz() {
    const encoded = encodeAnswers(answers(), totalQ);
    navigate(`/result/${encoded}`);
  }

  return (
    <QuizPage
      totalQ={totalQ}
      progress={progress()}
      answers={answers()}
      onSelect={selectOption}
      onSubmit={submitQuiz}
      canSubmit={progress() >= totalQ}
    />
  );
}

function ResultRoute() {
  const params = useParams();
  const navigate = useNavigate();

  const result = createMemo<Result | null>(() => {
    const hash = params.hash;
    if (!hash) return null;
    const decoded = decodeAnswers(hash, totalQ);
    if (!decoded) return null;
    for (let i = 1; i <= totalQ; i++) {
      if (decoded[i] === undefined) return null;
    }
    return getResult(decoded);
  });

  return (
    <Show when={result()} fallback={<Navigate href="/" />}>
      <ResultPage
        result={result()!}
        onRestart={() => {
          setAnswers({});
          navigate('/');
        }}
      />
    </Show>
  );
}

/* ===== HOME PAGE ===== */
function HomePage(props: { onStart: () => void }) {
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
        </div>
        <div class="preview-grid">
          <For each={Object.values(personalities)}>
            {(p) => {
              const theme = getFamilyTheme(p.code);
              return (
                <div
                  class="preview-tile"
                  style={{
                    '--tile-color': theme.color,
                    '--tile-tint': theme.tint,
                  }}
                >
                  <div class="preview-tile-icon">
                    <PersonalityIcon code={p.code} size={56} />
                  </div>
                  <div class="preview-tile-code">{p.code}</div>
                  <div class="preview-tile-name">{p.name}</div>
                </div>
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

function Tip(props: { title: string; desc: string }) {
  return (
    <div class="tip-card">
      <div class="tip-title">{props.title}</div>
      <div class="tip-desc">{props.desc}</div>
    </div>
  );
}

/* ===== QUIZ PAGE ===== */
function QuizPage(props: {
  totalQ: number;
  progress: number;
  answers: Record<number, number>;
  onSelect: (qId: number, scaleIdx: number) => void;
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
          {(q, idx) => {
            const optA = q.options[0];
            const optC = q.options[q.options.length - 1];
            const optB = q.options.length === 3 ? q.options[1] : null;
            return (
              <article id={`q-${q.id}`} class="quiz-item">
                <div class="quiz-item-head">
                  <span class="quiz-item-num">Q{String(q.id).padStart(2, '0')}</span>
                  <Show when={q.tag}>
                    <span class="quiz-item-tag">{q.tag}</span>
                  </Show>
                </div>
                <p class="quiz-item-text">{q.text}</p>

                <div class="quiz-item-poles">
                  <div class="pole pole-a">
                    <div class="pole-badge" style={{ background: 'var(--fwti-green)' }}>A</div>
                    <div class="pole-text">{optA?.text}</div>
                  </div>
                  <Show when={optB}>
                    <div class="pole pole-b">
                      <div class="pole-badge pole-badge-neutral">B</div>
                      <div class="pole-text">{optB!.text}</div>
                    </div>
                  </Show>
                  <div class="pole pole-c">
                    <div class="pole-badge" style={{ background: '#576071' }}>C</div>
                    <div class="pole-text">{optC?.text}</div>
                  </div>
                </div>

                <QuestionScale
                  value={props.answers[q.id]}
                  onSelect={(v) => props.onSelect(q.id, v)}
                  leftLabel="偏 A"
                  rightLabel="偏 C"
                />
                <div class="quiz-item-meter">
                  <span>{idx() + 1} / {props.totalQ}</span>
                </div>
              </article>
            );
          }}
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
function ResultPage(props: { result: Result; onRestart: () => void }) {
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
          <div class="result-icon-wrap">
            <div class="result-icon-glow" />
            <div class="result-icon-inner">
              <PersonalityIcon code={p().code} size={132} />
            </div>
          </div>
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
            <div class="match-card best">
              <div class="match-label">最佳拍档</div>
              <div class="match-code">{p().bestMatch}</div>
              <div class="match-name">{personalities[p().bestMatch]?.name}</div>
              <div class="match-hint">天造地设，惺惺相惜</div>
            </div>
            <div class="match-card worst">
              <div class="match-label">最怕遇到</div>
              <div class="match-code">{p().worstMatch}</div>
              <div class="match-name">{personalities[p().worstMatch]?.name}</div>
              <div class="match-hint">相爱相杀，避之则吉</div>
            </div>
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

function TopNav(props: { meta?: string }) {
  return (
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="logo-mark" aria-hidden="true" />
          <span class="logo-text">FWTI</span>
        </div>
        <Show when={props.meta}>
          <div class="nav-meta">{props.meta}</div>
        </Show>
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
        <button class="nav-restart" onClick={props.onRestart}>重新测试</button>
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

  /* ===== PREVIEW GRID ===== */
  .home-preview {
    max-width: 1120px;
    margin: 80px auto 0;
    padding: 0 32px;
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
  .preview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .preview-tile {
    background: var(--fwti-bg);
    border: 1px solid var(--fwti-border);
    border-radius: 14px;
    padding: 22px 16px 18px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .preview-tile::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--tile-tint);
    opacity: 0.5;
    pointer-events: none;
  }
  .preview-tile:hover {
    transform: translateY(-3px);
    border-color: var(--tile-color);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  }
  .preview-tile-icon {
    color: var(--tile-color);
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    position: relative;
  }
  .preview-tile-code {
    font-family: var(--fwti-font-title);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--tile-color);
    margin-bottom: 4px;
    position: relative;
  }
  .preview-tile-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--fwti-text-dark);
    position: relative;
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
  .quiz-item-poles {
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
    text-align: left;
  }
  .pole {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: var(--fwti-bg-soft);
    border: 1px solid var(--fwti-border);
    border-radius: 12px;
  }
  .pole-badge {
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
  .pole-badge-neutral {
    background: var(--fwti-text-soft) !important;
  }
  .pole-text {
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

  /* ===== QUESTION SCALE ===== */
  .qs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: nowrap;
    width: 100%;
    max-width: 620px;
  }
  .qs-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    min-width: 42px;
    text-transform: uppercase;
  }
  .qs-label-left { text-align: right; }
  .qs-label-right { text-align: left; }
  .qs-dots {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .qs-dot {
    border-radius: 50%;
    background: transparent;
    border: 2.5px solid var(--qs-color);
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    flex-shrink: 0;
  }
  .qs-dot:hover {
    transform: scale(1.08);
    box-shadow: 0 0 0 6px rgba(51, 164, 116, 0.08);
  }
  .qs-dot.is-selected {
    background: var(--qs-color);
    box-shadow: 0 0 0 6px rgba(51, 164, 116, 0.12);
  }
  .qs-dot-center {
    border-width: 2px;
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
  .result-icon-wrap {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 0 auto 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .result-icon-glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at center, var(--fwti-accent-tint) 0%, transparent 70%);
  }
  .result-icon-inner {
    position: relative;
    width: 148px;
    height: 148px;
    border-radius: 50%;
    background: var(--fwti-accent-tint);
    border: 2px solid var(--fwti-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fwti-accent);
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
    background: var(--fwti-bg);
    border: 1px solid var(--fwti-border);
    border-radius: 16px;
    padding: 28px 26px;
    text-align: left;
  }
  .match-card.best {
    background: var(--fwti-accent-tint);
    border-color: var(--fwti-accent);
  }
  .match-card.worst {
    background: var(--fwti-bg-soft);
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
  @media (max-width: 900px) {
    .preview-grid { grid-template-columns: repeat(3, 1fr); }
    .home-title { font-size: 44px; }
  }
  @media (max-width: 720px) {
    .nav-inner { padding: 12px 20px; }
    .home-hero { padding: 56px 20px 100px; }
    .home-title { font-size: 36px; }
    .home-lede { font-size: 16px; }
    .home-tips { grid-template-columns: 1fr; margin-top: -50px; }
    .preview-grid { grid-template-columns: repeat(2, 1fr); }
    .preview-title { font-size: 28px; }
    .mobile-only { display: block; }

    .quiz-hero-title { font-size: 24px; }
    .quiz-list { padding: 28px 20px; gap: 56px; }
    .quiz-item-text { font-size: 21px; }
    .qs { gap: 8px; }
    .qs-dots { gap: 6px; }
    .qs-label { min-width: 36px; font-size: 11px; }
    .submit-bar { padding: 10px 16px; }
    .submit-bar-inner { gap: 14px; }
    .submit-bar .btn { padding: 11px 18px; font-size: 13px; }

    .result-container { padding: 40px 20px 64px; gap: 56px; }
    .result-name { font-size: 40px; }
    .result-tagline { font-size: 17px; }
    .result-icon-wrap { width: 156px; height: 156px; margin-bottom: 22px; }
    .result-icon-inner { width: 128px; height: 128px; }
    .result-icon-inner svg { width: 108px; height: 108px; }
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
  }
`;
