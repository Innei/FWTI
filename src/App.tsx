import { createSignal, createMemo, Show, For, type JSX } from 'solid-js';
import {
  Router,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from '@solidjs/router';
import { questions } from './data/questions';
import { personalities, hiddenTitle } from './data/personalities';
import { getResult, type Result } from './logic/scoring';
import { encodeAnswers, decodeAnswers } from './logic/codec';
import PersonalityIcon from './components/PersonalityIcon';

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
        navigate('/quiz?q=1');
      }}
    />
  );
}

function QuizRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fadeClass, setFadeClass] = createSignal('fade-in');

  const requestedQ = () => {
    const raw = searchParams.q;
    const str = Array.isArray(raw) ? raw[0] : raw;
    const n = str ? Number.parseInt(str, 10) : 1;
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const currentQ = () =>
    Math.max(0, Math.min(totalQ - 1, requestedQ() - 1));

  const progress = () => Object.keys(answers()).length;

  // 刷新入中段而无答案，重置至首题
  const needsReset = () => requestedQ() > 1 && progress() === 0;

  function goToQuestion(idx: number) {
    navigate(`/quiz?q=${idx + 1}`);
  }

  function selectOption(qId: number, optIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    // 自动跳下一题
    setTimeout(() => {
      if (currentQ() < totalQ - 1) {
        setFadeClass('fade-out');
        setTimeout(() => {
          goToQuestion(currentQ() + 1);
          setFadeClass('fade-in');
        }, 200);
      }
    }, 300);
  }

  function submitQuiz() {
    const encoded = encodeAnswers(answers(), totalQ);
    navigate(`/result/${encoded}`);
  }

  return (
    <Show when={!needsReset()} fallback={<Navigate href="/quiz?q=1" />}>
      <QuizPage
        currentQ={currentQ()}
        totalQ={totalQ}
        progress={progress()}
        answers={answers()}
        fadeClass={fadeClass()}
        onSelect={selectOption}
        onPrev={() => {
          if (currentQ() > 0) {
            setFadeClass('fade-out');
            setTimeout(() => {
              goToQuestion(currentQ() - 1);
              setFadeClass('fade-in');
            }, 200);
          }
        }}
        onNext={() => {
          if (currentQ() < totalQ - 1) {
            setFadeClass('fade-out');
            setTimeout(() => {
              goToQuestion(currentQ() + 1);
              setFadeClass('fade-in');
            }, 200);
          }
        }}
        onSubmit={submitQuiz}
        canSubmit={progress() >= totalQ}
      />
    </Show>
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
      <nav class="top-nav">
        <div class="nav-inner">
          <div class="nav-logo">
            <span class="logo-mark" aria-hidden="true" />
            <span class="logo-text">FWTI</span>
          </div>
          <div class="nav-meta">v1.0 · 娱乐测试</div>
        </div>
      </nav>

      <section class="home-hero">
        <div class="home-content">
          <div class="eyebrow">Fèiwù Type Indicator</div>
          <h1 class="home-title">
            <span class="serif">恋爱废物</span>
            <span class="serif">人格测试</span>
          </h1>
          <p class="home-lede">
            三十一道灵魂拷问，四维交叉分析，<br/>
            为君精准定位此生爱情之废料品类。
          </p>
          <div class="home-actions">
            <button class="btn btn-brand" onClick={props.onStart}>
              <span>开始测试</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </button>
            <span class="home-time">约需 5 分钟</span>
          </div>
        </div>

        <div class="home-dimensions-card">
          <div class="card-eyebrow">四维坐标</div>
          <div class="home-dimensions">
            <DimRow letter="G / D" labelA="冲动" labelB="犹豫" caption="行动力" />
            <DimRow letter="Z / R" labelA="暴躁" labelB="忍耐" caption="情绪阈值" />
            <DimRow letter="N / L" labelA="依附" labelB="抽离" caption="距离感" />
            <DimRow letter="Y / F" labelA="怀疑" labelB="放空" caption="安全感" />
          </div>
        </div>
      </section>

      <footer class="home-footer">
        <p class="home-disclaimer">
          本测试仅供娱乐，未经临床验证，<br class="mobile-only"/>
          请勿用于相亲、挽回、分手或发律师函。
        </p>
      </footer>
    </div>
  );
}

function DimRow(props: { letter: string; labelA: string; labelB: string; caption: string }) {
  return (
    <div class="dim-row">
      <div class="dim-row-letter">{props.letter}</div>
      <div class="dim-row-body">
        <div class="dim-row-pair">
          <span>{props.labelA}</span>
          <span class="dim-row-slash">／</span>
          <span>{props.labelB}</span>
        </div>
        <div class="dim-row-caption">{props.caption}</div>
      </div>
    </div>
  );
}

/* ===== QUIZ PAGE ===== */
function QuizPage(props: {
  currentQ: number;
  totalQ: number;
  progress: number;
  answers: Record<number, number>;
  fadeClass: string;
  onSelect: (qId: number, optIdx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  const q = () => questions[props.currentQ];
  const isLast = () => props.currentQ === props.totalQ - 1;

  return (
    <div class="page quiz-page">
      <nav class="top-nav">
        <div class="nav-inner">
          <div class="nav-logo">
            <span class="logo-mark" aria-hidden="true" />
            <span class="logo-text">FWTI</span>
          </div>
          <div class="nav-meta">进行中 · {props.progress} / {props.totalQ}</div>
        </div>
      </nav>

      <div class="quiz-container">
        <div class="progress-bar-wrap">
          <div class="progress-bar" style={{ width: `${(props.progress / props.totalQ) * 100}%` }} />
        </div>
        <div class="progress-row">
          <span class="progress-label">第 {q().id} 题 · 共 {props.totalQ} 题</span>
          <Show when={q().tag}>
            <span class="q-tag">{q().tag}</span>
          </Show>
        </div>

        <article class={`question-card ${props.fadeClass}`}>
          <div class="q-number-big">Q{String(q().id).padStart(2, '0')}</div>
          <p class="q-text">{q().text}</p>
          <div class="options">
            <For each={q().options}>
              {(opt, idx) => (
                <button
                  class={`option-btn ${props.answers[q().id] === idx() ? 'selected' : ''}`}
                  onClick={() => props.onSelect(q().id, idx())}
                >
                  <span class="opt-label">{opt.label}</span>
                  <span class="opt-text">{opt.text}</span>
                  <span class="opt-check" aria-hidden="true">✓</span>
                </button>
              )}
            </For>
          </div>
        </article>

        <div class="quiz-nav">
          <button
            class="btn btn-sand"
            onClick={props.onPrev}
            disabled={props.currentQ === 0}
          >
            ← 上一题
          </button>
          <Show when={!isLast()}>
            <button
              class="btn btn-dark"
              onClick={props.onNext}
              disabled={props.answers[q().id] === undefined}
            >
              下一题 →
            </button>
          </Show>
          <Show when={isLast()}>
            <button
              class="btn btn-brand"
              onClick={props.onSubmit}
              disabled={!props.canSubmit}
            >
              查看结果 →
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
}

/* ===== RESULT PAGE ===== */
function ResultPage(props: { result: Result; onRestart: () => void }) {
  const r = () => props.result;
  const p = () => r().personality;

  return (
    <div class="page result-page">
      <nav class="top-nav">
        <div class="nav-inner">
          <div class="nav-logo">
            <span class="logo-mark" aria-hidden="true" />
            <span class="logo-text">FWTI</span>
          </div>
          <button class="nav-restart" onClick={props.onRestart}>重新测试</button>
        </div>
      </nav>

      <div class="result-container">
        {/* Hero — light editorial */}
        <section class="result-hero-section">
          <div class="hero-eyebrow">测试完成 · 你的废物类型是</div>
          <div class="personality-icon-wrap" aria-hidden="true">
            <PersonalityIcon code={p().code} size={132} />
          </div>
          <div class="result-code">{p().code}</div>
          <h1 class="result-name serif">{p().name}</h1>
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
            <p class="hidden-name serif">「{hiddenTitle.name}」</p>
            <p class="hidden-desc">{hiddenTitle.description}</p>
          </section>
        </Show>

        {/* Dimension — dark editorial */}
        <section class="result-section dark-section">
          <div class="section-eyebrow">维度分析 · Dimensions</div>
          <h2 class="section-title serif">四维坐标</h2>
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
          <h2 class="section-title serif">这就是你</h2>
          <p class="result-desc">{p().description}</p>
        </section>

        {/* Traits */}
        <section class="result-section">
          <div class="section-eyebrow">行为特征 · Traits</div>
          <h2 class="section-title serif">恋爱中的你</h2>
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
          <h2 class="section-title serif">口头禅</h2>
          <div class="catchphrases">
            <For each={p().catchphrases}>
              {(c) => <blockquote class="catchphrase serif">{c}</blockquote>}
            </For>
          </div>
        </section>

        {/* Matches */}
        <section class="result-section">
          <div class="section-eyebrow">配对 · Compatibility</div>
          <h2 class="section-title serif">缘分图谱</h2>
          <div class="match-grid">
            <div class="match-card best">
              <div class="match-label">最佳拍档</div>
              <div class="match-code">{p().bestMatch}</div>
              <div class="match-name serif">{personalities[p().bestMatch]?.name}</div>
              <div class="match-hint">天造地设，惺惺相惜</div>
            </div>
            <div class="match-card worst">
              <div class="match-label">最怕遇到</div>
              <div class="match-code">{p().worstMatch}</div>
              <div class="match-name serif">{personalities[p().worstMatch]?.name}</div>
              <div class="match-hint">相爱相杀，避之则吉</div>
            </div>
          </div>
        </section>

        {/* Advice */}
        <section class="result-section advice-section">
          <div class="section-eyebrow">一句忠告 · Advice</div>
          <p class="advice-text serif">"{p().advice}"</p>
        </section>

        <div class="result-footer">
          <button class="btn btn-brand" onClick={props.onRestart}>
            再测一次 →
          </button>
          <p class="footer-text">FWTI v1.0 · 恋爱废物人格测试 · 仅供娱乐</p>
        </div>
      </div>
    </div>
  );
}

/* ===== GLOBAL STYLES — Claude Design System ===== */
const globalStyles = `
  :root {
    /* Brand */
    --terracotta: #c96442;
    --coral: #d97757;
    /* Surfaces */
    --parchment: #f5f4ed;
    --ivory: #faf9f5;
    --white: #ffffff;
    --warm-sand: #e8e6dc;
    --dark-surface: #30302e;
    --deep-dark: #141413;
    /* Text */
    --near-black: #141413;
    --charcoal: #4d4c48;
    --olive: #5e5d59;
    --stone: #87867f;
    --dark-warm: #3d3d3a;
    --warm-silver: #b0aea5;
    /* Borders */
    --border-cream: #f0eee6;
    --border-warm: #e8e6dc;
    --border-dark: #30302e;
    /* Rings */
    --ring-warm: #d1cfc5;
    --ring-deep: #c2c0b6;

    --serif: 'Source Serif 4', 'Noto Serif SC', Georgia, 'Times New Roman', serif;
    --sans: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--sans);
    background: var(--parchment);
    color: var(--near-black);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "palt";
  }

  .app { min-height: 100vh; }

  .serif {
    font-family: var(--serif);
    font-weight: 500;
    font-style: normal;
  }

  /* ===== TOP NAV ===== */
  .top-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(245, 244, 237, 0.85);
    backdrop-filter: saturate(160%) blur(12px);
    -webkit-backdrop-filter: saturate(160%) blur(12px);
    border-bottom: 1px solid var(--border-cream);
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
    background: var(--terracotta);
    box-shadow: inset 0 0 0 2px var(--parchment), 0 0 0 1px var(--terracotta);
    position: relative;
  }
  .logo-mark::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 2px;
    background: var(--parchment);
  }
  .logo-text {
    font-family: var(--serif);
    font-size: 19px;
    font-weight: 500;
    color: var(--near-black);
    letter-spacing: 0.02em;
  }
  .nav-meta {
    font-size: 13px;
    color: var(--olive);
    letter-spacing: 0.02em;
  }
  .nav-restart {
    font-family: var(--sans);
    font-size: 14px;
    color: var(--charcoal);
    background: var(--warm-sand);
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 0 1px var(--ring-warm);
    transition: box-shadow 0.15s ease, background 0.15s ease;
  }
  .nav-restart:hover {
    background: #dedbcd;
    box-shadow: 0 0 0 1px var(--ring-deep);
  }

  /* ===== BUTTONS ===== */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: var(--sans);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.1s ease;
    text-decoration: none;
    line-height: 1;
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .btn-brand {
    background: var(--terracotta);
    color: var(--ivory);
    padding: 14px 24px;
    border-radius: 12px;
    box-shadow: 0 0 0 1px var(--terracotta), 0 1px 0 0 rgba(0,0,0,0.02);
  }
  .btn-brand:hover:not(:disabled) {
    background: #b85a3c;
    box-shadow: 0 0 0 1px #b85a3c, 0 4px 20px rgba(201, 100, 66, 0.25);
  }
  .btn-brand:active:not(:disabled) { transform: translateY(1px); }

  .btn-sand {
    background: var(--warm-sand);
    color: var(--charcoal);
    padding: 12px 18px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--ring-warm);
  }
  .btn-sand:hover:not(:disabled) {
    background: #dedbcd;
    box-shadow: 0 0 0 1px var(--ring-deep);
  }

  .btn-dark {
    background: var(--near-black);
    color: var(--warm-silver);
    padding: 12px 18px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--near-black);
  }
  .btn-dark:hover:not(:disabled) {
    background: var(--dark-surface);
    color: var(--ivory);
    box-shadow: 0 0 0 1px var(--dark-surface);
  }

  .btn-arrow {
    font-family: var(--serif);
    font-size: 18px;
    transition: transform 0.2s ease;
  }
  .btn:hover .btn-arrow { transform: translateX(3px); }

  /* ===== HOME ===== */
  .home-page {
    min-height: 100vh;
    background: var(--parchment);
    display: flex;
    flex-direction: column;
  }
  .home-hero {
    flex: 1;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 96px 32px 80px;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .home-content {
    max-width: 560px;
  }
  .eyebrow {
    display: inline-block;
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--olive);
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--ivory);
    box-shadow: 0 0 0 1px var(--border-warm);
    margin-bottom: 28px;
  }
  .home-title {
    font-family: var(--serif);
    font-weight: 500;
    font-size: 72px;
    line-height: 1.08;
    color: var(--near-black);
    margin-bottom: 28px;
    letter-spacing: -0.01em;
  }
  .home-title span { display: block; }
  .home-lede {
    font-family: var(--sans);
    font-size: 19px;
    line-height: 1.65;
    color: var(--olive);
    margin-bottom: 40px;
    max-width: 500px;
  }
  .home-actions {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .home-time {
    font-size: 14px;
    color: var(--stone);
  }

  /* Dimensions card */
  .home-dimensions-card {
    background: var(--ivory);
    border-radius: 24px;
    padding: 36px 32px;
    box-shadow: 0 0 0 1px var(--border-cream), 0 4px 32px rgba(20, 20, 19, 0.04);
  }
  .card-eyebrow {
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--stone);
    margin-bottom: 24px;
  }
  .home-dimensions {
    display: flex;
    flex-direction: column;
  }
  .dim-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px 0;
    border-top: 1px solid var(--border-warm);
  }
  .dim-row:first-child { border-top: none; padding-top: 0; }
  .dim-row:last-child { padding-bottom: 0; }
  .dim-row-letter {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 500;
    color: var(--terracotta);
    min-width: 64px;
    letter-spacing: 0.02em;
  }
  .dim-row-body { flex: 1; }
  .dim-row-pair {
    font-family: var(--serif);
    font-size: 20px;
    color: var(--near-black);
    line-height: 1.3;
  }
  .dim-row-slash {
    color: var(--stone);
    margin: 0 4px;
  }
  .dim-row-caption {
    font-size: 12px;
    color: var(--stone);
    margin-top: 3px;
    letter-spacing: 0.04em;
  }

  .home-footer {
    border-top: 1px solid var(--border-cream);
    padding: 24px 32px 32px;
    text-align: center;
  }
  .home-disclaimer {
    font-size: 13px;
    color: var(--stone);
    line-height: 1.7;
  }
  .mobile-only { display: none; }

  /* ===== QUIZ ===== */
  .quiz-page {
    min-height: 100vh;
    background: var(--parchment);
  }
  .quiz-container {
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 56px 32px 80px;
  }
  .progress-bar-wrap {
    width: 100%;
    height: 4px;
    background: var(--border-warm);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--terracotta);
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    margin-bottom: 40px;
  }
  .progress-label {
    font-family: var(--sans);
    font-size: 13px;
    color: var(--olive);
    letter-spacing: 0.04em;
  }
  .q-tag {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--terracotta);
    background: var(--ivory);
    padding: 5px 12px;
    border-radius: 999px;
    box-shadow: 0 0 0 1px var(--border-warm);
  }

  .question-card {
    background: var(--ivory);
    border-radius: 24px;
    padding: 48px 44px;
    box-shadow: 0 0 0 1px var(--border-cream), 0 4px 32px rgba(20, 20, 19, 0.04);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .question-card.fade-in { opacity: 1; transform: translateY(0); }
  .question-card.fade-out { opacity: 0; transform: translateY(8px); }

  .q-number-big {
    font-family: var(--serif);
    font-size: 14px;
    font-weight: 500;
    color: var(--terracotta);
    letter-spacing: 0.15em;
    margin-bottom: 16px;
  }
  .q-text {
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 500;
    line-height: 1.35;
    color: var(--near-black);
    margin-bottom: 32px;
    letter-spacing: -0.005em;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .option-btn {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: var(--parchment);
    border: none;
    border-radius: 14px;
    padding: 18px 22px;
    cursor: pointer;
    text-align: left;
    font-family: var(--sans);
    color: var(--charcoal);
    box-shadow: 0 0 0 1px var(--border-warm);
    transition: box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease;
    position: relative;
  }
  .option-btn:hover {
    background: #efede3;
    box-shadow: 0 0 0 1px var(--ring-warm);
  }
  .option-btn.selected {
    background: var(--ivory);
    color: var(--near-black);
    box-shadow: 0 0 0 2px var(--terracotta);
  }
  .opt-label {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--warm-sand);
    color: var(--charcoal);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0 0 0 1px var(--ring-warm);
    transition: all 0.15s ease;
  }
  .option-btn.selected .opt-label {
    background: var(--terracotta);
    color: var(--ivory);
    box-shadow: 0 0 0 1px var(--terracotta);
  }
  .opt-text {
    flex: 1;
    font-size: 16px;
    line-height: 1.6;
    padding-top: 4px;
  }
  .opt-check {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--terracotta);
    font-size: 16px;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.15s ease;
    margin-top: 4px;
  }
  .option-btn.selected .opt-check { opacity: 1; }

  .quiz-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
    gap: 12px;
  }

  /* ===== RESULT ===== */
  .result-page {
    min-height: 100vh;
    background: var(--parchment);
  }
  .result-container {
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    padding: 64px 32px 80px;
    display: flex;
    flex-direction: column;
    gap: 56px;
  }

  .result-hero-section {
    text-align: center;
    padding: 0 20px;
  }
  .personality-icon-wrap {
    width: 168px;
    height: 168px;
    margin: 0 auto 28px;
    border-radius: 50%;
    background: var(--ivory);
    border: 1px solid var(--border-warm);
    box-shadow: 0 2px 24px rgba(201, 100, 66, 0.06),
                inset 0 0 0 6px var(--ivory),
                inset 0 0 0 7px var(--border-cream);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--terracotta);
  }
  .personality-icon-wrap svg {
    display: block;
  }
  .hero-eyebrow {
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--olive);
    margin-bottom: 28px;
  }
  .personality-icon-wrap {
    width: 168px;
    height: 168px;
    margin: 0 auto 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ivory);
    color: var(--terracotta);
    box-shadow:
      0 0 0 1px var(--border-warm) inset,
      0 0 0 6px var(--parchment),
      0 0 0 7px var(--border-warm);
  }
  .personality-icon-wrap svg {
    display: block;
  }
  .result-code {
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.35em;
    color: var(--terracotta);
    margin-bottom: 14px;
  }
  .result-name {
    font-size: 72px;
    line-height: 1.08;
    color: var(--near-black);
    margin-bottom: 18px;
    letter-spacing: -0.01em;
  }
  .result-eng {
    font-family: var(--sans);
    font-size: 14px;
    color: var(--stone);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .result-tagline {
    font-family: var(--serif);
    font-size: 22px;
    line-height: 1.5;
    color: var(--olive);
    max-width: 520px;
    margin: 0 auto 36px;
    font-style: italic;
  }
  .waste-meter {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: var(--ivory);
    padding: 14px 22px;
    border-radius: 999px;
    box-shadow: 0 0 0 1px var(--border-warm);
  }
  .waste-meter-label {
    font-size: 13px;
    color: var(--olive);
    letter-spacing: 0.04em;
  }
  .waste-meter-bar {
    display: flex;
    gap: 6px;
  }
  .waste-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-warm);
    box-shadow: inset 0 0 0 1px var(--ring-warm);
  }
  .waste-dot.filled {
    background: var(--terracotta);
    box-shadow: inset 0 0 0 1px var(--terracotta);
  }
  .waste-meter-num {
    font-family: var(--serif);
    font-size: 14px;
    color: var(--near-black);
  }

  /* Hidden title */
  .hidden-title-card {
    background: var(--ivory);
    border-radius: 20px;
    padding: 36px 40px;
    text-align: center;
    box-shadow: 0 0 0 1px var(--border-warm), 0 4px 24px rgba(201, 100, 66, 0.06);
    position: relative;
  }
  .hidden-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ivory);
    background: var(--terracotta);
    padding: 6px 14px;
    border-radius: 999px;
    box-shadow: 0 0 0 1px var(--terracotta);
    margin-bottom: 20px;
  }
  .hidden-name {
    font-size: 36px;
    color: var(--near-black);
    margin-bottom: 12px;
    line-height: 1.2;
  }
  .hidden-desc {
    font-size: 15px;
    color: var(--olive);
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto;
  }

  /* Sections */
  .result-section {
    padding: 0;
  }
  .section-eyebrow {
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--stone);
    margin-bottom: 12px;
  }
  .section-title {
    font-family: var(--serif);
    font-size: 40px;
    line-height: 1.15;
    font-weight: 500;
    color: var(--near-black);
    margin-bottom: 28px;
    letter-spacing: -0.005em;
  }

  /* Dark section */
  .dark-section {
    background: var(--deep-dark);
    color: var(--warm-silver);
    margin-left: -32px;
    margin-right: -32px;
    padding: 72px 56px;
    border-radius: 24px;
  }
  .dark-section .section-eyebrow { color: var(--warm-silver); opacity: 0.7; }
  .dark-section .section-title { color: var(--ivory); }

  .dim-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .dim-bar-row {}
  .dim-bar-head {
    margin-bottom: 10px;
  }
  .dim-bar-label {
    font-family: var(--serif);
    font-size: 18px;
    color: var(--ivory);
    font-weight: 500;
  }
  .dim-bar-container {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .dim-bar-side {
    font-size: 13px;
    color: var(--warm-silver);
    white-space: nowrap;
    min-width: 72px;
    letter-spacing: 0.02em;
  }
  .dim-bar-side.left { text-align: right; }
  .dim-bar-side.right { text-align: left; color: var(--stone); }
  .dim-bar-track {
    flex: 1;
    height: 6px;
    background: var(--dark-surface);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  .dim-bar-fill {
    height: 100%;
    background: var(--coral);
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  /* Description */
  .result-desc {
    font-family: var(--serif);
    font-size: 19px;
    line-height: 1.7;
    color: var(--charcoal);
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
    border-top: 1px solid var(--border-warm);
    align-items: baseline;
  }
  .trait-item:last-child {
    border-bottom: 1px solid var(--border-warm);
  }
  .trait-num {
    font-family: var(--serif);
    font-size: 14px;
    color: var(--terracotta);
    letter-spacing: 0.08em;
    min-width: 32px;
  }
  .trait-text {
    font-size: 16px;
    line-height: 1.7;
    color: var(--charcoal);
    flex: 1;
  }

  /* Catchphrases */
  .catchphrases {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .catchphrase {
    font-family: var(--serif);
    font-size: 22px;
    line-height: 1.55;
    color: var(--near-black);
    padding: 24px 28px;
    background: var(--ivory);
    border-radius: 16px;
    box-shadow: 0 0 0 1px var(--border-warm);
    position: relative;
    font-style: italic;
  }
  .catchphrase::before {
    content: "";
    position: absolute;
    left: 0;
    top: 24px;
    bottom: 24px;
    width: 3px;
    background: var(--terracotta);
    border-radius: 0 3px 3px 0;
  }

  /* Matches */
  .match-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .match-card {
    background: var(--ivory);
    border-radius: 20px;
    padding: 32px 28px;
    box-shadow: 0 0 0 1px var(--border-warm);
    text-align: left;
  }
  .match-card.best {
    background: var(--ivory);
  }
  .match-card.worst {
    background: var(--parchment);
  }
  .match-label {
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--stone);
    margin-bottom: 14px;
  }
  .match-card.best .match-label { color: var(--terracotta); }
  .match-code {
    font-family: var(--serif);
    font-size: 14px;
    letter-spacing: 0.25em;
    color: var(--olive);
    margin-bottom: 6px;
  }
  .match-name {
    font-size: 24px;
    font-weight: 500;
    color: var(--near-black);
    margin-bottom: 10px;
    line-height: 1.2;
  }
  .match-hint {
    font-size: 13px;
    color: var(--stone);
    line-height: 1.6;
  }

  /* Advice */
  .advice-section {
    background: var(--deep-dark);
    color: var(--ivory);
    margin-left: -32px;
    margin-right: -32px;
    padding: 72px 56px;
    border-radius: 24px;
    text-align: center;
  }
  .advice-section .section-eyebrow {
    color: var(--warm-silver);
    opacity: 0.7;
  }
  .advice-text {
    font-size: 32px;
    line-height: 1.4;
    color: var(--ivory);
    max-width: 620px;
    margin: 0 auto;
    font-weight: 500;
    font-style: italic;
  }

  /* Footer */
  .result-footer {
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid var(--border-warm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .footer-text {
    font-size: 12px;
    color: var(--stone);
    letter-spacing: 0.04em;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 900px) {
    .home-hero {
      grid-template-columns: 1fr;
      gap: 48px;
      padding: 64px 24px 56px;
    }
    .home-title { font-size: 56px; }
  }
  @media (max-width: 640px) {
    .nav-inner { padding: 12px 20px; }
    .home-hero { padding: 48px 20px; gap: 36px; }
    .home-title { font-size: 44px; }
    .home-lede { font-size: 17px; }
    .home-dimensions-card { padding: 28px 24px; }
    .dim-row-letter { font-size: 18px; min-width: 54px; }
    .dim-row-pair { font-size: 17px; }
    .mobile-only { display: block; }

    .quiz-container { padding: 36px 20px 56px; }
    .question-card { padding: 32px 24px; border-radius: 20px; }
    .q-text { font-size: 22px; }
    .option-btn { padding: 16px 18px; }
    .opt-text { font-size: 15px; }
    .quiz-nav { flex-wrap: wrap; gap: 10px; }
    .quiz-nav .btn { flex: 1; min-width: 0; padding: 12px 14px; font-size: 14px; }

    .result-container { padding: 40px 20px 56px; gap: 44px; }
    .result-name { font-size: 48px; }
    .result-tagline { font-size: 18px; }
    .personality-icon-wrap { width: 140px; height: 140px; margin-bottom: 22px; }
    .personality-icon-wrap svg { width: 108px; height: 108px; }
    .section-title { font-size: 30px; }
    .dark-section, .advice-section {
      margin-left: -20px;
      margin-right: -20px;
      padding: 52px 28px;
      border-radius: 20px;
    }
    .hidden-name { font-size: 28px; }
    .match-grid { grid-template-columns: 1fr; }
    .catchphrase { font-size: 18px; padding: 20px 24px; }
    .advice-text { font-size: 24px; }
  }
  @media (max-width: 420px) {
    .home-title { font-size: 38px; }
    .result-name { font-size: 38px; }
    .q-text { font-size: 19px; }
  }
`;
