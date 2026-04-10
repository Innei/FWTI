import {
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  Show,
  For,
  type JSX,
} from 'solid-js'
import {
  questions,
  resolveQuestionText,
  resolveOptionText,
} from './data/questions'
import {
  personalities,
  type Personality,
} from './data/personalities'
import {
  getRelationshipStatus,
  type Result,
  type RelationshipStatus,
} from './logic/scoring'
import { getFamilyTheme, FAMILY_THEMES, getFamily } from './logic/family'
import Portrait from './components/Portrait'
import {
  cycleThemeSetting,
  getStoredTheme,
  initThemeFromStorage,
  type FwtiThemeSetting,
} from './theme'
import './global.css'

const GITHUB_REPO_URL = 'https://github.com/Innei/fwti'

/**
 * 正题题库数量（排除 META 前置题，但**包含**彩蛋题 id=31）。
 * 对外文案与进度条统一以这个数字为准——DRAFT 里承诺的是"三十一道灵魂拷问"
 * （= 30 道主线题 + 1 道隐藏彩蛋题 = 31），前置题只是语境路由，不计入题目计数。
 *
 * 注意：scoring.ts 里做"空想家"极端答题统计时，会再从这 31 题里剔除彩蛋得到 30，
 * 那是 DRAFT 中"主线题"的定义，跟这里的 mainQ 是两个不同口径，别弄混。
 */
export const mainQ = questions.filter((q) => q.dimension !== 'META').length
export const [answers, setAnswers] = createSignal<Record<number, number>>({})
const [previewDetail, setPreviewDetail] = createSignal<Personality | null>(null)

export function Layout(props: { children?: JSX.Element }) {
  onMount(() => {
    initThemeFromStorage()
  })
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
  /** 正题题库总数（不含前置题） */
  mainTotal: number
  /** 已作答的正题数量 */
  mainProgress: number
  /** 前置题是否已作答 */
  metaAnswered: boolean
  answers: Record<number, number>
  onSelect: (qId: number, optionIdx: number) => void
  onSubmit: () => void
  canSubmit: boolean
}) {
  const pct = () => Math.round((props.mainProgress / props.mainTotal) * 100)
  // 根据前置题结果，派生当前的关系语境；未选时为 null（使用默认题干）
  const status = (): RelationshipStatus => getRelationshipStatus(props.answers)
  // 把正题在数组里的位置映射成 1..mainTotal 的连续序号（跳过前置题）
  const mainIndexMap = new Map<number, number>()
  let runningIdx = 0
  for (const q of questions) {
    if (q.dimension === 'META') continue
    runningIdx += 1
    mainIndexMap.set(q.id, runningIdx)
  }
  const mainLeft = () => Math.max(0, props.mainTotal - props.mainProgress)
  const submitLabel = () => {
    if (props.canSubmit) return '查看结果'
    if (!props.metaAnswered) return '请先完成前置题'
    return `还差 ${mainLeft()} 题`
  }

  return (
    <div class="page quiz-page">
      <TopNav
        meta={`进行中 · ${props.mainProgress} / ${props.mainTotal}`}
      />

      <section class="quiz-hero">
        <div class="quiz-hero-inner">
          <h1 class="quiz-hero-title">恋爱废物人格测试</h1>
          <p class="quiz-hero-sub">
            据实作答，勿过虑，题题必选；若场景不适用，请按前置题所选语境代入想象。
          </p>
        </div>
      </section>

      <div class="quiz-list">
        <For each={questions}>
          {(q) => (
            <article id={`q-${q.id}`} class="quiz-item">
              <div class="quiz-item-head">
                <Show
                  when={q.dimension !== 'META'}
                  fallback={<span class="quiz-item-num quiz-item-num-meta">前置</span>}
                >
                  <span class="quiz-item-num">
                    Q{String(mainIndexMap.get(q.id) ?? 0).padStart(2, '0')}
                  </span>
                </Show>
                <Show when={q.tag && q.dimension !== 'META'}>
                  <span class="quiz-item-tag">{q.tag}</span>
                </Show>
              </div>
              <p class="quiz-item-text">{resolveQuestionText(q, status())}</p>
              <Show when={q.dimension === 'META'}>
                <p class="quiz-item-note">
                  前置题只用于语境路由，不计分；若稍后更改此项，后续答案会自动重置。
                </p>
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
                        <span class="quiz-opt-text">
                          {resolveOptionText(q, oi(), status())}
                        </span>
                      </button>
                    )
                  }}
                </For>
              </div>

              <Show when={q.dimension !== 'META'}>
                <div class="quiz-item-meter">
                  <span>
                    {mainIndexMap.get(q.id) ?? 0} / {props.mainTotal}
                  </span>
                </div>
              </Show>
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
            <span>{submitLabel()}</span>
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
            <ResultCodeLine text={r().displayCode} />
            <Show when={!r().isLimbo && r().tiedDimensions.length === 1}>
              <p class="result-tied-note">
                有一个维度恰好打平，已按默认方向归类并在该维度以 * 标记
              </p>
            </Show>
            <Show when={r().isLimbo && r().closestPersonality}>
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

        {/* References & Disclaimer */}
        <section class="result-refs">
          <div class="section-eyebrow">学术依据 · References</div>
          <h2 class="section-title">维度理论锚点</h2>
          <p class="refs-intro">
            FWTI 的四个维度（G/D · Z/R · N/L · Y/F）并非完全瞎编，
            它们分别对应心理学里研究浪漫关系最常用的几个量表。
            下列文献是维度设计的理论锚点，也是题目灵感的来源。
          </p>

          <div class="refs-group">
            <h3 class="refs-group-title">
              成人依恋理论 · Adult Attachment Theory
              <span class="refs-group-map">→ 对应 N/L 与 Y/F</span>
            </h3>
            <ul class="refs-list">
              <li>
                Brennan, K. A., Clark, C. L., &amp; Shaver, P. R. (1998).
                Self-report measurement of adult romantic attachment: An integrative overview.
                In J. A. Simpson &amp; W. S. Rholes (Eds.),{' '}
                <em>Attachment theory and close relationships</em> (pp. 46–76). Guilford Press.
              </li>
              <li>
                Fraley, R. C., Waller, N. G., &amp; Brennan, K. A. (2000).
                An item response theory analysis of self-report measures of adult attachment.{' '}
                <em>Journal of Personality and Social Psychology, 78</em>(2), 350–365.
              </li>
            </ul>
          </div>

          <div class="refs-group">
            <h3 class="refs-group-title">
              情绪调节 · Emotion Regulation
              <span class="refs-group-map">→ 对应 Z/R</span>
            </h3>
            <ul class="refs-list">
              <li>
                Gross, J. J., &amp; John, O. P. (2003).
                Individual differences in two emotion regulation processes:
                Implications for affect, relationships, and well-being.{' '}
                <em>Journal of Personality and Social Psychology, 85</em>(2), 348–362.
              </li>
            </ul>
          </div>

          <div class="refs-group">
            <h3 class="refs-group-title">
              接近–回避动机 · Approach–Avoidance Motivation
              <span class="refs-group-map">→ 对应 G/D</span>
            </h3>
            <ul class="refs-list">
              <li>
                Carver, C. S., &amp; White, T. L. (1994).
                Behavioral inhibition, behavioral activation, and affective responses
                to impending reward and punishment: The BIS/BAS Scales.{' '}
                <em>Journal of Personality and Social Psychology, 67</em>(2), 319–333.
              </li>
              <li>
                Gable, S. L. (2006). Approach and avoidance social motives and goals.{' '}
                <em>Journal of Personality, 74</em>(1), 175–222.
              </li>
            </ul>
          </div>

          <div class="refs-group">
            <h3 class="refs-group-title">
              中文量表 · Chinese Adaptation
            </h3>
            <ul class="refs-list">
              <li>
                李同归, 加藤和生. (2006). 成人依恋的测量：亲密关系经历量表（ECR）中文版.{' '}
                <em>心理学报, 38</em>(3), 399–406.
              </li>
            </ul>
          </div>

          <div class="refs-disclaimer">
            <p>
              <strong>本测试仅供参考。</strong>
              FWTI 借用了上述理论的维度结构与部分题目灵感，
              但<strong>并未经过心理测量学的信效度验证</strong>，
              不是诊断工具，不能替代 ECR-R，也不能用来给自己或别人贴标签。
            </p>
            <p>
              请勿将本结果用于相亲、挽回、分手、发律师函或自我攻击。
              如果你真的对自己的依恋模式感到好奇，建议去做一份正规的 ECR-R 中文版，
              或找靠谱的心理咨询师聊聊。
              被一个网络测试逗笑是好事，被它说服就不是了。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [setting, setSetting] = createSignal<FwtiThemeSetting>(null)

  onMount(() => {
    setSetting(getStoredTheme())
  })

  function onClick() {
    cycleThemeSetting()
    setSetting(getStoredTheme())
  }

  const title = () => {
    const s = setting()
    if (s == null) return '切换外观（当前：跟随系统）'
    if (s === 'light') return '切换外观（当前：浅色）'
    return '切换外观（当前：深色）'
  }

  return (
    <button
      type="button"
      class="theme-toggle"
      onClick={onClick}
      title={title()}
      aria-label={title()}
    >
      <Show when={setting() === 'light'}>
        <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM2 13h2a1 1 0 1 0 0-2H2a1 1 0 1 0 0 2Zm18 0h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2ZM11 2v2a1 1 0 1 0 2 0V2a1 1 0 1 0-2 0Zm0 18v2a1 1 0 1 0 2 0v-2a1 1 0 1 0-2 0ZM6.343 4.929 4.93 6.343 6.343 7.757 7.757 6.343 6.343 4.929Zm9.9 9.9-1.414 1.414 1.414 1.414 1.414-1.414-1.414-1.414Zm1.414-9.9 1.414 1.414-1.414 1.414-1.414-1.414 1.414-1.414ZM6.343 17.657l-1.414 1.414 1.414 1.414 1.414-1.414-1.414-1.414Z"
          />
        </svg>
      </Show>
      <Show when={setting() === 'dark'}>
        <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.6 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"
          />
        </svg>
      </Show>
      <Show when={setting() == null}>
        <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3V4Zm2 1h2V4h-2v1ZM6 8v10h12V8H6Zm2 2h8v2H8v-2Zm0 4h5v2H8v-2Z"
          />
        </svg>
      </Show>
    </button>
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
          <ThemeToggle />
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
          <ThemeToggle />
          <GithubNavLink />
        </div>
      </div>
    </nav>
  )
}
