import pytest
import requests
from backend.app.models.operations import DataSource
from operations.monitoring.provider_probe import ProviderHealthProbe

def test_provider_health_probe_healthy(monkeypatch):
    source = DataSource(
        name="Jolpica",
        type="REST_API",
        endpoint_url="https://api.jolpica.com",
        health_status="UNKNOWN",
        last_ping_ms=0.0
    )

    class MockResp:
        status_code = 200

    def mock_get(url, timeout, headers):
        assert timeout == 3.0
        return MockResp()

    monkeypatch.setattr(requests, "get", mock_get)
    status, latency = ProviderHealthProbe.ping_source(source)
    assert status == "HEALTHY"
    assert latency >= 0.0

def test_provider_health_probe_timeout(monkeypatch):
    source = DataSource(
        name="Slow API",
        type="REST_API",
        endpoint_url="https://slow.f1.internal",
        health_status="UNKNOWN",
        last_ping_ms=0.0
    )

    def mock_get(url, timeout, headers):
        assert timeout == 3.0
        raise requests.Timeout("Connection timed out after 3.0s")

    monkeypatch.setattr(requests, "get", mock_get)
    status, latency = ProviderHealthProbe.ping_source(source)
    assert status == "UNAVAILABLE"
    assert latency >= 0.0

def test_provider_health_probe_python_lib():
    source = DataSource(
        name="FastF1",
        type="PYTHON_LIB",
        endpoint_url="fastf1.local_cache",
        health_status="UNKNOWN",
        last_ping_ms=0.0
    )
    status, latency = ProviderHealthProbe.ping_source(source)
    assert status in ["HEALTHY", "DEGRADED"]
    assert latency >= 0.0
