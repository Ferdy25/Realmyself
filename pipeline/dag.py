"""Real Open-Meteo → PostgreSQL → Matplotlib weather pipeline for Jakarta."""
from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable
from zoneinfo import ZoneInfo

import httpx
import matplotlib
matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://portfolio:portfolio_local_only@localhost:5432/portfolio",
)
ARTIFACTS = Path(os.getenv("ARTIFACTS_DIR", Path(__file__).resolve().parents[1] / "artifacts"))
SOURCE_URL = "https://api.open-meteo.com/v1/forecast"
LOCATION = {"name": "Jakarta, Indonesia", "latitude": -6.2088, "longitude": 106.8456}
JAKARTA = ZoneInfo("Asia/Jakarta")


@dataclass
class PipelineData:
    raw: dict[str, Any]
    current: dict[str, Any]
    hourly: list[dict[str, Any]]


def extract() -> dict[str, Any]:
    params = {
        **{key: LOCATION[key] for key in ("latitude", "longitude")},
        "timezone": "Asia/Jakarta",
        "forecast_days": 2,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code",
    }
    response = httpx.get(SOURCE_URL, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def transform(raw: dict[str, Any]) -> PipelineData:
    current = raw.get("current")
    hourly = raw.get("hourly")
    if not current or not hourly or not hourly.get("time"):
        raise ValueError("Open-Meteo response is missing current or hourly weather fields")

    captured_at = datetime.fromisoformat(current["time"]).replace(tzinfo=JAKARTA)
    normalized_current = {
        "captured_at": captured_at,
        "temperature_c": current.get("temperature_2m"),
        "humidity_pct": current.get("relative_humidity_2m"),
        "precipitation_mm": current.get("precipitation"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "weather_code": current.get("weather_code"),
    }

    rows = []
    for index, valid_time in enumerate(hourly["time"]):
        rows.append({
            "valid_at": datetime.fromisoformat(valid_time).replace(tzinfo=JAKARTA),
            "temperature_c": _at(hourly, "temperature_2m", index),
            "humidity_pct": _at(hourly, "relative_humidity_2m", index),
            "precipitation_probability_pct": _at(hourly, "precipitation_probability", index),
            "wind_speed_kmh": _at(hourly, "wind_speed_10m", index),
            "weather_code": _at(hourly, "weather_code", index),
        })
    if len(rows) < 24:
        raise ValueError(f"Expected at least 24 hourly forecast records; received {len(rows)}")
    return PipelineData(raw=raw, current=normalized_current, hourly=rows)


def _at(hourly: dict[str, list[Any]], key: str, index: int) -> Any:
    values = hourly.get(key, [])
    return values[index] if index < len(values) else None


def load(run_id: int, data: PipelineData) -> int:
    with psycopg.connect(DATABASE_URL) as connection:
        connection.execute(
            """UPDATE pipeline_runs SET captured_at = %s,
                 temperature_c = %s, humidity_pct = %s, precipitation_mm = %s,
                 wind_speed_kmh = %s, weather_code = %s, raw_payload = %s
               WHERE id = %s""",
            (
                data.current["captured_at"], data.current["temperature_c"],
                data.current["humidity_pct"], data.current["precipitation_mm"],
                data.current["wind_speed_kmh"], data.current["weather_code"],
                json.dumps(data.raw), run_id,
            ),
        )
        connection.cursor().executemany(
            """INSERT INTO weather_forecasts
               (run_id, valid_at, temperature_c, humidity_pct,
                precipitation_probability_pct, wind_speed_kmh, weather_code)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            [
                (run_id, row["valid_at"], row["temperature_c"], row["humidity_pct"],
                 row["precipitation_probability_pct"], row["wind_speed_kmh"], row["weather_code"])
                for row in data.hourly
            ],
        )
    return len(data.hourly)


def visualize(run_id: int, data: PipelineData) -> str:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    times = [row["valid_at"] for row in data.hourly]
    temperatures = [row["temperature_c"] for row in data.hourly]
    rain = [row["precipitation_probability_pct"] for row in data.hourly]

    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})
    figure, (temperature_axis, rain_axis) = plt.subplots(
        2, 1, figsize=(10, 5.4), sharex=True, gridspec_kw={"height_ratios": [2, 1]},
    )
    figure.patch.set_facecolor("#f1eee6")
    for axis in (temperature_axis, rain_axis):
        axis.set_facecolor("#f1eee6")
        axis.spines[["top", "right", "left"]].set_visible(False)
        axis.spines["bottom"].set_color("#c9c5b9")
        axis.tick_params(colors="#68685f", length=0, pad=8)
        axis.grid(axis="y", color="#dedbd1", linewidth=.7)

    temperature_axis.plot(times, temperatures, color="#253a35", linewidth=2.5, marker="o", markersize=3)
    temperature_axis.fill_between(times, temperatures, min(temperatures) - 2, color="#b89b5a", alpha=.16)
    temperature_axis.set_ylabel("Temperature · °C", color="#526458")
    rain_axis.bar(times, rain, width=.025, color="#b89b5a", alpha=.78)
    rain_axis.set_ylabel("Rain chance · %", color="#526458")
    rain_axis.xaxis.set_major_formatter(mdates.DateFormatter("%a %H:%M", tz=JAKARTA))
    rain_axis.xaxis.set_major_locator(mdates.HourLocator(interval=4, tz=JAKARTA))
    figure.suptitle("Jakarta · 48-hour weather outlook", x=.08, y=.98, ha="left", color="#202923", fontsize=15, fontweight="bold")
    figure.text(.08, .925, "Source: Open-Meteo forecast API · model data, refreshed by this pipeline", color="#73736a", fontsize=8)
    figure.tight_layout(rect=(0, 0, 1, .91))
    chart_path = ARTIFACTS / "jakarta-weather.png"
    figure.savefig(chart_path, dpi=150, facecolor=figure.get_facecolor())
    plt.close(figure)

    with psycopg.connect(DATABASE_URL) as connection:
        connection.execute(
            "UPDATE pipeline_runs SET chart_path = %s WHERE id = %s",
            (chart_path.name, run_id),
        )
    return chart_path.name


def _record_stage(run_id: int, name: str, action: Callable[[], Any]) -> Any:
    started = time.perf_counter()
    with psycopg.connect(DATABASE_URL) as connection:
        stage_id = connection.execute(
            "INSERT INTO pipeline_task_runs (run_id, task_name, status) VALUES (%s, %s, 'running') RETURNING id",
            (run_id, name),
        ).fetchone()[0]
    try:
        result = action()
        if isinstance(result, int):
            count = result
        elif isinstance(result, dict):
            count = len(result.get("hourly", {}).get("time", [])) or 1
        elif hasattr(result, "hourly"):
            count = len(result.hourly)
        elif isinstance(result, str):
            count = 1
        else:
            count = 0
        with psycopg.connect(DATABASE_URL) as connection:
            connection.execute(
                "UPDATE pipeline_task_runs SET status='success', records_processed=%s, duration_seconds=%s, finished_at=NOW() WHERE id=%s",
                (count, round(time.perf_counter() - started, 3), stage_id),
            )
        return result
    except Exception as error:
        with psycopg.connect(DATABASE_URL) as connection:
            connection.execute(
                "UPDATE pipeline_task_runs SET status='failed', duration_seconds=%s, error_message=%s, finished_at=NOW() WHERE id=%s",
                (round(time.perf_counter() - started, 3), str(error)[:1000], stage_id),
            )
        raise


def run_pipeline() -> dict[str, Any]:
    started = time.perf_counter()
    with psycopg.connect(DATABASE_URL) as connection:
        run_id = connection.execute(
            "INSERT INTO pipeline_runs (status) VALUES ('running') RETURNING id"
        ).fetchone()[0]

    try:
        raw = _record_stage(run_id, "extract_open_meteo", extract)
        data = _record_stage(run_id, "transform_validate", lambda: transform(raw))
        row_count = _record_stage(run_id, "load_postgres", lambda: load(run_id, data))
        chart_path = _record_stage(run_id, "visualize_matplotlib", lambda: visualize(run_id, data))
        duration = round(time.perf_counter() - started, 3)
        with psycopg.connect(DATABASE_URL) as connection:
            connection.execute(
                "UPDATE pipeline_runs SET status='success', records_processed=%s, duration_seconds=%s, finished_at=NOW() WHERE id=%s",
                (row_count, duration, run_id),
            )
        return {"run_id": run_id, "status": "success", "records_processed": row_count, "duration_seconds": duration, "chart": chart_path}
    except Exception as error:
        duration = round(time.perf_counter() - started, 3)
        with psycopg.connect(DATABASE_URL) as connection:
            connection.execute(
                "UPDATE pipeline_runs SET status='failed', error_message=%s, duration_seconds=%s, finished_at=NOW() WHERE id=%s",
                (str(error)[:1000], duration, run_id),
            )
        raise
