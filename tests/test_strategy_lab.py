from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_strategy_fitted_degradation_and_sensitivity():
    """Verify strategy analysis endpoint returns fitted degradation with uncertainty bands and SC sensitivity."""
    response = client.get("/api/v1/strategy")
    assert response.status_code == 200
    data = response.json()

    assert "compound_degradation" in data
    assert "soft" in data["compound_degradation"]
    assert "medium" in data["compound_degradation"]
    assert "hard" in data["compound_degradation"]

    # Verify fitted degradation uncertainty bands
    first_medium_lap = data["compound_degradation"]["medium"][0]
    assert "lap_time_sec" in first_medium_lap
    assert "lap_time_lower" in first_medium_lap
    assert "lap_time_upper" in first_medium_lap
    assert "uncertainty_band_sec" in first_medium_lap
    assert first_medium_lap["lap_time_lower"] < first_medium_lap["lap_time_sec"] < first_medium_lap["lap_time_upper"]

    # Verify safety car sensitivity
    assert "safety_car_sensitivity" in data
    assert len(data["safety_car_sensitivity"]) > 0
    first_sc = data["safety_car_sensitivity"][0]
    assert "lap" in first_sc
    assert "time_saved_sec" in first_sc
    assert "status" in first_sc


def test_post_custom_multi_stint_strategy_plan():
    """Verify custom multi-stint race strategy planner with SC sensitivity."""
    payload = {
        "total_laps": 57,
        "base_lap_sec": 90.0,
        "pit_loss_sec": 21.5,
        "safety_car_lap": 24,
        "stints": [
            {"compound": "MEDIUM", "start_lap": 1, "end_lap": 24},
            {"compound": "HARD", "start_lap": 25, "end_lap": 57},
        ],
    }
    response = client.post("/api/v1/strategy/plan", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_laps"] == 57
    assert data["stints_count"] == 2
    assert "total_race_time_sec" in data
    assert "uncertainty_window_sec" in data
    assert data["uncertainty_window_sec"] > 0
    assert len(data["pit_stops"]) == 1

    # Verify SC pit savings applied since SC was at lap 24 (the pit lap)
    pit_stop = data["pit_stops"][0]
    assert pit_stop["under_safety_car"] is True
    assert pit_stop["sc_savings_sec"] == 10.0
    assert data["total_sc_savings_sec"] == 10.0
