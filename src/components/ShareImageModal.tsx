/** @jsxImportSource solid-js */
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  For,
  type JSX,
} from 'solid-js'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import type { Result } from '../logic/scoring'
import Portrait from './Portrait'
import { getFamilyTheme, getFamily } from '../logic/family'
import { getSiteOrigin } from '../site'

function sleepRaf(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function dataUrlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  return res.blob()
}

function safeFilenamePart(s: string): string {
  return s.replace(/[/\\?%*:|"<>]/g, '').slice(0, 48) || 'result'
}

export function ShareImageModal(props: {
  open: boolean
  onClose: () => void
  result: Result
  hash?: string
}): JSX.Element {
  let captureHost: HTMLDivElement | undefined
  const [preview, setPreview] = createSignal<string | null>(null)
  const [busy, setBusy] = createSignal(false)
  const [hint, setHint] = createSignal<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = createSignal<string | null>(null)

  const r = () => props.result
  const p = () => r().personality
  const theme = () => getFamilyTheme(p().code)
  const family = () => getFamily(p().code)

  // 动态生成当前结果页 QR 码
  createEffect(() => {
    if (!props.open) {
      setQrDataUrl(null)
      return
    }
    const hash = props.hash
    const origin = getSiteOrigin()
    const targetUrl = hash ? `${origin}/result/${hash}` : origin
    QRCode.toDataURL(targetUrl, {
      width: 144,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null))
  })

  createEffect(() => {
    if (!props.open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    })
  })

  createEffect(() => {
    if (!props.open) {
      setPreview(null)
      setBusy(false)
      setHint(null)
      return
    }

    let cancelled = false
    setBusy(true)
    setPreview(null)
    setHint(null)

    const run = async () => {
      // 等 QR 码生成完毕再加一帧，确保 DOM 就绪
      await sleepRaf()
      if (!captureHost) await sleepRaf()
      if (cancelled || !captureHost) {
        if (!cancelled) setBusy(false)
        return
      }
      try {
        const explicit = document.documentElement.dataset.theme
        const isDark =
          explicit === 'dark' ||
          (explicit !== 'light' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
        const bg = isDark ? '#09090b' : '#ffffff'
        const url = await toPng(captureHost, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: bg,
        })
        if (!cancelled) setPreview(url)
      } catch {
        if (!cancelled) setHint('生成图片失败，请稍后再试')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    void run()
    onCleanup(() => {
      cancelled = true
    })
  })

  const fileBase = () =>
    `FWTI-${r().displayCode}-${safeFilenamePart(p().name)}`

  const onDownload = () => {
    const url = preview()
    if (!url) return
    downloadDataUrl(url, `${fileBase()}.png`)
  }

  const onShare = async () => {
    const url = preview()
    if (!url) return
    setHint(null)
    try {
      const blob = await dataUrlToBlob(url)
      const file = new File([blob], `${fileBase()}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${p().name} · FWTI`,
          text: `我的恋爱人格：${p().name}（${r().displayCode}）`,
        })
      } else {
        setHint('当前环境不支持系统分享，请使用保存图片')
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setHint('分享失败，可尝试保存图片')
    }
  }

  const onCopy = async () => {
    const url = preview()
    if (!url) return
    setHint(null)
    try {
      const blob = await dataUrlToBlob(url)
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setHint('已复制图片，可粘贴到聊天或备忘录')
    } catch {
      setHint('复制图片不被支持，请使用保存图片')
    }
  }

  const siteLabel = () => getSiteOrigin().replace(/^https?:\/\//, '')

  return (
    <Show when={props.open}>
      <div
        class="share-image-backdrop"
        role="presentation"
        onClick={props.onClose}
      >
        <div
          class="share-image-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-image-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="share-image-dialog-header">
            <div class="share-image-dialog-header-top">
              <h2 id="share-image-title" class="share-image-title">
                分享为图片
              </h2>
              <button
                type="button"
                class="share-image-close"
                onClick={props.onClose}
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <p class="share-image-lede">
              保存或分享下方卡片；亦可复制图片粘贴到聊天。
            </p>
          </div>

          <div class="share-image-dialog-body">
            <div class="share-image-preview-wrap">
              {busy() && !preview() ? (
                <div class="share-image-loading">生成中…</div>
              ) : null}
              {preview() ? (
                <img
                  class="share-image-preview"
                  src={preview()!}
                  alt={`${p().name} 测试结果图`}
                />
              ) : null}
            </div>

            {hint() ? <p class="share-image-hint">{hint()}</p> : null}
          </div>

          <div class="share-image-dialog-footer">
            <div class="share-image-actions">
              <button
                type="button"
                class="btn btn-accent share-image-btn"
                disabled={!preview() || busy()}
                onClick={onDownload}
              >
                保存图片
              </button>
              <button
                type="button"
                class="btn btn-green share-image-btn"
                disabled={!preview() || busy()}
                onClick={onShare}
              >
                系统分享
              </button>
              <button
                type="button"
                class="btn btn-outline share-image-btn"
                disabled={!preview() || busy()}
                onClick={onCopy}
              >
                复制图片
              </button>
            </div>
          </div>
        </div>

        <div class="share-image-capture-mount" aria-hidden="true">
          <div
            class="share-image-card"
            ref={(el) => {
              captureHost = el
            }}
            data-family={family()}
            style={{
              '--fwti-accent': theme().color,
              '--fwti-accent-tint': theme().tint,
            }}
          >
            <p class="share-image-card-eyebrow">
              {r().isAll || r().isHidden
                ? '隐藏人格解锁 · FWTI'
                : 'FWTI · 自嘲型恋爱人格测试'}
            </p>
            <Portrait
              code={p().code}
              size={200}
              class="share-image-card-portrait"
            />
            <h3 class="share-image-card-name">{p().name}</h3>
            <p class="share-image-card-eng">{p().engName}</p>
            <Show when={p().cnSlang}>
              <p class="share-image-card-slang">{p().cnSlang}</p>
            </Show>
            <div class="share-image-card-code">{r().displayCode}</div>
            <p class="share-image-card-tagline">「{p().tagline}」</p>
            <div class="share-image-card-waste">
              <span class="share-image-card-waste-label">废物指数</span>
              <div class="share-image-card-waste-dots">
                <For each={Array.from({ length: 5 })}>
                  {(_, i) => (
                    <span
                      class={`share-waste-dot ${
                        i() < p().wasteLevel ? 'filled' : ''
                      }`}
                    />
                  )}
                </For>
              </div>
              <span class="share-image-card-waste-num">
                {p().wasteLevel} / 5
              </span>
            </div>

            {/* 四维坐标条形图 */}
            <div class="share-image-card-dims">
              <For each={r().dimensionLabels}>
                {(d) => (
                  <div class="share-dim-row">
                    <div class="share-dim-label">{d.dim}</div>
                    <div class="share-dim-bar-container">
                      <span class="share-dim-side share-dim-side--a">
                        {d.labelA}
                      </span>
                      <div class="share-dim-bar-track">
                        <Show when={d.valueA > 0}>
                          <div
                            class="share-dim-bar-fill share-dim-bar-fill--a"
                            style={{ width: `${Math.min(d.valueA, 100)}%` }}
                          />
                        </Show>
                        <Show when={d.valueB > 0}>
                          <div
                            class="share-dim-bar-fill share-dim-bar-fill--b"
                            style={{ width: `${Math.min(d.valueB, 100)}%` }}
                          />
                        </Show>
                      </div>
                      <span class="share-dim-side share-dim-side--b">
                        {d.labelB}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>

            <Show when={r().unlockedHiddenTitles.length > 0}>
              <div class="share-image-card-achv">
                <span class="share-image-card-achv-label">隐藏标签</span>
                <div class="share-image-card-achv-chips">
                  <For each={r().unlockedHiddenTitles}>
                    {(t) => <span class="share-image-chip">「{t.name}」</span>}
                  </For>
                </div>
              </div>
            </Show>
            <div class="share-image-card-footer">
              <Show
                when={qrDataUrl()}
                fallback={
                  <img
                    src="/fwti-site-qr.png"
                    width={72}
                    height={72}
                    alt=""
                    decoding="async"
                  />
                }
              >
                <img
                  src={qrDataUrl()!}
                  width={72}
                  height={72}
                  alt=""
                  decoding="async"
                />
              </Show>
              <span class="share-image-card-url">{siteLabel()}</span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
