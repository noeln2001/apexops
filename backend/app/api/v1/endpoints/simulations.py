from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from analytics.simulation.championship_simulator import ChampionshipSimulator
from backend.app.db.session import get_db
from backend.app.models.f1_core import Constructor, Driver
from backend.app.models.f1_events import DriverStanding, Race

router = APIRouter()

class ScenarioRound(BaseModel):
    round: int
    finishing_order: List[str] # driver IDs

class SimulationRequest(BaseModel):
    season: int = 2026
    mode: str = "monte_carlo" # "monte_carlo" or "deterministic"
    iterations: int = 1000
    scenarios: Optional[List[ScenarioRound]] = None

@router.get("/simulations/championship")
def get_default_championship_simulation(
    season: int = Query(2026),
    db: Session = Depends(get_db)
):
    """Returns baseline Monte Carlo championship probabilities using current championship points."""
    standings = db.query(DriverStanding).filter(
        DriverStanding.season_year == season
    ).order_by(DriverStanding.position).all()

    # Calculate actual remaining races
    completed_count = db.query(Race).filter(Race.season_year == season, Race.status == "Completed").count()
    total_count = db.query(Race).filter(Race.season_year == season).count()
    remaining_races = max(1, total_count - completed_count)

    standings_payload = []
    for s in standings:
        d = db.query(Driver).filter(Driver.driver_id == s.driver_id).first()
        c = db.query(Constructor).filter(Constructor.constructor_id == s.constructor_id).first() if s.constructor_id else None
        standings_payload.append({
            "driver_id": s.driver_id,
            "name": f"{d.first_name} {d.last_name}" if d else s.driver_id,
            "team": c.name if c else "Unknown",
            "points": s.points,
            "wins": s.wins
        })

    simulation = ChampionshipSimulator.run_monte_carlo(
        current_standings=standings_payload,
        remaining_races=remaining_races,
        remaining_sprints=2,
        iterations=1000
    )

    return {
        "season": season,
        "mode": "monte_carlo",
        "completed_races": completed_count,
        "remaining_races": remaining_races,
        "results": simulation
    }

@router.post("/simulations/championship")
def post_custom_championship_simulation(
    req: SimulationRequest,
    db: Session = Depends(get_db)
):
    """Executes either a user-defined scenario simulation or custom Monte Carlo."""
    standings = db.query(DriverStanding).filter(
        DriverStanding.season_year == req.season
    ).order_by(DriverStanding.position).all()

    standings_payload = []
    for s in standings:
        d = db.query(Driver).filter(Driver.driver_id == s.driver_id).first()
        c = db.query(Constructor).filter(Constructor.constructor_id == s.constructor_id).first() if s.constructor_id else None
        standings_payload.append({
            "driver_id": s.driver_id,
            "name": f"{d.first_name} {d.last_name}" if d else s.driver_id,
            "team": c.name if c else "Unknown",
            "points": s.points,
            "wins": s.wins
        })

    if req.mode == "deterministic" and req.scenarios:
        scenarios_dicts = [{"round": sc.round, "finishing_order": sc.finishing_order} for sc in req.scenarios]
        results = ChampionshipSimulator.run_deterministic_scenario(standings_payload, scenarios_dicts)
        return {
            "season": req.season,
            "mode": "deterministic",
            "scenario_results": results
        }
    else:
        results = ChampionshipSimulator.run_monte_carlo(
            current_standings=standings_payload,
            remaining_races=6,
            iterations=req.iterations
        )
        return {
            "season": req.season,
            "mode": "monte_carlo",
            "results": results
        }


class SnapshotRequest(BaseModel):
    season: int = 2026
    round: int = 17
    iterations: int = 1000


@router.get("/simulations/predictions/evolution")
def get_prediction_evolution(
    season: int = Query(2026),
    db: Session = Depends(get_db)
):
    """Returns round-by-round Monte Carlo title-probability evolution for all championship contenders."""
    from analytics.championship.prediction_tracker import PredictionTracker
    return PredictionTracker.get_evolution(season=season, db=db)


@router.get("/simulations/predictions/calibration")
def get_prediction_calibration(
    seasons: Optional[str] = Query(None, description="Comma-separated list of completed seasons (e.g. 2021,2022,2023,2024,2025)"),
    db: Session = Depends(get_db)
):
    """Calculates calibration curves, Brier score, and expected calibration error against actual outcomes for completed seasons."""
    from analytics.championship.prediction_tracker import PredictionTracker
    season_list = [int(s.strip()) for s in seasons.split(",")] if seasons else None
    return PredictionTracker.get_calibration(db=db, seasons=season_list)


@router.post("/simulations/predictions/snapshot")
def record_prediction_snapshot(
    req: SnapshotRequest,
    db: Session = Depends(get_db)
):
    """Records a title probability snapshot for a given round from current simulation."""
    from analytics.championship.eligibility_engine import ChampionshipEligibilityEngine
    from analytics.championship.monte_carlo_engine import MonteCarloTitleEngine
    from analytics.championship.prediction_tracker import PredictionTracker
    from backend.app.api.v1.endpoints.championship import _load_live_standings

    raw = _load_live_standings(db, season=req.season)
    processed = ChampionshipEligibilityEngine.calculate_eligibility(raw)
    mc_result = MonteCarloTitleEngine.run_simulation(processed, iterations=req.iterations)
    saved = PredictionTracker.record_round_snapshot(
        season=req.season,
        round_num=req.round,
        standings=processed,
        simulation_results=mc_result.get("drivers", []),
        db=db,
        iterations=req.iterations,
    )
    return {
        "status": "RECORDED",
        "season": req.season,
        "round": req.round,
        "snapshots_saved": len(saved),
        "snapshots": saved,
    }

