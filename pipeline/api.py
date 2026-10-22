from __future__ import annotations

import asyncio
import os
import threading
from decimal import Decimal
from contextlib import asynccontextmanager, suppress
from pathlib import Path

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from psycopg.rows import dict_row

from dag import ARTIFACTS, DATABASE_URL, run_pipeline

POLL_SECONDS = int(os.getenv("PIPELINE_INTERVAL_SECONDS", "900"))
pipeline_lock = threading.Lock()


def run_once() -> dict:
    if not pipeline_lock.acquire(blocking=False):
        return {"status": "already_running"}
    try:
        return run_pipeline()
    finally:
        pipeline_lock.release()


def ensure_schema() -> None:
    """Create the current schema and safely archive the earlier demo-only table."""
    with psycopg.connect(DATABASE_URL) as connection:
        has_captured_at = connection.execute(
            """SELECT EXISTS (
                 SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='pipeline_runs' AND column_name='captured_at'
               )"""
        ).fetchone()[0]
        has_pipeline_runs = connection.execute(
            "SELECT to_regclass('public.pipeline_runs') IS NOT NULL"
        ).fetchone()[0]
        if has_pipeline_runs and not has_captured_at:
            archive_exists = connection.execute(
                "SELECT to_regclass('public.pipeline_runs_demo_archive') IS NOT NULL"
            ).fetchone()[0]
            if not archive_exists:
                connection.execute("ALTER TABLE pipeline_runs RENAME TO pipeline_runs_demo_archive")
            else:
                connection.execute("DROP TABLE pipeline_runs CASCADE")

        connection.execute(
            """CREATE TABLE IF NOT EXISTS pipeline_runs (
              id BIGSERIAL PRIMARY KEY,
              status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
              records_processed INTEGER NOT NULL DEFAULT 0,
              duration_seconds NUMERIC(10,3), started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), finished_at TIMESTAMPTZ,
              captured_at TIMESTAMPTZ, temperature_c NUMERIC(5,2), humidity_pct INTEGER,
              precipitation_mm NUMERIC(6,2), wind_speed_kmh NUMERIC(6,2), weather_code INTEGER,
              raw_payload JSONB, chart_path TEXT, error_message TEXT
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS pipeline_task_runs (
              id BIGSERIAL PRIMARY KEY, run_id BIGINT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
              task_name TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
              records_processed INTEGER NOT NULL DEFAULT 0, duration_seconds NUMERIC(10,3),
              started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), finished_at TIMESTAMPTZ, error_message TEXT
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS weather_forecasts (
              id BIGSERIAL PRIMARY KEY, run_id BIGINT NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
              valid_at TIMESTAMPTZ NOT NULL, temperature_c NUMERIC(5,2), humidity_pct INTEGER,
              precipitation_probability_pct INTEGER, wind_speed_kmh NUMERIC(6,2), weather_code INTEGER
            )"""
        )
        connection.execute("CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at ON pipeline_runs (started_at DESC)")
        connection.execute("CREATE INDEX IF NOT EXISTS idx_pipeline_task_runs_run_id ON pipeline_task_runs (run_id, id)")
        connection.execute("CREATE INDEX IF NOT EXISTS idx_weather_forecasts_run_time ON weather_forecasts (run_id, valid_at)")


async def scheduled_pipeline() -> None:
    while True:
        try:
            await asyncio.to_thread(run_once)
        except Exception as error:
            print(f"Scheduled pipeline failed: {error}", flush=True)
        await asyncio.sleep(POLL_SECONDS)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(ensure_schema)
    task = asyncio.create_task(scheduled_pipeline())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


app = FastAPI(title="Jakarta Weather Data Pipeline", lifespan=lifespan)


@app.get("/api/health")
def health() -> dict:
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            connection.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.get("/api/overview")
def overview() -> dict:
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as connection:
        latest = connection.execute(
            "SELECT * FROM pipeline_runs WHERE status='success' ORDER BY id DESC LIMIT 1"
        ).fetchone()
        recent_runs = connection.execute(
            """SELECT id, status, records_processed, duration_seconds, started_at, finished_at, error_message
               FROM pipeline_runs ORDER BY id DESC LIMIT 8"""
        ).fetchall()
        total_rows = connection.execute("SELECT COALESCE(SUM(records_processed), 0) AS n FROM pipeline_runs WHERE status='success'").fetchone()["n"]
        latest_attempt = connection.execute("SELECT status, started_at FROM pipeline_runs ORDER BY id DESC LIMIT 1").fetchone()

        forecast = []
        tasks = []
        if latest:
            forecast = connection.execute(
                """SELECT valid_at, temperature_c, humidity_pct,
                          precipitation_probability_pct, wind_speed_kmh
                   FROM weather_forecasts WHERE run_id=%s ORDER BY valid_at LIMIT 48""",
                (latest["id"],),
            ).fetchall()
            tasks = connection.execute(
                """SELECT task_name, status, records_processed, duration_seconds, started_at, finished_at, error_message
                   FROM pipeline_task_runs WHERE run_id=%s ORDER BY id""",
                (latest["id"],),
            ).fetchall()

    return {
        "location": "Jakarta, Indonesia",
        "source": "Open-Meteo Forecast API",
        "source_url": "https://open-meteo.com/en/docs",
        "updated_at": latest["captured_at"].isoformat() if latest and latest["captured_at"] else None,
        "current": {
            "temperature_c": latest["temperature_c"],
            "humidity_pct": latest["humidity_pct"],
            "precipitation_mm": latest["precipitation_mm"],
            "wind_speed_kmh": latest["wind_speed_kmh"],
            "weather_code": latest["weather_code"],
        } if latest else None,
        "latest_run": _serialize({key: value for key, value in latest.items() if key != "raw_payload"}) if latest else None,
        "latest_attempt": _serialize(latest_attempt),
        "total_records_loaded": int(total_rows),
        "forecast": [_serialize(row) for row in forecast],
        "tasks": [_serialize(row) for row in tasks],
        "runs": [_serialize(row) for row in recent_runs],
        "pipeline_interval_seconds": POLL_SECONDS,
    }


@app.post("/api/refresh")
def refresh() -> dict:
    try:
        return run_once()
    except Exception as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@app.get("/api/chart.png")
def chart() -> FileResponse:
    path = ARTIFACTS / "jakarta-weather.png"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Chart is generated after the first successful pipeline run")
    return FileResponse(path, media_type="image/png", filename="jakarta-weather.png")


def _serialize(value):
    if value is None:
        return None
    if isinstance(value, dict):
        return {key: _serialize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_serialize(item) for item in value]
    if isinstance(value, Decimal):
        return float(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value
