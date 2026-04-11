CREATE TABLE IF NOT EXISTS telemetry_events (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  page_key TEXT,
  route_path TEXT,
  referrer_host TEXT,
  relationship_status TEXT,
  result_code TEXT,
  display_code TEXT,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  is_legacy INTEGER NOT NULL DEFAULT 0,
  hidden_titles_count INTEGER NOT NULL DEFAULT 0,
  waste_level INTEGER,
  retreat_count INTEGER,
  answered_count INTEGER,
  main_total INTEGER,
  progress_pct INTEGER,
  duration_ms INTEGER,
  hash_version INTEGER,
  source TEXT,
  score_gd REAL,
  score_zr REAL,
  score_nl REAL,
  score_yf REAL,
  viewport_bucket TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  colo TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  detail_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_occurred_at
  ON telemetry_events (occurred_at);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_type_occurred_at
  ON telemetry_events (event_type, occurred_at);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_session_type
  ON telemetry_events (session_id, event_type);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_result_code
  ON telemetry_events (result_code, occurred_at);

CREATE TABLE IF NOT EXISTS telemetry_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  relationship_status TEXT,
  question_id INTEGER NOT NULL,
  question_dimension TEXT,
  question_tag TEXT,
  option_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_answers_submission
  ON telemetry_answers (submission_id);

CREATE INDEX IF NOT EXISTS idx_telemetry_answers_question
  ON telemetry_answers (question_id, occurred_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_telemetry_answers_submission_question_option
  ON telemetry_answers (submission_id, question_id, option_index);

CREATE TABLE IF NOT EXISTS telemetry_hidden_titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  title_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_hidden_titles_name
  ON telemetry_hidden_titles (title_name, occurred_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_telemetry_hidden_titles_submission_title
  ON telemetry_hidden_titles (submission_id, title_name);
