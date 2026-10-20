import pytest
from analytics.telemetry.telemetry_service import TelemetryService
from analytics.strategy.strategy_service import StrategyService

def test_telemetry_distance_alignment():
    lap_a = TelemetryService.generate_synthetic_telemetry("Circuit of the Americas", "norris", 92.0)
    lap_b = TelemetryService.generate_synthetic_telemetry("Circuit of the Americas", "verstappen", 92.4)
    
    assert len(lap_a) > 50
    assert len(lap_b) > 50
    
    aligned = TelemetryService.align_telemetry_laps(lap_a, lap_b, num_points=100)
    assert "distance" in aligned
    assert len(aligned["distance"]) == 100
    assert len(aligned["lap_a"]["speed"]) == 100
    assert len(aligned["lap_b"]["speed"]) == 100
    assert len(aligned["speed_delta"]) == 100
    assert len(aligned["time_delta"]) == 100

def test_tyre_pace_progression():
    pace = StrategyService.calculate_stint_pace("SOFT", laps=15, base_lap_sec=90.0)
    assert len(pace) == 15
    assert pace[0]["lap"] == 1
    # Tyre degradation delta should increase with stint age
    assert pace[-1]["deg_delta"] > pace[0]["deg_delta"]

def test_undercut_window():
    # If trailing by only 0.8s and new tyre advantage is 1.85s -> undercut should be viable
    res = StrategyService.evaluate_undercut_window(current_gap_sec=0.8, lead_car_compound="MEDIUM", chase_car_compound="HARD")
    assert res["undercut_viable"] is True
    assert "BOX NOW" in res["recommended_action"]
