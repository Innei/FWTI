/// <reference types="@cloudflare/workers-types" />

import { questionIndex } from '../src/copy/questions';

type TelemetryEventType =
  | 'page_view'
  | 'quiz_start'
  | 'quiz_progress'
  | 'quiz_complete'
  | 'result_view'
  | 'share_image_open'
  | 'explain_ai_click';

type KVRow = {
  key: string;
  value: number;
};

type DashboardData = {
  generatedAt: string;
  days: number;
  overview: {
    pageViews: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    quizStarts: number;
    quizCompletes: number;
    resultViews: number;
    shareResultViews: number;
    shareImageOpens: number;
    explainClicks: number;
    completionRate: number;
    avgCompletionMs: number;
  };
  funnel: KVRow[];
  pageViews: KVRow[];
  resultCodes: KVRow[];
  resultShares: KVRow[];
  statuses: KVRow[];
  hiddenTitles: KVRow[];
  wasteLevels: KVRow[];
  countries: KVRow[];
  devices: KVRow[];
  browsers: KVRow[];
  referrers: KVRow[];
  utmSources: KVRow[];
  scoreAverages: {
    GD: number;
    ZR: number;
    NL: number;
    YF: number;
  };
  answerQuestions: Array<{
    questionId: number;
    text: string;
    dimension: string;
    tag: string;
    total: number;
    options: Array<{
      label: string;
      text: string;
      value: number;
      pct: number;
    }>;
  }>;
};

interface Env {
  TELEMETRY_DB: D1Database;
  DASHBOARD_USERNAME?: string;
  DASHBOARD_PASSWORD?: string;
}

type IncomingEvent = {
  id: string;
  visitorId: string;
  sessionId: string;
  type: TelemetryEventType;
  occurredAt: number;
  pageKey?: string;
  routePath?: string;
  referrer?: string;
  relationshipStatus?: string;
  resultCode?: string;
  displayCode?: string;
  isHidden: boolean;
  isLegacy: boolean;
  hiddenTitles: string[];
  wasteLevel?: number;
  retreatCount?: number;
  answeredCount?: number;
  mainTotal?: number;
  progressPct?: number;
  durationMs?: number;
  hashVersion?: number;
  source?: string;
  score?: {
    GD?: number;
    ZR?: number;
    NL?: number;
    YF?: number;
  };
  answers: Array<{
    questionId: number;
    optionIndex: number;
  }>;
  detail?: Record<string, unknown>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  viewport?: {
    bucket?: string;
  };
};

const EVENT_TYPES = new Set<TelemetryEventType>([
  'page_view',
  'quiz_start',
  'quiz_progress',
  'quiz_complete',
  'result_view',
  'share_image_open',
  'explain_ai_click',
]);

const PAGE_LABELS: Record<string, string> = {
  home: '首页',
  quiz: '答题页',
  result: '结果页',
  history: '历史页',
};

const STATUS_LABELS: Record<string, string> = {
  dating: '恋爱中',
  ambiguous: '暧昧中',
  crush: '心里有人',
  solo: '纯单身',
};

const FUNNEL_LABELS: Record<string, string> = {
  home_view: '首页访问',
  quiz_start: '进入答题',
  quiz_25: '答题 25%',
  quiz_50: '答题 50%',
  quiz_75: '答题 75%',
  quiz_complete: '提交结果',
  result_view: '结果页浏览',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (url.pathname === '/api/events' && request.method === 'POST') {
      return handleEventIngest(request, env);
    }

    if (url.pathname === '/api/dashboard' && request.method === 'GET') {
      if (!isDashboardAuthorized(request, env)) {
        return unauthorizedResponse();
      }
      const days = parseDays(url.searchParams.get('days'));
      const data = await loadDashboardData(env.TELEMETRY_DB, days);
      return json(data);
    }

    if (
      (url.pathname === '/' || url.pathname === '/dashboard') &&
      request.method === 'GET'
    ) {
      if (!isDashboardAuthorized(request, env)) {
        return unauthorizedResponse();
      }
      const days = parseDays(url.searchParams.get('days'));
      const data = await loadDashboardData(env.TELEMETRY_DB, days);
      return new Response(renderDashboardHtml(data), {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    if (url.pathname === '/healthz' && request.method === 'GET') {
      return json({
        ok: true,
        now: new Date().toISOString(),
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleEventIngest(request: Request, env: Env): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400, corsHeaders());
  }

  const event = normalizeIncomingEvent(rawBody);
  if (!event) {
    return json({ ok: false, error: 'invalid_payload' }, 400, corsHeaders());
  }

  const cf = request.cf;
  const ua = request.headers.get('user-agent') ?? '';
  const referrerHost = getReferrerHost(event.referrer);
  const uaInfo = parseUserAgent(ua);
  const detailsJson = event.detail ? safeJsonStringify(event.detail, 4000) : null;

  const eventStmt = env.TELEMETRY_DB.prepare(
    `INSERT OR IGNORE INTO telemetry_events (
      id,
      visitor_id,
      session_id,
      event_type,
      occurred_at,
      page_key,
      route_path,
      referrer_host,
      relationship_status,
      result_code,
      display_code,
      is_hidden,
      is_legacy,
      hidden_titles_count,
      waste_level,
      retreat_count,
      answered_count,
      main_total,
      progress_pct,
      duration_ms,
      hash_version,
      source,
      score_gd,
      score_zr,
      score_nl,
      score_yf,
      viewport_bucket,
      device_type,
      browser,
      os,
      country,
      colo,
      utm_source,
      utm_medium,
      utm_campaign,
      detail_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    event.id,
    event.visitorId,
    event.sessionId,
    event.type,
    event.occurredAt,
    event.pageKey ?? null,
    event.routePath ?? null,
    referrerHost,
    event.relationshipStatus ?? null,
    event.resultCode ?? null,
    event.displayCode ?? null,
    event.isHidden ? 1 : 0,
    event.isLegacy ? 1 : 0,
    event.hiddenTitles.length,
    event.wasteLevel ?? null,
    event.retreatCount ?? null,
    event.answeredCount ?? null,
    event.mainTotal ?? null,
    event.progressPct ?? null,
    event.durationMs ?? null,
    event.hashVersion ?? null,
    event.source ?? null,
    toFiniteNumber(event.score?.GD),
    toFiniteNumber(event.score?.ZR),
    toFiniteNumber(event.score?.NL),
    toFiniteNumber(event.score?.YF),
    event.viewport?.bucket ?? null,
    uaInfo.deviceType,
    uaInfo.browser,
    uaInfo.os,
    cf?.country ?? null,
    cf?.colo ?? null,
    event.utm?.source ?? null,
    event.utm?.medium ?? null,
    event.utm?.campaign ?? null,
    detailsJson,
  );

  const statements = [eventStmt];

  if (event.type === 'quiz_complete') {
    for (const answer of event.answers) {
      const question = questionIndex[answer.questionId];
      if (!question) continue;
      statements.push(
        env.TELEMETRY_DB.prepare(
          `INSERT OR IGNORE INTO telemetry_answers (
            submission_id,
            visitor_id,
            session_id,
            occurred_at,
            relationship_status,
            question_id,
            question_dimension,
            question_tag,
            option_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          event.id,
          event.visitorId,
          event.sessionId,
          event.occurredAt,
          event.relationshipStatus ?? null,
          question.id,
          question.dimension,
          question.tag ?? '',
          answer.optionIndex,
        ),
      );
    }

    for (const titleName of event.hiddenTitles) {
      statements.push(
        env.TELEMETRY_DB.prepare(
          `INSERT OR IGNORE INTO telemetry_hidden_titles (
            submission_id,
            visitor_id,
            session_id,
            occurred_at,
            title_name
          ) VALUES (?, ?, ?, ?, ?)`,
        ).bind(
          event.id,
          event.visitorId,
          event.sessionId,
          event.occurredAt,
          titleName,
        ),
      );
    }
  }

  await env.TELEMETRY_DB.batch(statements);
  return json({ ok: true }, 200, corsHeaders());
}

function normalizeIncomingEvent(raw: unknown): IncomingEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;
  const type = toText(source.type, 48) as TelemetryEventType | null;
  if (!type || !EVENT_TYPES.has(type)) return null;

  const visitorId = toText(source.visitorId, 128);
  const sessionId = toText(source.sessionId, 128);
  if (!visitorId || !sessionId) return null;

  const answers = Array.isArray(source.answers)
    ? source.answers.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const answer = item as Record<string, unknown>;
        const questionId = toInt(answer.questionId, 1, 10_000);
        const optionIndex = toInt(answer.optionIndex, 0, 9);
        if (questionId === null || optionIndex === null) return [];
        if (!questionIndex[questionId]) return [];
        return [{ questionId, optionIndex }];
      })
    : [];

  const hiddenTitles = Array.isArray(source.hiddenTitles)
    ? source.hiddenTitles.flatMap((item) => {
        const value = toText(item, 120);
        return value ? [value] : [];
      })
    : [];

  return {
    id: toText(source.id, 128) ?? crypto.randomUUID(),
    visitorId,
    sessionId,
    type,
    occurredAt: toInt(source.occurredAt, 1, 9_999_999_999_999) ?? Date.now(),
    pageKey: toText(source.pageKey, 32) ?? undefined,
    routePath: toText(source.routePath, 256) ?? undefined,
    referrer: toText(source.referrer, 1024) ?? undefined,
    relationshipStatus: toText(source.relationshipStatus, 32) ?? undefined,
    resultCode: toText(source.resultCode, 32) ?? undefined,
    displayCode: toText(source.displayCode, 32) ?? undefined,
    isHidden: !!source.isHidden,
    isLegacy: !!source.isLegacy,
    hiddenTitles,
    wasteLevel: toInt(source.wasteLevel, 0, 5) ?? undefined,
    retreatCount: toInt(source.retreatCount, 0, 10_000) ?? undefined,
    answeredCount: toInt(source.answeredCount, 0, 1000) ?? undefined,
    mainTotal: toInt(source.mainTotal, 0, 1000) ?? undefined,
    progressPct: toInt(source.progressPct, 0, 100) ?? undefined,
    durationMs: toInt(source.durationMs, 0, 86_400_000) ?? undefined,
    hashVersion: toInt(source.hashVersion, 1, 9) ?? undefined,
    source: toText(source.source, 64) ?? undefined,
    score: toScore(source.score),
    answers,
    detail: isPlainObject(source.detail)
      ? (source.detail as Record<string, unknown>)
      : undefined,
    utm: isPlainObject(source.utm)
      ? {
          source: toText((source.utm as Record<string, unknown>).source, 120) ?? undefined,
          medium: toText((source.utm as Record<string, unknown>).medium, 120) ?? undefined,
          campaign:
            toText((source.utm as Record<string, unknown>).campaign, 120) ?? undefined,
        }
      : undefined,
    viewport: isPlainObject(source.viewport)
      ? {
          bucket:
            toText((source.viewport as Record<string, unknown>).bucket, 32) ?? undefined,
        }
      : undefined,
  };
}

async function loadDashboardData(db: D1Database, days: number): Promise<DashboardData> {
  const fromTs = Date.now() - days * 24 * 60 * 60 * 1000;

  const [
    overview,
    funnel,
    pageViews,
    resultCodes,
    resultShares,
    statuses,
    hiddenTitles,
    wasteLevels,
    countries,
    devices,
    browsers,
    referrers,
    utmSources,
    scoreAverages,
    answerRows,
  ] = await Promise.all([
    fetchOverview(db, fromTs),
    fetchRows(
      db,
      `SELECT 'home_view' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view' AND page_key = 'home'
       UNION ALL
       SELECT 'quiz_start' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_start'
       UNION ALL
       SELECT 'quiz_25' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_progress' AND progress_pct = 25
       UNION ALL
       SELECT 'quiz_50' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_progress' AND progress_pct = 50
       UNION ALL
       SELECT 'quiz_75' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_progress' AND progress_pct = 75
       UNION ALL
       SELECT 'quiz_complete' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_complete'
       UNION ALL
       SELECT 'result_view' AS key, COUNT(DISTINCT session_id) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'result_view'`,
      [fromTs, fromTs, fromTs, fromTs, fromTs, fromTs, fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(page_key, '(unknown)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(result_code, '(unknown)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_complete'
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(result_code, '(unknown)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'result_view' AND source = 'share_link'
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(relationship_status, '(unknown)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_complete'
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT title_name AS key, COUNT(*) AS value
         FROM telemetry_hidden_titles
        WHERE occurred_at >= ?
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(CAST(waste_level AS TEXT), '(unknown)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_complete'
        GROUP BY 1
        ORDER BY key ASC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(country, 'Unknown') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC
        LIMIT 12`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(device_type, 'unknown') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(browser, 'unknown') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC
        LIMIT 12`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(NULLIF(referrer_host, ''), '(direct)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC
        LIMIT 12`,
      [fromTs],
    ),
    fetchRows(
      db,
      `SELECT COALESCE(NULLIF(utm_source, ''), '(direct)') AS key, COUNT(*) AS value
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'page_view'
        GROUP BY 1
        ORDER BY value DESC
        LIMIT 12`,
      [fromTs],
    ),
    fetchScoreAverages(db, fromTs),
    fetchAnswerRows(db, fromTs),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    days,
    overview,
    funnel,
    pageViews,
    resultCodes,
    resultShares,
    statuses,
    hiddenTitles,
    wasteLevels,
    countries,
    devices,
    browsers,
    referrers,
    utmSources,
    scoreAverages,
    answerQuestions: groupAnswerRows(answerRows),
  };
}

async function fetchOverview(db: D1Database, fromTs: number) {
  const row =
    (await db
      .prepare(
        `SELECT
          SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
          COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN visitor_id END) AS unique_visitors,
          COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) AS unique_sessions,
          SUM(CASE WHEN event_type = 'quiz_start' THEN 1 ELSE 0 END) AS quiz_starts,
          SUM(CASE WHEN event_type = 'quiz_complete' THEN 1 ELSE 0 END) AS quiz_completes,
          SUM(CASE WHEN event_type = 'result_view' THEN 1 ELSE 0 END) AS result_views,
          SUM(CASE WHEN event_type = 'result_view' AND source = 'share_link' THEN 1 ELSE 0 END) AS share_result_views,
          SUM(CASE WHEN event_type = 'share_image_open' THEN 1 ELSE 0 END) AS share_image_opens,
          SUM(CASE WHEN event_type = 'explain_ai_click' THEN 1 ELSE 0 END) AS explain_clicks,
          AVG(CASE WHEN event_type = 'quiz_complete' THEN duration_ms END) AS avg_completion_ms
         FROM telemetry_events
        WHERE occurred_at >= ?`,
      )
      .bind(fromTs)
      .first<{
        page_views?: number;
        unique_visitors?: number;
        unique_sessions?: number;
        quiz_starts?: number;
        quiz_completes?: number;
        result_views?: number;
        share_result_views?: number;
        share_image_opens?: number;
        explain_clicks?: number;
        avg_completion_ms?: number;
      }>()) ?? {};

  const quizStarts = row.quiz_starts ?? 0;
  const quizCompletes = row.quiz_completes ?? 0;

  return {
    pageViews: row.page_views ?? 0,
    uniqueVisitors: row.unique_visitors ?? 0,
    uniqueSessions: row.unique_sessions ?? 0,
    quizStarts,
    quizCompletes,
    resultViews: row.result_views ?? 0,
    shareResultViews: row.share_result_views ?? 0,
    shareImageOpens: row.share_image_opens ?? 0,
    explainClicks: row.explain_clicks ?? 0,
    completionRate: quizStarts > 0 ? quizCompletes / quizStarts : 0,
    avgCompletionMs: Math.round(row.avg_completion_ms ?? 0),
  };
}

async function fetchScoreAverages(db: D1Database, fromTs: number) {
  const row =
    (await db
      .prepare(
        `SELECT
          AVG(score_gd) AS gd,
          AVG(score_zr) AS zr,
          AVG(score_nl) AS nl,
          AVG(score_yf) AS yf
         FROM telemetry_events
        WHERE occurred_at >= ? AND event_type = 'quiz_complete'`,
      )
      .bind(fromTs)
      .first<{ gd?: number; zr?: number; nl?: number; yf?: number }>()) ?? {};

  return {
    GD: round2(row.gd ?? 0),
    ZR: round2(row.zr ?? 0),
    NL: round2(row.nl ?? 0),
    YF: round2(row.yf ?? 0),
  };
}

async function fetchAnswerRows(db: D1Database, fromTs: number) {
  const result = await db
    .prepare(
      `SELECT question_id, option_index, COUNT(*) AS value
         FROM telemetry_answers
        WHERE occurred_at >= ?
        GROUP BY question_id, option_index
        ORDER BY question_id ASC, option_index ASC`,
    )
    .bind(fromTs)
    .all<{ question_id: number; option_index: number; value: number }>();
  return result.results ?? [];
}

function groupAnswerRows(
  rows: Array<{ question_id: number; option_index: number; value: number }>,
) {
  const grouped = new Map<number, Array<{ optionIndex: number; value: number }>>();
  for (const row of rows) {
    const current = grouped.get(row.question_id) ?? [];
    current.push({
      optionIndex: row.option_index,
      value: row.value,
    });
    grouped.set(row.question_id, current);
  }

  return Array.from(grouped.entries())
    .map(([questionId, optionRows]) => {
      const question = questionIndex[questionId];
      if (!question) return null;
      const total = optionRows.reduce((sum, row) => sum + row.value, 0);
      return {
        questionId,
        text: question.text,
        dimension: question.dimension,
        tag: question.tag ?? '',
        total,
        options: optionRows.map((row) => ({
          label: question.options[row.optionIndex]?.label ?? `#${row.optionIndex}`,
          text: question.options[row.optionIndex]?.text ?? '(unknown)',
          value: row.value,
          pct: total > 0 ? row.value / total : 0,
        })),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function fetchRows(
  db: D1Database,
  sql: string,
  binds: unknown[],
): Promise<KVRow[]> {
  const result = await db.prepare(sql).bind(...binds).all<{ key: string; value: number }>();
  return (result.results ?? []).map((row) => ({
    key: row.key,
    value: row.value,
  }));
}

function renderDashboardHtml(data: DashboardData): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FWTI Telemetry Dashboard</title>
    <style>
      :root {
        --bg: #f3f6f4;
        --surface: #ffffff;
        --surface-strong: #f7fbf8;
        --text: #112218;
        --muted: #5a6b61;
        --border: #dbe6de;
        --accent: #2d8f63;
        --accent-soft: #dff3e8;
        --danger: #c84d4d;
        --shadow: 0 20px 48px rgba(17, 34, 24, 0.08);
        --radius: 18px;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(45, 143, 99, 0.10), transparent 32%),
          linear-gradient(180deg, #f8fbf9 0%, var(--bg) 100%);
        color: var(--text);
      }
      .shell {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px 24px 64px;
      }
      .hero {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr;
        gap: 20px;
        margin-bottom: 24px;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .hero-card {
        padding: 28px;
      }
      .hero-title {
        margin: 0 0 10px;
        font-size: 30px;
        font-weight: 800;
        letter-spacing: 0.01em;
      }
      .hero-sub {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .hero-meta {
        display: grid;
        gap: 10px;
        align-content: start;
        padding: 24px;
        background: linear-gradient(180deg, #ffffff 0%, var(--surface-strong) 100%);
      }
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
        background: #fff;
      }
      .chip.is-active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 20px;
      }
      .span-12 { grid-column: span 12; }
      .span-8 { grid-column: span 8; }
      .span-6 { grid-column: span 6; }
      .span-4 { grid-column: span 4; }
      .span-3 { grid-column: span 3; }
      .panel {
        padding: 22px;
      }
      .panel h2 {
        margin: 0 0 18px;
        font-size: 20px;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }
      .kpi {
        padding: 18px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: linear-gradient(180deg, #ffffff 0%, var(--surface-strong) 100%);
      }
      .kpi-label {
        color: var(--muted);
        font-size: 13px;
        margin-bottom: 10px;
      }
      .kpi-value {
        font-size: 30px;
        font-weight: 800;
      }
      .kpi-note {
        margin-top: 8px;
        font-size: 13px;
        color: var(--muted);
      }
      .bar-list {
        display: grid;
        gap: 12px;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 170px minmax(0, 1fr) 72px;
        gap: 14px;
        align-items: center;
      }
      .bar-label {
        font-size: 14px;
        color: var(--text);
      }
      .bar-track {
        height: 14px;
        border-radius: 999px;
        background: #edf2ee;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent) 0%, #55b987 100%);
      }
      .bar-value {
        text-align: right;
        font-variant-numeric: tabular-nums;
        color: var(--muted);
      }
      .funnel-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 12px;
      }
      .funnel-step {
        padding: 16px 14px;
        border-radius: 16px;
        background: linear-gradient(180deg, #ffffff 0%, var(--surface-strong) 100%);
        border: 1px solid var(--border);
      }
      .funnel-step strong {
        display: block;
        font-size: 22px;
        margin-top: 8px;
      }
      .tiny {
        color: var(--muted);
        font-size: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 12px 10px;
        border-bottom: 1px solid var(--border);
        text-align: left;
        vertical-align: top;
      }
      th {
        font-size: 13px;
        color: var(--muted);
        font-weight: 700;
      }
      td {
        font-size: 14px;
      }
      .answer-card {
        padding: 18px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: linear-gradient(180deg, #ffffff 0%, var(--surface-strong) 100%);
      }
      .answer-grid {
        display: grid;
        gap: 14px;
      }
      .answer-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: baseline;
      }
      .answer-title {
        font-size: 16px;
        font-weight: 700;
      }
      .answer-meta {
        color: var(--muted);
        font-size: 13px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        margin-left: 8px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
      }
      .empty {
        color: var(--muted);
        margin: 0;
      }
      .score-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .score-box {
        padding: 16px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: linear-gradient(180deg, #ffffff 0%, var(--surface-strong) 100%);
      }
      .score-box strong {
        display: block;
        margin-top: 8px;
        font-size: 24px;
      }
      @media (max-width: 1200px) {
        .hero { grid-template-columns: 1fr; }
        .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .funnel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .span-8, .span-6, .span-4, .span-3 { grid-column: span 12; }
      }
      @media (max-width: 720px) {
        .shell { padding: 20px 14px 40px; }
        .kpi-grid { grid-template-columns: 1fr; }
        .bar-row { grid-template-columns: 1fr; }
        .score-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="card hero-card">
          <h1 class="hero-title">FWTI 遥测面板</h1>
          <p class="hero-sub">
            该面板聚合访问量、答题漏斗、结果分布与题目选项分布，便于直接观察产品流失点、
            题目偏斜与分享传播效果。
          </p>
          <div class="chip-row">
            ${renderDayChip(1, data.days)}
            ${renderDayChip(7, data.days)}
            ${renderDayChip(30, data.days)}
            <a class="chip" href="/api/dashboard?days=${data.days}">JSON</a>
          </div>
        </div>
        <aside class="card hero-meta">
          <div><strong>统计窗口</strong><div class="tiny">最近 ${data.days} 天</div></div>
          <div><strong>生成时间</strong><div class="tiny">${escapeHtml(formatDateTime(data.generatedAt))}</div></div>
          <div><strong>接口</strong><div class="tiny">POST /api/events</div></div>
        </aside>
      </section>

      <section class="card panel span-12">
        <h2>核心概览</h2>
        <div class="kpi-grid">
          ${renderKpi('页面浏览', formatInteger(data.overview.pageViews), `访客 ${formatInteger(data.overview.uniqueVisitors)} / 会话 ${formatInteger(data.overview.uniqueSessions)}`)}
          ${renderKpi('答题开始', formatInteger(data.overview.quizStarts), `提交 ${formatInteger(data.overview.quizCompletes)}`)}
          ${renderKpi('完成率', formatPercent(data.overview.completionRate), `基于 quiz_start -> quiz_complete`)}
          ${renderKpi('平均完成时长', formatDuration(data.overview.avgCompletionMs), '仅统计完成答卷')}
          ${renderKpi('分享传播', formatInteger(data.overview.shareResultViews), `分享图 ${formatInteger(data.overview.shareImageOpens)} / AI 解读 ${formatInteger(data.overview.explainClicks)}`)}
        </div>
      </section>

      <section class="grid">
        <div class="card panel span-12">
          <h2>答题漏斗</h2>
          <div class="funnel-grid">
            ${data.funnel
              .map(
                (row) => `<div class="funnel-step">
                  <div class="tiny">${escapeHtml(FUNNEL_LABELS[row.key] ?? row.key)}</div>
                  <strong>${formatInteger(row.value)}</strong>
                </div>`,
              )
              .join('')}
          </div>
        </div>

        <div class="card panel span-6">
          <h2>访问页面</h2>
          ${renderBarList(data.pageViews, (row) => PAGE_LABELS[row.key] ?? row.key)}
        </div>

        <div class="card panel span-6">
          <h2>答卷结果分布</h2>
          ${renderBarList(data.resultCodes, (row) => row.key)}
        </div>

        <div class="card panel span-4">
          <h2>状态分布</h2>
          ${renderBarList(data.statuses, (row) => STATUS_LABELS[row.key] ?? row.key)}
        </div>

        <div class="card panel span-4">
          <h2>隐藏称号命中</h2>
          ${renderBarList(data.hiddenTitles, (row) => row.key)}
        </div>

        <div class="card panel span-4">
          <h2>分享结果来源</h2>
          ${renderBarList(data.resultShares, (row) => row.key)}
        </div>

        <div class="card panel span-6">
          <h2>设备与浏览器</h2>
          <div class="score-grid" style="margin-bottom: 18px;">
            <div class="score-box">
              <div class="tiny">设备</div>
              ${renderInlineList(data.devices)}
            </div>
            <div class="score-box" style="grid-column: span 3;">
              <div class="tiny">浏览器</div>
              ${renderInlineList(data.browsers)}
            </div>
          </div>
          ${renderBarList(data.devices, (row) => row.key)}
        </div>

        <div class="card panel span-6">
          <h2>地域与来源</h2>
          <div style="display:grid; gap:18px;">
            <div>
              <div class="tiny" style="margin-bottom:10px;">国家 / 地区</div>
              ${renderBarList(data.countries, (row) => row.key)}
            </div>
            <div>
              <div class="tiny" style="margin-bottom:10px;">Referrer</div>
              ${renderBarList(data.referrers, (row) => row.key)}
            </div>
            <div>
              <div class="tiny" style="margin-bottom:10px;">UTM Source</div>
              ${renderBarList(data.utmSources, (row) => row.key)}
            </div>
          </div>
        </div>

        <div class="card panel span-6">
          <h2>废物等级分布</h2>
          ${renderBarList(data.wasteLevels, (row) => `${row.key} / 5`)}
        </div>

        <div class="card panel span-6">
          <h2>四维平均分</h2>
          <div class="score-grid">
            ${renderScoreBox('GD', data.scoreAverages.GD)}
            ${renderScoreBox('ZR', data.scoreAverages.ZR)}
            ${renderScoreBox('NL', data.scoreAverages.NL)}
            ${renderScoreBox('YF', data.scoreAverages.YF)}
          </div>
        </div>

        <div class="card panel span-12">
          <h2>题目选项分布</h2>
          <div class="answer-grid">
            ${renderAnswerQuestions(data.answerQuestions)}
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function renderDayChip(days: number, activeDays: number): string {
  return `<a class="chip ${days === activeDays ? 'is-active' : ''}" href="/dashboard?days=${days}">最近 ${days} 天</a>`;
}

function renderKpi(label: string, value: string, note: string): string {
  return `<div class="kpi">
    <div class="kpi-label">${escapeHtml(label)}</div>
    <div class="kpi-value">${escapeHtml(value)}</div>
    <div class="kpi-note">${escapeHtml(note)}</div>
  </div>`;
}

function renderBarList(
  rows: KVRow[],
  label: (row: KVRow) => string,
): string {
  if (rows.length === 0) {
    return '<p class="empty">暂无数据</p>';
  }
  const max = Math.max(...rows.map((row) => row.value), 1);
  return `<div class="bar-list">
    ${rows
      .map((row) => {
        const pct = Math.max((row.value / max) * 100, 2);
        return `<div class="bar-row">
          <div class="bar-label">${escapeHtml(label(row))}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="bar-value">${formatInteger(row.value)}</div>
        </div>`;
      })
      .join('')}
  </div>`;
}

function renderInlineList(rows: KVRow[]): string {
  if (rows.length === 0) {
    return '<p class="empty">暂无数据</p>';
  }
  return `<table>
    <tbody>
      ${rows
        .slice(0, 6)
        .map(
          (row) => `<tr>
            <td>${escapeHtml(row.key)}</td>
            <td style="text-align:right;">${formatInteger(row.value)}</td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
}

function renderScoreBox(label: string, value: number): string {
  return `<div class="score-box">
    <div class="tiny">${escapeHtml(label)}</div>
    <strong>${escapeHtml(value.toFixed(2))}</strong>
  </div>`;
}

function renderAnswerQuestions(data: DashboardData['answerQuestions']): string {
  if (data.length === 0) {
    return '<p class="empty">暂无答题分布数据</p>';
  }
  return data
    .map((question) => {
      const tag = question.tag ? `<span class="badge">${escapeHtml(question.tag)}</span>` : '';
      return `<article class="answer-card">
        <div class="answer-head">
          <div>
            <div class="answer-title">Q${question.questionId} · ${escapeHtml(question.text)}${tag}</div>
            <div class="answer-meta">维度 ${escapeHtml(question.dimension)} · 样本 ${formatInteger(question.total)}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>选项</th>
              <th>文案</th>
              <th>次数</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            ${question.options
              .map(
                (option) => `<tr>
                  <td>${escapeHtml(option.label)}</td>
                  <td>${escapeHtml(option.text)}</td>
                  <td>${formatInteger(option.value)}</td>
                  <td>${formatPercent(option.pct)}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </article>`;
    })
    .join('');
}

function isDashboardAuthorized(request: Request, env: Env): boolean {
  if (!env.DASHBOARD_USERNAME || !env.DASHBOARD_PASSWORD) {
    return true;
  }
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Basic ')) return false;
  const encoded = header.slice(6);
  let decoded = '';
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const [username, password] = decoded.split(':');
  return (
    username === env.DASHBOARD_USERNAME && password === env.DASHBOARD_PASSWORD
  );
}

function unauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="FWTI Telemetry"',
    },
  });
}

function corsHeaders(): HeadersInit {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS, GET',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  };
}

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(extraHeaders ?? {}),
    },
  });
}

function parseDays(raw: string | null): number {
  if (!raw) return 7;
  const value = Number(raw);
  if (!Number.isInteger(value)) return 7;
  if (value <= 1) return 1;
  if (value >= 30) return 30;
  return 7;
}

function toText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function toInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

function toScore(value: unknown): IncomingEvent['score'] | undefined {
  if (!isPlainObject(value)) return undefined;
  const source = value as Record<string, unknown>;
  return {
    GD: toFiniteNumber(source.GD) ?? undefined,
    ZR: toFiniteNumber(source.ZR) ?? undefined,
    NL: toFiniteNumber(source.NL) ?? undefined,
    YF: toFiniteNumber(source.YF) ?? undefined,
  };
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getReferrerHost(raw?: string): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

function parseUserAgent(ua: string): {
  browser: string | null;
  os: string | null;
  deviceType: string | null;
} {
  const browser =
    /edg\//i.test(ua)
      ? 'Edge'
      : /chrome\//i.test(ua)
        ? 'Chrome'
        : /firefox\//i.test(ua)
          ? 'Firefox'
          : /safari\//i.test(ua) && !/chrome\//i.test(ua)
            ? 'Safari'
            : /wechat/i.test(ua)
              ? 'WeChat'
              : 'Other';

  const os =
    /iphone|ipad|ios/i.test(ua)
      ? 'iOS'
      : /android/i.test(ua)
        ? 'Android'
        : /mac os x/i.test(ua)
          ? 'macOS'
          : /windows nt/i.test(ua)
            ? 'Windows'
            : /linux/i.test(ua)
              ? 'Linux'
              : 'Other';

  const deviceType =
    /ipad|tablet/i.test(ua)
      ? 'tablet'
      : /mobile|iphone|android/i.test(ua)
        ? 'mobile'
        : 'desktop';

  return {
    browser,
    os,
    deviceType,
  };
}

function safeJsonStringify(value: unknown, maxLength: number): string {
  const jsonText = JSON.stringify(value);
  return jsonText.length <= maxLength
    ? jsonText
    : `${jsonText.slice(0, maxLength - 1)}…`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value >= 0.1 ? 1 : 2)}%`;
}

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return '0s';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
