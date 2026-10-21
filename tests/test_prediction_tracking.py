from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_prediction_evolution_endpoint():
    """Verify round-by-round Monte Carlo title probability evolution."""
    response = client.get("/api/v1/simulations/predictions/evolution?season=2026")
    assert response.status_code == 200
    data = response.json()
    assert data["season"] == 2026
    assert "rounds" in data
    assert len(data["rounds"]) >= 17
    assert "drivers" in data
    assert len(data["drivers"]) > 0

    # Verify probability array length matches rounds
    for d in data["drivers"]:
        assert len(d["probabilities"]) == len(data["rounds"])
        assert "driver_id" in d
        assert "name" in d
        assert "color" in d
        assert 0.0 <= d["current_probability"] <= 100.0


def test_prediction_calibration_endpoint():
    """Verify model calibration metrics and reliability curve against actual outcomes."""
    response = client.get("/api/v1/simulations/predictions/calibration")
    assert response.status_code == 200
    data = response.json()

    assert "brier_score" in data
    assert 0.0 <= data["brier_score"] <= 1.0
    assert "expected_calibration_error" in data
    assert "calibration_curve" in data
    assert len(data["calibration_curve"]) == 5
    assert "reliability_verdict" in data
    assert data["total_predictions"] > 0

    for bin_item in data["calibration_curve"]:
        assert "bin_label" in bin_item
        assert "predicted_avg_pct" in bin_item
        assert "actual_frequency_pct" in bin_item
        assert "sample_size" in bin_item


def test_record_prediction_snapshot():
    """Verify recording a new round prediction snapshot."""
    payload = {
        "season": 2026,
        "round": 17,
        "iterations": 100,
    }
    response = client.post("/api/v1/simulations/predictions/snapshot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "RECORDED"
    assert data["season"] == 2026
    assert data["round"] == 17
    assert data["snapshots_saved"] > 0
