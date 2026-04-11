import type { Result, Scores } from './scoring';

export const FWTI_HISTORY_KEY = 'fwti-history';
const MAX_HISTORY = 50;

export interface HistoryEntry {
  /** ISO timestamp */
  ts: string;
  /** v2 encoded share hash */
  hash: string;
  /** denormalized result summary for list rendering */
  summary: {
    code: string;
    displayCode: string;
    name: string;
    engName: string;
    emoji: string;
    tagline: string;
    wasteLevel: number;
    isHidden: boolean;
    scores: Scores;
  };
}

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getHistory(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FWTI_HISTORY_KEY);
    return safeParseJSON<HistoryEntry[]>(raw) ?? [];
  } catch {
    return [];
  }
}

export function saveToHistory(result: Result, hash: string): void {
  if (typeof localStorage === 'undefined') return;
  if (!hash) return;
  try {
    const list = getHistory();
    // deduplicate by hash
    const filtered = list.filter((e) => e.hash !== hash);
    const entry: HistoryEntry = {
      ts: new Date().toISOString(),
      hash,
      summary: {
        code: result.code,
        displayCode: result.displayCode,
        name: result.personality.name,
        engName: result.personality.engName,
        emoji: result.personality.emoji,
        tagline: result.personality.tagline,
        wasteLevel: result.personality.wasteLevel,
        isHidden: result.isHidden,
        scores: result.scores,
      },
    };
    filtered.unshift(entry);
    localStorage.setItem(
      FWTI_HISTORY_KEY,
      JSON.stringify(filtered.slice(0, MAX_HISTORY)),
    );
  } catch {
    /* quota exceeded etc. */
  }
}

export function clearHistory(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(FWTI_HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function deleteHistoryEntry(hash: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const list = getHistory().filter((e) => e.hash !== hash);
    localStorage.setItem(FWTI_HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
