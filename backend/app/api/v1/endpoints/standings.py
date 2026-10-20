from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.session import get_db
from backend.app.models.f1_core import Season, Driver, Constructor
from backend.app.models.f1_events import DriverStanding, ConstructorStanding, Race, SessionResult

router = APIRouter()

@router.get("/seasons")
def list_seasons(db: Session = Depends(get_db)):
    """List all available seasons in ApexOps."""
    seasons = db.query(Season).order_by(Season.year.desc()).all()
    return [{"year": s.year, "rounds_count": s.rounds_count} for s in seasons]

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
        # Fallback query if round-specific not present
        standings = db.query(DriverStanding).filter(DriverStanding.season_year == year).order_by(DriverStanding.position).all()

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
