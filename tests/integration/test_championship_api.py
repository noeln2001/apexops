import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_championship_tracker_endpoint():
    response = client.get("/api/v1/championship/tracker?driver_id=max_verstappen")
    assert response.status_code == 200
    data = response.json()
    assert data["season"] == 2026
    assert data["selected_driver"]["driver_id"] == "max_verstappen"
    assert data["selected_driver"]["status"] == "CONTENDER"
    assert "remaining_calendar" in data
    assert len(data["remaining_calendar"]) == 6
    assert len(data["standings"]) >= 10

def test_championship_scenarios_endpoint():
    response = client.get("/api/v1/championship/scenarios?driver_id=max_verstappen")
    assert response.status_code == 200
    data = response.json()
    assert data["target_driver"]["driver_id"] == "max_verstappen"
    assert data["starting_deficit"] > 0
    assert len(data["scenarios"]) >= 6

def test_interactive_simulator_endpoint():
    payload = {
        "preset": "max_wins_austin",
        "target_driver_id": "max_verstappen"
    }
    response = client.post("/api/v1/championship/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SIMULATED"
    assert len(data["projected_standings"]) >= 10

def test_monte_carlo_endpoint():
    payload = {
        "iterations": 200,
        "random_seed": 42
    }
    response = client.post("/api/v1/championship/monte-carlo", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["iterations"] == 200
    assert len(data["drivers"]) >= 10
    # Top driver probability must be positive
    assert data["drivers"][0]["championship_prob_pct"] > 0

def test_driver_comparison_endpoint():
    response = client.get("/api/v1/championship/comparison?driver_a=max_verstappen&driver_b=antonelli")
    assert response.status_code == 200
    data = response.json()
    assert data["driver_a"]["id"] == "max_verstappen"
    assert data["driver_b"]["id"] == "antonelli"
    assert data["points_difference"] == 119.0
    assert data["remaining_rounds"] == 6

def test_championship_history_endpoint():
    response = client.get("/api/v1/championship/history/2024")
    assert response.status_code == 200
    data = response.json()
    assert data["season"] == 2024
    assert data["status"] == "COMPLETED"
    assert data["champion"]["name"] == "Max Verstappen"
    assert len(data["standings"]) >= 10
