import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "UP"
    assert data["reference_date"] == "2026-10-20"

def test_overview_endpoint():
    res = client.get("/api/v1/overview?season=2026")
    assert res.status_code == 200
    data = res.json()
    assert data["season"] == 2026
    assert "upcoming_event" in data
    assert "driver_standings" in data
    assert len(data["driver_standings"]) > 0

def test_driver_standings_endpoint():
    res = client.get("/api/v1/seasons/2026/standings/drivers")
    assert res.status_code == 200
    standings = res.json()
    assert isinstance(standings, list)
    assert len(standings) >= 10
    assert standings[0]["position"] == 1
    assert "gap_to_leader" in standings[0]

def test_races_endpoint():
    res = client.get("/api/v1/races?season=2026")
    assert res.status_code == 200
    races = res.json()
    assert len(races) == 23
    # Check that Singapore GP is completed and Austin GP is confirmed
    singapore = next((r for r in races if "Singapore" in r["name"]), None)
    austin = next((r for r in races if "United States" in r["name"]), None)
    assert singapore is not None
    assert singapore["status"] == "Completed"
    assert austin is not None
    assert austin["status"] == "Confirmed"

def test_circuits_endpoint():
    res = client.get("/api/v1/circuits")
    assert res.status_code == 200
    circuits = res.json()
    assert len(circuits) > 0
    assert "americas" in [c["circuit_id"] for c in circuits]

def test_telemetry_endpoint():
    res = client.get("/api/v1/telemetry?race_id=2026-17&driver_a=norris&driver_b=verstappen")
    assert res.status_code == 200
    data = res.json()
    assert "telemetry" in data
    assert "speed_delta" in data["telemetry"]

def test_operations_drills_and_trigger():
    res = client.get("/api/v1/operations/drills")
    assert res.status_code == 200
    drills = res.json()
    assert len(drills) == 8

    # Trigger drill
    t_res = client.post("/api/v1/operations/drills/DRILL-01/trigger")
    assert t_res.status_code == 200
    assert t_res.json()["status"] == "ACTIVE"

    # Remediate drill
    r_res = client.post("/api/v1/operations/drills/DRILL-01/remediate")
    assert r_res.status_code == 200
    assert r_res.json()["status"] == "RESOLVED"

def test_isolated_restore_guarantee():
    # Make a backup
    b_res = client.post("/api/v1/operations/backups")
    assert b_res.status_code == 200
    fname = b_res.json()["filename"]

    # Test isolated restore
    res = client.post(f"/api/v1/operations/backups/{fname}/test-restore")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "isolation_guarantee" in data
