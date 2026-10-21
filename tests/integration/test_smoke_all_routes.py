import threading
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_parameterless_get_routes():
    schema = app.openapi()
    routes = []
    for path, methods in schema.get("paths", {}).items():
        if "get" in methods:
            # Check for path parameters
            if "{" in path:
                continue
            # Check for required query/header parameters (excluding auth headers if any)
            required_params = [
                param for param in methods["get"].get("parameters", [])
                if param.get("required") and param.get("in") != "header"
            ]
            if not required_params:
                routes.append(path)
    return sorted(routes)

PARAMETERLESS_ROUTES = get_parameterless_get_routes()

@pytest.mark.parametrize("route", PARAMETERLESS_ROUTES)
def test_smoke_parameterless_get_route(route: str):
    """
    Smoke test: calls every parameterless GET route discovered from app.openapi()
    with a per-request 5s timeout and asserts HTTP 200 without hang.
    """
    result_holder = {}
    exception_holder = []

    def _call():
        try:
            res = client.get(route)
            result_holder["response"] = res
        except Exception as e:
            exception_holder.append(e)

    worker = threading.Thread(target=_call, daemon=True)
    worker.start()
    worker.join(timeout=5.0)

    assert not worker.is_alive(), f"Route {route} timed out after 5.0 seconds!"
    if exception_holder:
        raise exception_holder[0]

    assert "response" in result_holder, f"No response obtained for route {route}"
    response = result_holder["response"]
    assert response.status_code == 200, f"Route {route} returned non-200 status {response.status_code}: {response.text}"
