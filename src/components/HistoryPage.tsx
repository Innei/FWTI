import { createSignal, For, Show } from 'solid-js';
import { navigate } from 'vike/client/router';
import { getHistory, clearHistory, deleteHistoryEntry } from '../logic/history';
import { getFamilyTheme } from '../logic/family';
import { TopNav } from './Nav';
import Portrait from './Portrait';
import type { HistoryEntry } from '../logic/history';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DimMiniBar(props: { labelA: string; labelB: string; valueA: number; valueB: number }) {
  return (
    <div class="hist-dim-mini">
      <div class="hist-dim-mini-track">
        <Show when={props.valueA > 0}>
          <div class="hist-dim-mini-fill hist-dim-mini-fill--a" style={{ width: `${Math.min(props.valueA, 100)}%` }} />
        </Show>
        <Show when={props.valueB > 0}>
          <div class="hist-dim-mini-fill hist-dim-mini-fill--b" style={{ width: `${Math.min(props.valueB, 100)}%` }} />
        </Show>
      </div>
    </div>
  );
}

function HistoryCard(props: {
  entry: HistoryEntry;
  onDelete: (hash: string) => void;
}) {
  const e = () => props.entry;
  const s = () => e().summary;
  const theme = () => getFamilyTheme(s().code);

  return (
    <div class="hist-card" data-family={theme().key}>
      <div class="hist-card-inner">
        <div class="hist-card-left">
          <Portrait code={s().code} size={72} class="hist-card-portrait" />
        </div>
        <div class="hist-card-body">
          <div class="hist-card-head">
            <span class="hist-card-name">{s().name}</span>
            <span class="hist-card-code">{s().displayCode}</span>
            <Show when={s().isHidden}>
              <span class="hist-card-hidden">隐藏</span>
            </Show>
          </div>
          <div class="hist-card-tagline">「{s().tagline}」</div>
          <div class="hist-card-meta">
            <span class="hist-card-waste">
              废物指数 {s().wasteLevel}/5
            </span>
            <span class="hist-card-date">{formatDate(e().ts)}</span>
          </div>
        </div>
        <div class="hist-card-actions">
          <button
            type="button"
            class="hist-btn hist-btn--view"
            onClick={() => void navigate(`/result/${e().hash}`)}
            aria-label="查看详情"
          >
            →
          </button>
          <button
            type="button"
            class="hist-btn hist-btn--del"
            onClick={() => props.onDelete(e().hash)}
            aria-label="删除"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [list, setList] = createSignal(getHistory());

  const handleDelete = (hash: string) => {
    deleteHistoryEntry(hash);
    setList(getHistory());
  };

  const handleClear = () => {
    clearHistory();
    setList([]);
  };

  return (
    <div class="page hist-page">
      <TopNav />
      <div class="hist-container">
        <div class="hist-header">
          <h1 class="hist-title">测试记录</h1>
          <Show when={list().length > 0}>
            <button type="button" class="hist-clear-btn" onClick={handleClear}>
              清空全部
            </button>
          </Show>
        </div>

        <Show
          when={list().length > 0}
          fallback={
            <div class="hist-empty">
              <p>尚无测试记录。</p>
              <button
                type="button"
                class="btn btn-accent"
                onClick={() => void navigate('/quiz')}
              >
                开始测试 →
              </button>
            </div>
          }
        >
          <div class="hist-list">
            <For each={list()}>
              {(entry) => (
                <HistoryCard entry={entry} onDelete={handleDelete} />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
