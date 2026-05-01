import { createEffect, onCleanup, For, Show } from 'solid-js';
import { X } from 'lucide-solid';
import { personalities } from '../copy/personalities';
import { previewModalCopy } from '../copy/ui';
import { getFamilyTheme } from '../logic/family';
import { getCompatibilityOutcome } from '../logic/compatibility';
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
        const matches = getCompatibilityOutcome(person.code);
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
                aria-label={previewModalCopy.closeAria}
              >
                <X size={20} aria-hidden="true" />
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

              <div class="preview-modal-meta-row">
                <div class="preview-modal-waste">
                  <span class="preview-modal-waste-label">{previewModalCopy.wasteLabel}</span>
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
                <Show when={person.attachmentHint}>
                  {(hint) => (
                    <div class="preview-modal-attachment" data-hint={hint()}>
                      <span class="preview-modal-attachment-label">
                        {previewModalCopy.attachmentHintLabel}
                      </span>
                      <span class="preview-modal-attachment-value">{hint()}</span>
                    </div>
                  )}
                </Show>
              </div>

              <div class="preview-modal-desc">
                <For each={person.description.split('\n\n')}>
                  {(para) => <p>{para}</p>}
                </For>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">{previewModalCopy.traitsTitle}</div>
                <ul class="preview-modal-traits">
                  <For each={person.traits}>{(t) => <li>{t}</li>}</For>
                </ul>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">{previewModalCopy.catchphrasesTitle}</div>
                <ul class="preview-modal-phrases">
                  <For each={person.catchphrases}>{(c) => <li>{c}</li>}</For>
                </ul>
              </div>

              <div class="preview-modal-section">
                <div class="preview-modal-section-title">{previewModalCopy.compatibilityTitle}</div>
                <div class="preview-modal-matches">
                  <div class="preview-modal-match best">
                    <span class="match-lbl">{previewModalCopy.bestLabel}</span>
                    <div class="match-code-row">
                      <span class="match-emoji" aria-hidden="true">
                        {personalities[matches.best.code]?.emoji}
                      </span>
                      <span class="match-code">{matches.best.code}</span>
                    </div>
                    <span class="match-name">
                      {personalities[matches.best.code]?.name}
                    </span>
                    <p class="preview-modal-match-summary">
                      {matches.best.summary}
                    </p>
                  </div>
                  <div class="preview-modal-match worst">
                    <span class="match-lbl">{previewModalCopy.worstLabel}</span>
                    <div class="match-code-row">
                      <span class="match-emoji" aria-hidden="true">
                        {personalities[matches.worst.code]?.emoji}
                      </span>
                      <span class="match-code">{matches.worst.code}</span>
                    </div>
                    <span class="match-name">
                      {personalities[matches.worst.code]?.name}
                    </span>
                    <p class="preview-modal-match-summary">
                      {matches.worst.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div class="preview-modal-advice">
                <div class="preview-modal-advice-label">{previewModalCopy.adviceLabel}</div>
                <p class="preview-modal-advice-text">{person.advice}</p>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
}
