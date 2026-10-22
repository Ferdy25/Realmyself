CREATE TABLE IF NOT EXISTS pipeline_runs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  records_processed INTEGER NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(10, 3),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  temperature_c NUMERIC(5, 2),
  humidity_pct INTEGER,
  precipitation_mm NUMERIC(6, 2),
  wind_speed_kmh NUMERIC(6, 2),
  weather_code INTEGER,
  raw_payload JSONB,
  chart_path TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at ON pipeline_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS pipeline_task_runs (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  records_processed INTEGER NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(10, 3),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_pipeline_task_runs_run_id ON pipeline_task_runs (run_id, id);

CREATE TABLE IF NOT EXISTS weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  valid_at TIMESTAMPTZ NOT NULL,
  temperature_c NUMERIC(5, 2),
  humidity_pct INTEGER,
  precipitation_probability_pct INTEGER,
  wind_speed_kmh NUMERIC(6, 2),
  weather_code INTEGER
);

CREATE INDEX IF NOT EXISTS idx_weather_forecasts_run_time ON weather_forecasts (run_id, valid_at);
