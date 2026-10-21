from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.f1_core import Constructor, Driver
from backend.app.models.f1_events import ConstructorStanding, DriverStanding, Race, SessionResult

router = APIRouter()

@router.get("/seasons")
def list_seasons(db: Session = Depends(get_db)):
    """List all available seasons in ApexOps (2010 to 2026)."""
    # Return all modern eras from 2026 down to 2010
    seasons = [
        {"year": 2026, "rounds_count": 24, "status": "IN_PROGRESS"},
        {"year": 2025, "rounds_count": 24, "status": "COMPLETED"},
        {"year": 2024, "rounds_count": 24, "status": "COMPLETED"},
        {"year": 2023, "rounds_count": 22, "status": "COMPLETED"},
        {"year": 2022, "rounds_count": 22, "status": "COMPLETED"},
        {"year": 2021, "rounds_count": 22, "status": "COMPLETED"},
        {"year": 2020, "rounds_count": 17, "status": "COMPLETED"},
        {"year": 2019, "rounds_count": 21, "status": "COMPLETED"},
        {"year": 2018, "rounds_count": 21, "status": "COMPLETED"},
        {"year": 2017, "rounds_count": 20, "status": "COMPLETED"},
        {"year": 2016, "rounds_count": 21, "status": "COMPLETED"},
        {"year": 2015, "rounds_count": 19, "status": "COMPLETED"},
        {"year": 2014, "rounds_count": 19, "status": "COMPLETED"},
        {"year": 2013, "rounds_count": 19, "status": "COMPLETED"},
        {"year": 2012, "rounds_count": 20, "status": "COMPLETED"},
        {"year": 2011, "rounds_count": 19, "status": "COMPLETED"},
        {"year": 2010, "rounds_count": 19, "status": "COMPLETED"},
    ]
    return seasons

@router.get("/seasons/{year}/standings/drivers")
def get_driver_standings(
    year: int,
    round_num: Optional[int] = Query(None, description="Specific round filter"),
    db: Session = Depends(get_db)
):
    """Returns complete driver championship standings with gaps, wins, and team colors."""
    query = db.query(DriverStanding).filter(DriverStanding.season_year == year)
    if round_num is not None:
        query = query.filter(DriverStanding.round == round_num)

    standings = query.order_by(DriverStanding.position).all()
    if not standings:
        standings = db.query(DriverStanding).filter(DriverStanding.season_year == year).order_by(DriverStanding.position).all()

    if not standings and 2010 <= year <= 2026:
        # Load from verified historical archives
        from data_engine.historical.historical_service import HistoricalStatsService
        hist_data = HistoricalStatsService.get_season_standings(year)
        if hist_data:
            leader_pts = float(hist_data[0].get("points", 0.0))
            hist_results = []
            for idx, h in enumerate(hist_data):
                pts = float(h.get("points", 0.0))
                prev_pts = float(hist_data[idx - 1].get("points", 0.0)) if idx > 0 else pts
                hist_results.append({
                    "position": h["position"],
                    "driver_id": h["driver_id"],
                    "code": h.get("code", h["driver_id"][:3].upper()),
                    "name": h["name"],
                    "nationality": h.get("nationality", "Unknown"),
                    "team_id": h.get("team", "").lower().replace(" ", "_"),
                    "team_name": h.get("team", "Unknown"),
                    "team_color": "#E10600" if "Ferrari" in h.get("team", "") else "#00D2BE" if "Mercedes" in h.get("team", "") else "#3671C6" if "Red Bull" in h.get("team", "") else "#FF8000" if "McLaren" in h.get("team", "") else "#94a3b8",
                    "points": pts,
                    "wins": h.get("wins", 0),
                    "podiums": 0,
                    "gap_to_leader": round(leader_pts - pts, 1),
                    "gap_to_prev": round(prev_pts - pts, 1)
                })
            return hist_results

    leader_points = standings[0].points if standings else 0.0
    results = []

    for idx, ds in enumerate(standings):
        d = db.query(Driver).filter(Driver.driver_id == ds.driver_id).first()
        c = db.query(Constructor).filter(Constructor.constructor_id == ds.constructor_id).first() if ds.constructor_id else None

        # Calculate podiums from session_results
        podiums = db.query(SessionResult).join(Race).filter(
            Race.season_year == year,
            SessionResult.driver_id == ds.driver_id,
            SessionResult.position <= 3
        ).count()

        gap_to_leader = round(leader_points - ds.points, 1)
        prev_pts = standings[idx - 1].points if idx > 0 else ds.points
        gap_to_prev = round(prev_pts - ds.points, 1)

        results.append({
            "position": ds.position,
            "driver_id": ds.driver_id,
            "code": d.code if d else None,
            "name": f"{d.first_name} {d.last_name}" if d else ds.driver_id,
            "nationality": d.nationality if d else None,
            "team_id": c.constructor_id if c else None,
            "team_name": c.name if c else "Privateer",
            "team_color": c.color_hex if c else "#E10600",
            "points": ds.points,
            "wins": ds.wins,
            "podiums": podiums,
            "gap_to_leader": gap_to_leader,
            "gap_to_prev": gap_to_prev
        })

    return results

@router.get("/seasons/{year}/standings/constructors")
def get_constructor_standings(
    year: int,
    db: Session = Depends(get_db)
):
    """Returns complete constructor championship standings."""
    standings = db.query(ConstructorStanding).filter(
        ConstructorStanding.season_year == year
    ).order_by(ConstructorStanding.position).all()

    leader_points = standings[0].points if standings else 0.0
    results = []

    for idx, cs in enumerate(standings):
        c = db.query(Constructor).filter(Constructor.constructor_id == cs.constructor_id).first()
        gap_to_leader = round(leader_points - cs.points, 1)
        prev_pts = standings[idx - 1].points if idx > 0 else cs.points
        gap_to_prev = round(prev_pts - cs.points, 1)

        results.append({
            "position": cs.position,
            "constructor_id": cs.constructor_id,
            "name": c.name if c else cs.constructor_id,
            "nationality": c.nationality if c else None,
            "team_color": c.color_hex if c else "#E10600",
            "points": cs.points,
            "wins": cs.wins,
            "gap_to_leader": gap_to_leader,
            "gap_to_prev": gap_to_prev
        })

    return results
