from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.session import get_db
from backend.app.models.f1_core import Constructor, DriverTeamAssignment, Driver
from backend.app.models.f1_events import SessionResult, Race, ConstructorStanding

router = APIRouter()

@router.get("/constructors")
def list_constructors(db: Session = Depends(get_db)):
    """List all Formula 1 constructors with team colors and statistics."""
    teams = db.query(Constructor).order_by(Constructor.name).all()
    results = []

    for t in teams:
        # Get active drivers
        assignments = db.query(DriverTeamAssignment, Driver).join(Driver).filter(
            DriverTeamAssignment.constructor_id == t.constructor_id
        ).order_by(DriverTeamAssignment.season_year.desc()).limit(2).all()
        
        drivers_lineup = [f"{d.first_name} {d.last_name}" for _, d in assignments]

        # Total wins
        wins = db.query(SessionResult).filter(
            SessionResult.constructor_id == t.constructor_id,
            SessionResult.position == 1
        ).count()

        results.append({
            "constructor_id": t.constructor_id,
            "name": t.name,
            "nationality": t.nationality,
            "color_hex": t.color_hex,
            "power_unit": t.power_unit or "Proprietary",
            "current_drivers": drivers_lineup,
            "total_wins": max(wins, t.total_wins),
            "url": t.url
        })

    return results

@router.get("/constructors/{constructor_id}")
def get_constructor_profile(constructor_id: str, db: Session = Depends(get_db)):
    """Returns detailed constructor profile, season history and driver lineup."""
    team = db.query(Constructor).filter(Constructor.constructor_id == constructor_id).first()
    if not team:
        raise HTTPException(status_code=404, detail=f"Constructor '{constructor_id}' not found")

    # Race results
    results = db.query(SessionResult, Race).join(Race).filter(
        SessionResult.constructor_id == constructor_id
    ).all()

    total_starts = len(results)
    wins = sum(1 for r, _ in results if r.position == 1)
    podiums = sum(1 for r, _ in results if r.position and r.position <= 3)
    points = sum(r.points for r, _ in results)

    # Historical standings
    standings = db.query(ConstructorStanding).filter(
        ConstructorStanding.constructor_id == constructor_id
    ).order_by(ConstructorStanding.season_year.desc()).all()

    season_history = [
        {
            "season": s.season_year,
            "position": s.position,
            "points": s.points,
            "wins": s.wins
        } for s in standings
    ]

    return {
        "constructor_id": team.constructor_id,
        "name": team.name,
        "nationality": team.nationality,
        "color_hex": team.color_hex,
        "power_unit": team.power_unit,
        "statistics": {
            "entries": total_starts,
            "wins": wins,
            "podiums": podiums,
            "points": points
        },
        "season_history": season_history,
        "source_attribution": "Jolpica F1 Archive & Official FIA Technical Declarations"
    }
