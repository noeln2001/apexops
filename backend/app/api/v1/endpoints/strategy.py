from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from analytics.strategy.strategy_service import StrategyService

router = APIRouter()


class StintPlan(BaseModel):
    compound: str
    start_lap: int
    end_lap: int


class StrategyPlanRequest(BaseModel):
    total_laps: int = 57
    base_lap_sec: float = 90.5
    pit_loss_sec: float = 21.5
    safety_car_lap: Optional[int] = None
    virtual_safety_car_lap: Optional[int] = None
    stints: List[StintPlan]


@router.get("/strategy")
def get_strategy_analysis(
    race_id: str = Query("2026-17", description="Race identifier"),
    circuit: str = Query("Marina Bay Street Circuit", description="Circuit name"),
    gap_sec: float = Query(2.1, description="Current gap between chasing car and lead car"),
    lead_compound: str = Query("MEDIUM", description="Lead car tyre compound"),
    chase_compound: str = Query("HARD", description="Chasing car tyre compound"),
):
    """
    Returns fitted tyre degradation curves across compounds with uncertainty bands,
    multi-stint strategy models, safety-car sensitivity analysis, and pit-stop undercut/overcut viability.
    """
    # 1. Fitted degradation curves with 95% uncertainty intervals
    soft_pace = StrategyService.calculate_stint_pace("SOFT", laps=24, base_lap_sec=92.5)
    medium_pace = StrategyService.calculate_stint_pace("MEDIUM", laps=34, base_lap_sec=92.9)
    hard_pace = StrategyService.calculate_stint_pace("HARD", laps=45, base_lap_sec=93.4)

    # 2. Undercut calculation
    undercut_analysis = StrategyService.evaluate_undercut_window(
        current_gap_sec=gap_sec,
        lead_car_compound=lead_compound,
        chase_car_compound=chase_compound,
        pit_loss_sec=22.8,
    )

    # 3. Default 1-stop strategy
    default_stints = [
        {"compound": "MEDIUM", "start_lap": 1, "end_lap": 28},
        {"compound": "HARD", "start_lap": 29, "end_lap": 62},
    ]
    stint_plan_a = StrategyService.plan_multi_stint_strategy(default_stints, total_laps=62, base_lap_sec=92.5)

    two_stop_stints = [
        {"compound": "SOFT", "start_lap": 1, "end_lap": 16},
        {"compound": "MEDIUM", "start_lap": 17, "end_lap": 38},
        {"compound": "SOFT", "start_lap": 39, "end_lap": 62},
    ]
    stint_plan_b = StrategyService.plan_multi_stint_strategy(two_stop_stints, total_laps=62, base_lap_sec=92.5)

    # 4. Safety Car sensitivity across race laps
    sc_sensitivity = StrategyService.calculate_safety_car_sensitivity(default_stints, total_laps=62, base_lap_sec=92.5)

    recommended_strategies = [
        {
            "name": "Strategy A: One-Stop (Standard)",
            "stints": [
                {"compound": "MEDIUM", "laps": "L1 - L28", "color": "#FFF500"},
                {"compound": "HARD", "laps": "L29 - L62", "color": "#FFFFFF"},
            ],
            "total_estimated_time": stint_plan_a["formatted_time"],
            "total_race_time_sec": stint_plan_a["total_race_time_sec"],
            "uncertainty_window_sec": stint_plan_a["uncertainty_window_sec"],
            "safety_car_risk": "Low",
            "pit_stops": stint_plan_a["pit_stops"],
        },
        {
            "name": "Strategy B: Two-Stop (Aggressive)",
            "stints": [
                {"compound": "SOFT", "laps": "L1 - L16", "color": "#E80020"},
                {"compound": "MEDIUM", "laps": "L17 - L38", "color": "#FFF500"},
                {"compound": "SOFT", "laps": "L39 - L62", "color": "#E80020"},
            ],
            "total_estimated_time": stint_plan_b["formatted_time"],
            "total_race_time_sec": stint_plan_b["total_race_time_sec"],
            "uncertainty_window_sec": stint_plan_b["uncertainty_window_sec"],
            "safety_car_risk": "High",
            "pit_stops": stint_plan_b["pit_stops"],
        },
    ]

    return {
        "race_id": race_id,
        "circuit": circuit,
        "compound_degradation": {
            "soft": soft_pace,
            "medium": medium_pace,
            "hard": hard_pace,
        },
        "safety_car_sensitivity": sc_sensitivity,
        "undercut_model": undercut_analysis,
        "recommended_strategies": recommended_strategies,
        "source_attribution": "ApexOps Race Strategy & Fitted Pirelli Tyre Degradation Engine",
    }


@router.post("/strategy/plan")
def plan_custom_strategy(plan: StrategyPlanRequest) -> Dict[str, Any]:
    """
    Custom multi-stint race planner with tyre wear simulation, safety-car sensitivity,
    and uncertainty confidence bands.
    """
    stints_dicts = [s.model_dump() for s in plan.stints]
    result = StrategyService.plan_multi_stint_strategy(
        stints=stints_dicts,
        total_laps=plan.total_laps,
        base_lap_sec=plan.base_lap_sec,
        pit_loss_sec=plan.pit_loss_sec,
        safety_car_lap=plan.safety_car_lap,
        virtual_safety_car_lap=plan.virtual_safety_car_lap,
    )
    sensitivity = StrategyService.calculate_safety_car_sensitivity(
        stints=stints_dicts,
        total_laps=plan.total_laps,
        base_lap_sec=plan.base_lap_sec,
    )
    result["safety_car_sensitivity"] = sensitivity
    return result
