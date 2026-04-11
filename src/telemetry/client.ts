import type { Result, RelationshipStatus } from '../logic/scoring';

type TelemetryEventType =
  | 'page_view'
  | 'quiz_start'
  | 'quiz_progress'
  | 'quiz_complete'
  | 'result_view'
  | 'share_image_open'
  | 'explain_ai_click';

type TelemetryPayload = {
  id?: string;
  type: TelemetryEventType;
  pageKey?: 'home' | 'quiz' | 'result' | 'history';
  routePath?: string;
  relationshipStatus?: Exclude<RelationshipStatus, null> | null;
  resultCode?: string;
  displayCode?: string;
  isHidden?: boolean;
  isLegacy?: boolean;
  hiddenTitles?: string[];
  wasteLevel?: number;
  retreatCount?: number;
  answeredCount?: number;
  mainTotal?: number;
  progressPct?: number;
  durationMs?: number;
  hashVersion?: number;
  source?: 'fresh_submit' | 'share_link' | 'history_revisit' | 'unknown';
  score?: {
    GD: number;
    ZR: number;
    NL: number;
    YF: number;
  };
  answers?: Array<{
    questionId: number;
    optionIndex: number;
  }>;
  detail?: Record<string, unknown>;
};

type QuizRunState = {
  id: string;
  startedAt: number;
  sentMilestones: number[];
  statusTracked: boolean;
};

const SESSION_KEY = 'fwti-telemetry-session-id';
const VISITOR_KEY = 'fwti-telemetry-visitor-id';
const QUIZ_RUN_KEY = 'fwti-telemetry-quiz-run';
const LAST_COMPLETION_KEY = 'fwti-telemetry-last-completion';
const DEFAULT_ENDPOINT = 'https://fwti-telemetry.innei.dev';

function getEndpoint(): string {
  const raw =
    (import.meta.env.VITE_TELEMETRY_ENDPOINT as string | undefined)?.trim() ||
    DEFAULT_ENDPOINT;
  return raw.replace(/\/+$/, '');
}

function isRealEndpoint(endpoint: string): boolean {
  return endpoint.length > 0;
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `fwti-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function getSessionId(): string | null {
  const store = getSessionStorage();
  if (!store) return null;
  let value = store.getItem(SESSION_KEY);
  if (!value) {
    value = randomId();
    store.setItem(SESSION_KEY, value);
  }
  return value;
}

function getVisitorId(): string | null {
  const store = getLocalStorage();
  if (!store) return null;
  let value = store.getItem(VISITOR_KEY);
  if (!value) {
    value = randomId();
    store.setItem(VISITOR_KEY, value);
  }
  return value;
}

function getUtm(): {
  source?: string;
  medium?: string;
  campaign?: string;
} {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') ?? undefined,
    medium: params.get('utm_medium') ?? undefined,
    campaign: params.get('utm_campaign') ?? undefined,
  };
}

function getViewportBucket(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getNavigationTiming(): Record<string, unknown> | undefined {
  if (typeof performance === 'undefined') return undefined;
  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!nav) return undefined;
  return {
    navType: nav.type,
    domInteractiveMs: Math.round(nav.domInteractive),
    domCompleteMs: Math.round(nav.domComplete),
    loadEventEndMs: Math.round(nav.loadEventEnd),
    ttfbMs: Math.round(nav.responseStart),
  };
}

function postEvent(payload: TelemetryPayload, useBeacon = false): void {
  if (typeof window === 'undefined') return;
  const endpoint = getEndpoint();
  if (!isRealEndpoint(endpoint)) return;
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  if (!sessionId || !visitorId) return;

  const body = JSON.stringify({
    ...payload,
    id: payload.id ?? randomId(),
    sessionId,
    visitorId,
    routePath: payload.routePath ?? window.location.pathname,
    referrer: document.referrer || undefined,
    occurredAt: Date.now(),
    utm: getUtm(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      bucket: getViewportBucket(),
    },
  });

  if (
    useBeacon &&
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(`${endpoint}/api/events`, blob);
    return;
  }

  void fetch(`${endpoint}/api/events`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body,
    keepalive: useBeacon,
  }).catch(() => {
    /* 网络失败不阻断主流程 */
  });
}

function readQuizRun(): QuizRunState | null {
  const store = getSessionStorage();
  if (!store) return null;
  const raw = store.getItem(QUIZ_RUN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizRunState;
  } catch {
    return null;
  }
}

function writeQuizRun(run: QuizRunState | null): void {
  const store = getSessionStorage();
  if (!store) return;
  if (!run) {
    store.removeItem(QUIZ_RUN_KEY);
    return;
  }
  store.setItem(QUIZ_RUN_KEY, JSON.stringify(run));
}

export function resetTelemetryQuizRun(): void {
  writeQuizRun(null);
}

export function trackPageView(pageKey: 'home' | 'quiz' | 'result' | 'history'): void {
  postEvent({
    type: 'page_view',
    pageKey,
    detail: {
      navigation: getNavigationTiming(),
      viewportBucket: getViewportBucket(),
    },
  });
}

export function beginQuizRun(status: Exclude<RelationshipStatus, null> | null): void {
  const current = readQuizRun();
  if (current) return;
  writeQuizRun({
    id: randomId(),
    startedAt: Date.now(),
    sentMilestones: [],
    statusTracked: false,
  });
  postEvent({
    type: 'quiz_start',
    pageKey: 'quiz',
    relationshipStatus: status,
  });
}

export function trackQuizProgress(progressPct: number, args: {
  relationshipStatus: Exclude<RelationshipStatus, null> | null;
  mainProgress: number;
  mainTotal: number;
}): void {
  const run = readQuizRun();
  if (!run) return;

  const milestone = progressPct >= 100
    ? 100
    : progressPct >= 75
      ? 75
      : progressPct >= 50
        ? 50
        : progressPct >= 25
          ? 25
          : 0;

  let changed = false;

  if (args.relationshipStatus && !run.statusTracked) {
    postEvent({
      type: 'quiz_progress',
      pageKey: 'quiz',
      relationshipStatus: args.relationshipStatus,
      progressPct,
      answeredCount: args.mainProgress,
      mainTotal: args.mainTotal,
      detail: {
        kind: 'status_selected',
      },
    });
    run.statusTracked = true;
    changed = true;
  }

  if (milestone > 0 && !run.sentMilestones.includes(milestone)) {
    run.sentMilestones.push(milestone);
    postEvent({
      type: 'quiz_progress',
      pageKey: 'quiz',
      relationshipStatus: args.relationshipStatus,
      progressPct: milestone,
      answeredCount: args.mainProgress,
      mainTotal: args.mainTotal,
      detail: {
        kind: 'milestone',
      },
    });
    changed = true;
  }

  if (changed) {
    writeQuizRun(run);
  }
}

function rememberLastCompletion(hash: string): void {
  const store = getSessionStorage();
  if (!store) return;
  store.setItem(
    LAST_COMPLETION_KEY,
    JSON.stringify({
      hash,
      ts: Date.now(),
    }),
  );
}

function readLastCompletion():
  | {
      hash: string;
      ts: number;
    }
  | null {
  const store = getSessionStorage();
  if (!store) return null;
  const raw = store.getItem(LAST_COMPLETION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { hash: string; ts: number };
  } catch {
    return null;
  }
}

function clearLastCompletion(): void {
  const store = getSessionStorage();
  if (!store) return;
  store.removeItem(LAST_COMPLETION_KEY);
}

export function trackQuizComplete(args: {
  hash: string;
  status: Exclude<RelationshipStatus, null>;
  result: Result;
  retreatCount: number;
  answeredCount: number;
  mainTotal: number;
  answers: Array<{
    questionId: number;
    optionIndex: number;
  }>;
}): void {
  const run = readQuizRun();
  const durationMs = run ? Date.now() - run.startedAt : undefined;
  rememberLastCompletion(args.hash);
  postEvent(
    {
      type: 'quiz_complete',
      pageKey: 'quiz',
      relationshipStatus: args.status,
      resultCode: args.result.code,
      displayCode: args.result.displayCode,
      isHidden: args.result.isHidden,
      hiddenTitles: args.result.unlockedHiddenTitles.map((item) => item.name),
      wasteLevel: args.result.personality.wasteLevel,
      retreatCount: args.retreatCount,
      answeredCount: args.answeredCount,
      mainTotal: args.mainTotal,
      progressPct: 100,
      durationMs,
      hashVersion: args.hash.startsWith('v2.') ? 2 : 1,
      source: 'fresh_submit',
      score: {
        GD: args.result.scores.GD,
        ZR: args.result.scores.ZR,
        NL: args.result.scores.NL,
        YF: args.result.scores.YF,
      },
      answers: args.answers,
      detail: {
        hashLength: args.hash.length,
      },
    },
    true,
  );
  writeQuizRun(null);
}

export function trackResultView(args: {
  hash?: string;
  result: Result;
  isLegacy?: boolean;
}): void {
  const hash = args.hash ?? '';
  const lastCompletion = readLastCompletion();
  const isFreshSubmit =
    !!hash &&
    !!lastCompletion &&
    lastCompletion.hash === hash &&
    Date.now() - lastCompletion.ts < 10 * 60_000;

  if (isFreshSubmit) {
    clearLastCompletion();
  }

  postEvent({
    type: 'result_view',
    pageKey: 'result',
    relationshipStatus: args.result.status,
    resultCode: args.result.code,
    displayCode: args.result.displayCode,
    isHidden: args.result.isHidden,
    isLegacy: !!args.isLegacy,
    hiddenTitles: args.result.unlockedHiddenTitles.map((item) => item.name),
    wasteLevel: args.result.personality.wasteLevel,
    hashVersion: hash.startsWith('v2.') ? 2 : hash ? 1 : undefined,
    source: isFreshSubmit ? 'fresh_submit' : hash ? 'share_link' : 'unknown',
    score: {
      GD: args.result.scores.GD,
      ZR: args.result.scores.ZR,
      NL: args.result.scores.NL,
      YF: args.result.scores.YF,
    },
  });
}

export function trackShareImageOpen(result: Result): void {
  postEvent({
    type: 'share_image_open',
    pageKey: 'result',
    relationshipStatus: result.status,
    resultCode: result.code,
    displayCode: result.displayCode,
    isHidden: result.isHidden,
    hiddenTitles: result.unlockedHiddenTitles.map((item) => item.name),
    wasteLevel: result.personality.wasteLevel,
  });
}

export function trackExplainAiClick(result: Result, hash?: string): void {
  postEvent({
    type: 'explain_ai_click',
    pageKey: 'result',
    relationshipStatus: result.status,
    resultCode: result.code,
    displayCode: result.displayCode,
    isHidden: result.isHidden,
    hiddenTitles: result.unlockedHiddenTitles.map((item) => item.name),
    wasteLevel: result.personality.wasteLevel,
    hashVersion: hash?.startsWith('v2.') ? 2 : hash ? 1 : undefined,
  });
}
