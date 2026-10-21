from fastapi.testclient import TestClient

from backend.app.main import app


def test_live_session_current_endpoint():
    client = TestClient(app)
    resp = client.get("/api/v1/races/live/current")
    assert resp.status_code == 200
    data = resp.json()
    assert "has_live_session" in data
    assert "status" in data
    assert data["status"] in ["LIVE", "NO_LIVE_SESSION"]
    assert "next_session" in data
    if data["next_session"]:
        assert "countdown_seconds" in data["next_session"]
        assert "scheduled_utc" in data["next_session"]
    assert "live_positions" in data
    assert isinstance(data["live_positions"], list)

def test_live_session_with_mocked_openf1(monkeypatch):
    import httpx

    class MockResponse:
        status_code = 200
        def json(self):
            return [
                {"driver_number": 1, "position": 1, "interval": "+0.000"},
                {"driver_number": 4, "position": 2, "interval": "+1.420"}
            ]

    def mock_get(self, url, **kwargs):
        return MockResponse()

    monkeypatch.setattr(httpx.Client, "get", mock_get)

    from datetime import datetime, timezone

    from backend.app.db.session import SessionLocal
    from backend.app.models.f1_events import Race
    from backend.app.services.live_session_service import LiveSessionService

    db = SessionLocal()
    try:
        # Temporarily create/update a race happening right now
        now = datetime.now(timezone.utc)
        test_race = Race(
            race_id="test_live_race",
            season_year=now.year,
            round=99,
            name="Live Test GP",
            circuit_id="monaco",
            date=now.strftime("%Y-%m-%d"),
            time_utc=now.strftime("%H:%M:%SZ"),
            status="Scheduled"
        )
        db.add(test_race)
        db.commit()

        state = LiveSessionService.get_current_live_state(db)
        assert state["has_live_session"] is True
        assert state["status"] == "LIVE"
        assert len(state["live_positions"]) >= 2
        assert state["live_positions"][0]["position"] == 1
    finally:
        db.query(Race).filter(Race.race_id == "test_live_race").delete()
        db.commit()
        db.close()
