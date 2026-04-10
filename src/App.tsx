import {
  createSignal,
  createEffect,
  onCleanup,
  Show,
  For,
  type JSX,
} from 'solid-js'
import { questions } from './data/questions'
import {
  personalities,
  type Personality,
} from './data/personalities'
import { type Result } from './logic/scoring'
import { getFamilyTheme, FAMILY_THEMES, getFamily } from './logic/family'
import Portrait from './components/Portrait'
import './global.css'

const GITHUB_REPO_URL = 'https://github.com/Innei/fwti'

export const totalQ = questions.length
export const [answers, setAnswers] = createSignal<Record<number, number>>({})
const [previewDetail, setPreviewDetail] = createSignal<Personality | null>(null)

export function Layout(props: { children?: JSX.Element }) {
  return (
    <>
      <div class="app">{props.children}</div>
      <PreviewModal />
    </>
  )
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
            三十一道灵魂拷问，四维交叉分析，
            <br />
            为君精准定位此生爱情之废料品类。
          </p>
          <div class="home-actions">
            <button class="btn btn-white" onClick={props.onStart}>
              <span>开始测试</span>
              <span class="btn-arrow" aria-hidden="true">
                →
              </span>
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
          <For each={Object.values(personalities).filter((p) => p.code !== 'LIMBO')}>
            {(p) => {
              const theme = getFamilyTheme(p.code)
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
              )
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
          本测试仅供娱乐，未经临床验证，
          <br class="mobile-only" />
          请勿用于相亲、挽回、分手或发律师函。
        </p>
      </footer>
    </div>
  )
}

function PreviewModal() {
  createEffect(() => {
    const p = previewDetail()
    if (p) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPreviewDetail(null)
      }
      window.addEventListener('keydown', onKey)
      onCleanup(() => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onKey)
      })
    }
  })

  return (
    <Show when={previewDetail()} keyed>
      {(person) => {
        const modalTheme = getFamilyTheme(person.code)
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
                  <Show when={person.cnSlang}>
                    <span class="preview-modal-slang">{person.cnSlang}</span>
                  </Show>
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
                  <For each={person.traits}>{(t) => <li>{t}</li>}</For>
                </ul>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">口头禅</div>
                <ul class="preview-modal-phrases">
                  <For each={person.catchphrases}>{(c) => <li>{c}</li>}</For>
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
        )
      }}
    </Show>
  )
}

function Tip(props: { title: string; desc: string }) {
  return (
    <div class="tip-card">
      <div class="tip-title">{props.title}</div>
      <div class="tip-desc">{props.desc}</div>
    </div>
  )
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
  )
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
  )
}

/* ===== QUIZ PAGE ===== */
export function QuizPage(props: {
  totalQ: number
  progress: number
  answers: Record<number, number>
  onSelect: (qId: number, optionIdx: number) => void
  onSubmit: () => void
  canSubmit: boolean
}) {
  const pct = () => Math.round((props.progress / props.totalQ) * 100)

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
                <Show
                  when={q.dimension !== 'META'}
                  fallback={<span class="quiz-item-num quiz-item-num-meta">前置</span>}
                >
                  <span class="quiz-item-num">
                    Q{String(q.id).padStart(2, '0')}
                  </span>
                </Show>
                <Show when={q.tag && q.dimension !== 'META'}>
                  <span class="quiz-item-tag">{q.tag}</span>
                </Show>
              </div>
              <p class="quiz-item-text">{q.text}</p>
              <Show when={q.note}>
                <p class="quiz-item-note">{q.note}</p>
              </Show>

              <div class="quiz-options" role="group" aria-label="选项">
                <For each={q.options}>
                  {(opt, oi) => {
                    const badgeClass = () => {
                      const L = opt.label
                      if (L === 'A') return 'quiz-opt-badge quiz-opt-badge-a'
                      if (L === 'B') return 'quiz-opt-badge quiz-opt-badge-b'
                      return 'quiz-opt-badge quiz-opt-badge-c'
                    }
                    return (
                      <button
                        type="button"
                        class="quiz-opt"
                        classList={{
                          'is-selected': props.answers[q.id] === oi(),
                        }}
                        aria-pressed={props.answers[q.id] === oi()}
                        aria-label={`选项 ${opt.label}`}
                        onClick={() => props.onSelect(q.id, oi())}
                      >
                        <span class={badgeClass()}>{opt.label}</span>
                        <span class="quiz-opt-text">{opt.text}</span>
                      </button>
                    )
                  }}
                </For>
              </div>

              <div class="quiz-item-meter">
                <span>
                  {idx() + 1} / {props.totalQ}
                </span>
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
            <span>
              {props.canSubmit
                ? '查看结果'
                : `还差 ${props.totalQ - props.progress} 题`}
            </span>
            <Show when={props.canSubmit}>
              <span class="btn-arrow" aria-hidden="true">
                →
              </span>
            </Show>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== RESULT PAGE ===== */
export function ResultPage(props: { result: Result; onRestart: () => void }) {
  const r = () => props.result
  const p = () => r().personality
  const family = () => getFamily(p().code)
  const theme = () => getFamilyTheme(p().code)

  return (
    <div
      class="page result-page"
      data-family={family()}
      style={{
        '--fwti-accent': theme().color,
        '--fwti-accent-tint': theme().tint,
      }}
    >
      <ResultNav onRestart={props.onRestart} />

      <div class="result-container">
        {/* Hero */}
        <section class="result-hero">
          <div class="hero-eyebrow">
            {r().isLimbo ? '隐藏人格解锁 · 你的废物类型是' : '测试完成 · 你的废物类型是'}
          </div>
          <div class="result-identity">
            <h1 class="result-name">{p().name}</h1>
            <ResultEngLine text={p().engName} />
            <Show when={p().cnSlang}>
              <p class="result-slang">{p().cnSlang}</p>
            </Show>
            <ResultCodeLine text={p().code} />
            <Show when={!r().isLimbo && r().tiedDimensions.length > 0}>
              <p class="result-tied-note">
                有 {r().tiedDimensions.length} 个维度打平（已取默认"废"方向，以 * 标记）
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
                <div class="match-name">
                  {personalities[p().bestMatch]?.name}
                </div>
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
                <div class="match-name">
                  {personalities[p().worstMatch]?.name}
                </div>
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
  )
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
  )
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
  )
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
  )
}
