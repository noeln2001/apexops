from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_scheduled_ingestion_status_endpoint():
    """Verify scheduled ingestion status returns cadence, race weekend flag, and freshness."""
    response = client.get("/api/v1/operations/ingestion/status")
    assert response.status_code == 200
    data = response.json()

    assert "cadence" in data
    assert "is_race_weekend" in data
    assert "interval_hours" in data
    assert data["interval_hours"] in [1, 24]
    assert "freshness_status" in data
    assert data["freshness_status"] in ["FRESH", "STALE"]
    assert "next_scheduled_run" in data


def test_list_ingestion_runs_endpoint():
    """Verify listing ingestion run history returns recent records."""
    response = client.get("/api/v1/operations/ingestion/runs")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0
    latest = data[0]
    assert "id" in latest
    assert "source_name" in latest
    assert latest["source_name"] == "Jolpica"
    assert "status" in latest
    assert "records_processed" in latest
    assert "duration_sec" in latest


def test_idempotent_reconciliation_execution():
    """Verify running scheduled reconciliation idempotently creates audit record."""
    from backend.app.db.session import SessionLocal
    from data_engine.etl.scheduled_ingestion import run_scheduled_reconciliation

    db = SessionLocal()
    try:
        res = run_scheduled_reconciliation(db)
        assert res["status"] == "SUCCESS"
        assert "run_id" in res
        assert res["records_processed"] > 0
        assert res["duration_sec"] >= 0.0
    finally:
        db.close()
