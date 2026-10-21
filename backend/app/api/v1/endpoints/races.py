from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.f1_core import Constructor, Driver
from backend.app.models.f1_events import Race, SessionResult

router = APIRouter()

def convert_to_ist(utc_date_str: str, utc_time_str: Optional[str]) -> str:
    """Converts UTC race session timestamp into India Standard Time (IST, UTC+5:30)."""
    if not utc_time_str:
        utc_time_str = "14:00:00Z"
    clean_time = utc_time_str.rstrip("Z")
    try:
        dt_str = f"{utc_date_str} {clean_time}"
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        ist_dt = dt + timedelta(hours=5, minutes=30)
        return ist_dt.strftime("%A, %d %B %Y at %H:%M IST")
    except Exception:
        return f"{utc_date_str} (IST conversion unavailable)"

@router.get("/races")
def list_races(
    season: int = Query(2026, description="Championship season year"),
    status: Optional[str] = Query(None, description="Filter by status (Completed, Scheduled, Confirmed)"),
    db: Session = Depends(get_db)
):
    """List championship calendar with circuit locations, statuses, and IST times."""
    query = db.query(Race).filter(Race.season_year == season)
    if status:
        query = query.filter(Race.status == status)

    races = query.order_by(Race.round).all()
    results = []

    for r in races:
        circuit = r.circuit_rel
        results.append({
            "race_id": r.race_id,
            "season": r.season_year,
            "round": r.round,
            "name": r.name,
            "circuit_id": r.circuit_id,
            "circuit_name": circuit.name if circuit else "Grand Prix Circuit",
            "country": circuit.country if circuit else "International",
            "date": r.date,
            "time_utc": r.time_utc,
            "status": r.status,
            "ist_schedule": convert_to_ist(r.date, r.time_utc)
        })

    return results

@router.get("/races/live/current")
def get_current_live_session(db: Session = Depends(get_db)):
    """
    Race Weekend Live Centre status:
    Returns countdown to next session, live status, and OpenF1 session positions when active.
    """
    from backend.app.services.live_session_service import LiveSessionService
    return LiveSessionService.get_current_live_state(db)

@router.get("/races/{race_id}")
def get_race_details(race_id: str, db: Session = Depends(get_db)):
    """Returns race weekend details, timetable, circuit timezone and IST conversion."""
    race = db.query(Race).filter(Race.race_id == race_id).first()
    if not race:
        raise HTTPException(status_code=404, detail=f"Race '{race_id}' not found")

    circuit = race.circuit_rel

    # Generate standard weekend session schedule
    schedule = [
        {"session": "Practice 1", "day": "Friday", "utc": "15:30 UTC", "ist": "Friday 21:00 IST"},
        {"session": "Practice 2", "day": "Friday", "utc": "19:00 UTC", "ist": "Saturday 00:30 IST"},
        {"session": "Practice 3 / Sprint", "day": "Saturday", "utc": "16:00 UTC", "ist": "Saturday 21:30 IST"},
        {"session": "Qualifying", "day": "Saturday", "utc": "19:00 UTC", "ist": "Sunday 00:30 IST"},
        {"session": "Grand Prix (Race)", "day": "Sunday", "utc": race.time_utc or "19:00 UTC", "ist": convert_to_ist(race.date, race.time_utc)}
    ]

    return {
        "race_id": race.race_id,
        "season": race.season_year,
        "round": race.round,
        "name": race.name,
        "date": race.date,
        "status": race.status,
        "circuit": {
            "circuit_id": circuit.circuit_id if circuit else "unknown",
            "name": circuit.name if circuit else race.name,
            "country": circuit.country if circuit else "International",
            "timezone": circuit.timezone if circuit else "UTC"
        },
        "weekend_schedule": schedule,
        "ist_race_time": convert_to_ist(race.date, race.time_utc)
    }

@router.get("/races/{race_id}/results")
def get_race_results(race_id: str, db: Session = Depends(get_db)):
    """Returns verified race classification results."""
    race = db.query(Race).filter(Race.race_id == race_id).first()
    if not race:
        raise HTTPException(status_code=404, detail=f"Race '{race_id}' not found")

    results = db.query(SessionResult).filter(
        SessionResult.race_id == race_id
    ).order_by(SessionResult.position).all()

    classifications = []
    for r in results:
        d = db.query(Driver).filter(Driver.driver_id == r.driver_id).first()
        c = db.query(Constructor).filter(Constructor.constructor_id == r.constructor_id).first()

        classifications.append({
            "position": r.position,
            "position_text": r.position_text,
            "driver_id": r.driver_id,
            "driver_name": f"{d.first_name} {d.last_name}" if d else r.driver_id,
            "driver_code": d.code if d else None,
            "constructor_id": r.constructor_id,
            "constructor_name": c.name if c else r.constructor_id,
            "constructor_color": c.color_hex if c else "#E10600",
            "grid": r.grid,
            "laps": r.laps,
            "status": r.status,
            "time_str": r.time_str or r.status,
            "points": r.points,
            "fastest_lap_rank": r.fastest_lap_rank,
            "fastest_lap_time": r.fastest_lap_time
        })

    return {
        "race_id": race.race_id,
        "race_name": race.name,
        "status": race.status,
        "classifications": classifications
    }
