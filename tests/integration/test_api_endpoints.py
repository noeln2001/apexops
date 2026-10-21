from fastapi.testclient import TestClient

from backend.app.core.config import settings
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "UP"
    assert data["reference_date"] == settings.REFERENCE_DATE

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

def get_admin_headers():
    login_res = client.post("/api/v1/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_unauthenticated_post_backups():
    res = client.post("/api/v1/operations/backups")
    assert res.status_code == 401

def test_operations_drills_and_trigger():
    res = client.get("/api/v1/operations/drills")
    assert res.status_code == 200
    drills = res.json()
    assert len(drills) == 8

    headers = get_admin_headers()
    # Trigger drill
    t_res = client.post("/api/v1/operations/drills/DRILL-01/trigger", headers=headers)
    assert t_res.status_code == 200
    assert t_res.json()["status"] == "ACTIVE"

    # Remediate drill
    r_res = client.post("/api/v1/operations/drills/DRILL-01/remediate", headers=headers)
    assert r_res.status_code == 200
    assert r_res.json()["status"] == "RESOLVED"

def test_isolated_restore_guarantee():
    headers = get_admin_headers()
    # Make a backup
    b_res = client.post("/api/v1/operations/backups", headers=headers)
    assert b_res.status_code == 200
    fname = b_res.json()["filename"]

    # Test isolated restore
    res = client.post(f"/api/v1/operations/backups/{fname}/test-restore", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "isolation_guarantee" in data

def test_operations_telemetry_and_status_no_deadlock():
    import threading
    results = {}

    def fetch(url, key):
        res = client.get(url)
        results[key] = res

    # Call /api/v1/operations/status with 5s timeout
    t1 = threading.Thread(target=fetch, args=("/api/v1/operations/status", "status"))
    t1.start()
    t1.join(timeout=5.0)
    assert not t1.is_alive(), "/api/v1/operations/status deadlocked or timed out"
    assert "status" in results and results["status"].status_code == 200

    # Call /api/v1/operations/telemetry with 5s timeout
    t2 = threading.Thread(target=fetch, args=("/api/v1/operations/telemetry", "telemetry"))
    t2.start()
    t2.join(timeout=5.0)
    assert not t2.is_alive(), "/api/v1/operations/telemetry deadlocked or timed out"
    assert "telemetry" in results and results["telemetry"].status_code == 200
    telemetry_data = results["telemetry"].json()
    assert "percentiles" in telemetry_data
    assert "sample_size" in telemetry_data["percentiles"]

def test_real_traffic_recorded_in_telemetry_and_logs():
    # Make a distinct test request
    driver_res = client.get("/api/v1/drivers")
    assert driver_res.status_code == 200

    # Verify traffic appears in telemetry
    telem_res = client.get("/api/v1/operations/telemetry")
    assert telem_res.status_code == 200
    telem = telem_res.json()
    assert telem["total_requests"] >= 1
    # Check top_endpoints or status_breakdown
    assert telem["status_breakdown"]["2xx"] >= 1

    # Verify traffic appears in operational logs
    logs_res = client.get("/api/v1/operations/logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    # Confirm log entries contain structured info
    assert any("GET /api/v1/drivers" in entry["message"] for entry in logs)

def test_backup_path_traversal_protection():
    from operations.backups.backup_manager import BackupManager

    # Direct unit test on BackupManager
    res = BackupManager.test_isolated_restore("../data/apexops.db")
    assert res["status"] == "FAILED"
    assert "Invalid" in res["error"] or "pattern" in res["error"] or "traversal" in res["error"]

    # Also test other traversal and malicious payloads
    for bad_name in [
        "../../etc/passwd",
        "apexops_backup_20261020_141916.db/../malicious.db",
        "random_file.db",
        "apexops_backup_123.db",
        "apexops_backup_20261020_141916.db.sh"
    ]:
        res_bad = BackupManager.test_isolated_restore(bad_name)
        assert res_bad["status"] == "FAILED"

    # API endpoint test rejects path traversal attempt
    headers = get_admin_headers()
    api_res = client.post("/api/v1/operations/backups/..%2Fdata%2Fapexops.db/test-restore", headers=headers)
    assert api_res.status_code in [400, 404, 405]

    bad_api_res = client.post("/api/v1/operations/backups/apexops_backup_invalid.db/test-restore", headers=headers)
    assert bad_api_res.status_code == 400




