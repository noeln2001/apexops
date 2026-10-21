from fastapi.testclient import TestClient

from backend.app.main import app


def test_driver_head_to_head_shareable_url():
    client = TestClient(app)
    # Test with short codes ?a=ver&b=nor
    resp = client.get("/api/v1/championship/comparison?a=ver&b=nor")
    assert resp.status_code == 200
    data = resp.json()
    assert "driver_a" in data
    assert "driver_b" in data
    assert "max_verstappen" in data["driver_a"]["id"]
    assert "norris" in data["driver_b"]["id"]
    assert "season_points_progression" in data
    assert len(data["season_points_progression"]) > 0
    assert "qualifying_vs_race_delta" in data
    assert "driver_a" in data["qualifying_vs_race_delta"]
    assert "finishing_distribution" in data["driver_a"]

def test_constructor_head_to_head():
    client = TestClient(app)
    resp = client.get("/api/v1/championship/constructors/comparison?a=red_bull&b=mclaren")
    assert resp.status_code == 200
    data = resp.json()
    assert "constructor_a" in data
    assert "constructor_b" in data
    assert "season_points_progression" in data
    assert "points_difference" in data
