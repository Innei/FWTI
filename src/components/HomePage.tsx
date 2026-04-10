import { For } from 'solid-js';
import { personalities } from '../data/personalities';
import { FAMILY_THEMES, getFamilyTheme } from '../logic/family';
import Portrait from './Portrait';
import { TopNav } from './Nav';
import { setPreviewDetail } from '../state';

/** 首页卡片网格中需要隐藏的隐藏人格代号（测试触发才显现）。 */
const HIDDEN_CODES_EXCLUDED_FROM_PREVIEW = new Set([
  'ALL',
  'RAT',
  'PURE',
  'MAD',
  'E-DOG',
  'CHAOS',
  'CPU',
  'BENCH',
  'VOID',
  'LIMBO',
]);

function Tip(props: { title: string; desc: string }) {
  return (
    <div class="tip-card">
      <div class="tip-title">{props.title}</div>
      <div class="tip-desc">{props.desc}</div>
    </div>
  );
}

export function HomePage(props: { onStart: () => void }) {
  return (
    <div class="page home-page">
      <TopNav meta="自嘲系列 · 娱乐测试" />

      <section class="home-hero">
        <div class="home-hero-inner">
          <div class="eyebrow eyebrow-on-green">Fèiwù Type Indicator</div>
          <h1 class="home-title">自嘲型恋爱人格测试</h1>
          <p class="home-lede">
            约 30–37 道灵魂拷问，四维交叉分析，
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
          <div class="preview-eyebrow">16 种人格 · The Waste Gallery</div>
          <h2 class="preview-title">君之归宿，四族十六型</h2>
          <p class="preview-hint">点击卡片查看类型释义</p>
        </div>
        <div class="preview-grid">
          <For
            each={Object.values(personalities).filter(
              (p) => !HIDDEN_CODES_EXCLUDED_FROM_PREVIEW.has(p.code),
            )}
          >
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
          本测试仅供娱乐，未经临床验证，
          <br class="mobile-only" />
          请勿用于相亲、挽回、分手或发律师函。
        </p>
      </footer>
    </div>
  );
}
