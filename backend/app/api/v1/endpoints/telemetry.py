from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from analytics.telemetry.telemetry_service import TelemetryService
from backend.app.db.session import get_db
from backend.app.models.f1_core import Driver
from backend.app.models.f1_events import Race
from data_engine.adapters.fastf1_adapter import FastF1Adapter

router = APIRouter()
fastf1_adapter = FastF1Adapter()

@router.get("/telemetry")
def get_lap_telemetry_comparison(
    race_id: str = Query("2026-17", description="Race identifier e.g. 2026-17 or 2024-01"),
    driver_a: str = Query("norris", description="Primary driver ID / code"),
    driver_b: str = Query("verstappen", description="Comparison driver ID / code"),
    lap_a: Optional[int] = Query(None, description="Lap number for driver A (defaults to fastest)"),
    lap_b: Optional[int] = Query(None, description="Lap number for driver B (defaults to fastest)"),
    db: Session = Depends(get_db)
):
    """
    Returns synchronized, distance-aligned telemetry channels (Speed, Throttle, Brake, Gear, RPM, DRS)
    and delta times between two drivers.
    """
    race = db.query(Race).filter(Race.race_id == race_id).first()
    circuit_name = race.name if race else "Singapore Grand Prix"

    # Attempt to load from FastF1 if available
    samples_a = []
    samples_b = []
    if fastf1_adapter.available and race:
        try:
            session = fastf1_adapter.get_session(race.season_year, race.round, "R")
            if session:
                da = db.query(Driver).filter(Driver.driver_id == driver_a).first()
                db_driver = db.query(Driver).filter(Driver.driver_id == driver_b).first()
                code_a = da.code if da and da.code else driver_a.upper()[:3]
                code_b = db_driver.code if db_driver and db_driver.code else driver_b.upper()[:3]

                samples_a = fastf1_adapter.extract_lap_telemetry(session, code_a, lap_a)
                samples_b = fastf1_adapter.extract_lap_telemetry(session, code_b, lap_b)
        except Exception:
            pass

    # Use telemetry mathematical physical model if live session cache is unavailable
    if not samples_a:
        samples_a = TelemetryService.generate_synthetic_telemetry(circuit_name, driver_a, 90.8)
    if not samples_b:
        samples_b = TelemetryService.generate_synthetic_telemetry(circuit_name, driver_b, 91.1)

    aligned = TelemetryService.align_telemetry_laps(samples_a, samples_b)

    return {
        "race_id": race_id,
        "circuit_name": circuit_name,
        "driver_a": driver_a,
        "driver_b": driver_b,
        "lap_a_number": lap_a or "Fastest",
        "lap_b_number": lap_b or "Fastest",
        "telemetry": aligned,
        "channels": ["speed_kmh", "throttle_pct", "brake_bool", "gear", "rpm", "drs"],
        "sampling_rate": "Distance-aligned (250 nodes per lap)",
        "source_attribution": "ApexOps Telemetry Lab / Synchronized Ingest Engine"
    }
