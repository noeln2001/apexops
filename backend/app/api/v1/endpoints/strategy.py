from fastapi import APIRouter, Query
from typing import Optional
from analytics.strategy.strategy_service import StrategyService

router = APIRouter()

@router.get("/strategy")
def get_strategy_analysis(
    race_id: str = Query("2026-17", description="Race identifier"),
    circuit: str = Query("Marina Bay Street Circuit", description="Circuit name"),
    gap_sec: float = Query(2.1, description="Current gap between chasing car and lead car"),
    lead_compound: str = Query("MEDIUM", description="Lead car tyre compound"),
    chase_compound: str = Query("HARD", description="Chasing car tyre compound")
):
    """
    Returns tyre degradation curves across compounds, stint pace evolution,
    and pit-stop undercut/overcut viability models.
    """
    # Degradation progression for SOFT, MEDIUM, HARD
    soft_pace = StrategyService.calculate_stint_pace("SOFT", laps=22, base_lap_sec=92.5)
    medium_pace = StrategyService.calculate_stint_pace("MEDIUM", laps=32, base_lap_sec=92.9)
    hard_pace = StrategyService.calculate_stint_pace("HARD", laps=45, base_lap_sec=93.4)

    # Undercut calculation
    undercut_analysis = StrategyService.evaluate_undercut_window(
        current_gap_sec=gap_sec,
        lead_car_compound=lead_compound,
        chase_car_compound=chase_compound,
        pit_loss_sec=22.8
    )

    # Optimal stint strategies
    sample_strategies = [
        {
            "name": "Strategy A: One-Stop (Standard)",
            "stints": [
                {"compound": "MEDIUM", "laps": "L1 - L28", "color": "#FFF500"},
                {"compound": "HARD", "laps": "L29 - L62", "color": "#FFFFFF"}
            ],
            "total_estimated_time": "1h 38m 12s",
            "safety_car_risk": "Low"
        },
        {
            "name": "Strategy B: Two-Stop (Aggressive)",
            "stints": [
                {"compound": "SOFT", "laps": "L1 - L16", "color": "#E80020"},
                {"compound": "MEDIUM", "laps": "L17 - L38", "color": "#FFF500"},
                {"compound": "SOFT", "laps": "L39 - L62", "color": "#E80020"}
            ],
            "total_estimated_time": "1h 38m 04s",
            "safety_car_risk": "High"
        }
    ]

    return {
        "race_id": race_id,
        "circuit": circuit,
        "compound_degradation": {
            "soft": soft_pace,
            "medium": medium_pace,
            "hard": hard_pace
        },
        "undercut_model": undercut_analysis,
        "recommended_strategies": sample_strategies,
        "source_attribution": "ApexOps Race Strategy & Pirelli Tyre Degradation Engine"
    }
