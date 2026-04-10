import { createEffect, onCleanup, For, Show } from 'solid-js';
import { personalities } from '../data/personalities';
import { getFamilyTheme } from '../logic/family';
import Portrait from './Portrait';
import { previewDetail, setPreviewDetail } from '../state';

export function PreviewModal() {
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
                <span class="preview-modal-waste-num">{person.wasteLevel}/5</span>
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
        );
      }}
    </Show>
  );
}
