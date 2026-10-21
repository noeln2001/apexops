from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.f1_core import Constructor, Driver, DriverTeamAssignment
from backend.app.models.f1_events import Race, SessionResult

router = APIRouter()

@router.get("/drivers")
def list_drivers(
    season: Optional[int] = Query(None, description="Filter by active season"),
    search: Optional[str] = Query(None, description="Search by name, code or nationality"),
    db: Session = Depends(get_db)
):
    """List drivers with current team affiliations and search."""
    query = db.query(Driver)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(Driver.first_name).like(s)) |
            (func.lower(Driver.last_name).like(s)) |
            (func.lower(Driver.code).like(s)) |
            (func.lower(Driver.nationality).like(s))
        )

    drivers = query.order_by(Driver.last_name).all()
    results = []

    for d in drivers:
        # Find active or latest team
        assignment = db.query(DriverTeamAssignment).filter(
            DriverTeamAssignment.driver_id == d.driver_id
        ).order_by(DriverTeamAssignment.season_year.desc()).first()

        team_name = "Independent"
        team_color = "#E10600"
        if assignment:
            team = db.query(Constructor).filter(Constructor.constructor_id == assignment.constructor_id).first()
            if team:
                team_name = team.name
                team_color = team.color_hex

        # Count race starts and podiums
        starts = db.query(SessionResult).filter(SessionResult.driver_id == d.driver_id).count()
        wins = db.query(SessionResult).filter(SessionResult.driver_id == d.driver_id, SessionResult.position == 1).count()
        podiums = db.query(SessionResult).filter(SessionResult.driver_id == d.driver_id, SessionResult.position <= 3).count()

        results.append({
            "driver_id": d.driver_id,
            "code": d.code,
            "number": d.permanent_number,
            "name": f"{d.first_name} {d.last_name}",
            "nationality": d.nationality,
            "dob": d.dob,
            "team_name": team_name,
            "team_color": team_color,
            "total_starts": starts,
            "total_wins": max(wins, d.total_wins),
            "total_podiums": max(podiums, d.total_podiums),
            "url": d.url
        })

    return results

@router.get("/drivers/{driver_id}")
def get_driver_profile(driver_id: str, db: Session = Depends(get_db)):
    """Returns comprehensive driver career profile, statistics and performance breakdown."""
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver '{driver_id}' not found")

    # Race results history
    results = db.query(SessionResult, Race).join(Race).filter(
        SessionResult.driver_id == driver_id
    ).order_by(Race.date.desc()).all()

    total_starts = len(results)
    wins = sum(1 for r, _ in results if r.position == 1)
    podiums = sum(1 for r, _ in results if r.position and r.position <= 3)
    dnfs = sum(1 for r, _ in results if r.status and r.status != "Finished" and not r.status.startswith("+"))
    total_pts = sum(r.points for r, _ in results)

    valid_positions = [r.position for r, _ in results if r.position is not None]
    avg_finish = round(sum(valid_positions) / len(valid_positions), 1) if valid_positions else None
    retirement_rate_pct = round((dnfs / total_starts) * 100.0, 1) if total_starts > 0 else 0.0

    # Recent 10 races
    recent_races = []
    for r, race in results[:10]:
        recent_races.append({
            "race_name": race.name,
            "season": race.season_year,
            "round": race.round,
            "grid": r.grid,
            "position": r.position_text,
            "points": r.points,
            "status": r.status
        })

    # Historical teams
    teams = db.query(DriverTeamAssignment, Constructor).join(Constructor).filter(
        DriverTeamAssignment.driver_id == driver_id
    ).order_by(DriverTeamAssignment.season_year.desc()).all()

    career_teams = [
        {
            "season": a.season_year,
            "team_id": c.constructor_id,
            "team_name": c.name,
            "color_hex": c.color_hex
        } for a, c in teams
    ]

    return {
        "driver_id": driver.driver_id,
        "code": driver.code,
        "number": driver.permanent_number,
        "name": f"{driver.first_name} {driver.last_name}",
        "nationality": driver.nationality,
        "dob": driver.dob,
        "statistics": {
            "race_starts": total_starts,
            "wins": wins,
            "podiums": podiums,
            "career_points": total_pts,
            "average_finish": avg_finish,
            "dnf_count": dnfs,
            "retirement_rate_pct": retirement_rate_pct
        },
        "career_teams": career_teams,
        "recent_races": recent_races,
        "source_attribution": "Jolpica F1 Database & FIA Official Timing Feeds"
    }
