import time
import statistics
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app

def run_performance_benchmark(iterations: int = 50):
    client = TestClient(app)
    endpoints = [
        "/health",
        "/api/v1/overview?season=2026",
        "/api/v1/seasons/2026/standings/drivers",
        "/api/v1/races?season=2026",
        "/api/v1/circuits",
        "/api/v1/telemetry?race_id=2026-17&driver_a=norris&driver_b=verstappen",
        "/api/v1/strategy",
        "/api/v1/operations/status"
    ]

    benchmark_results = {}
    print(f"\n================ APEXOPS PERFORMANCE BENCHMARK SUITE ================")
    print(f"Executing {iterations} sequential requests per endpoint...\n")

    for ep in endpoints:
        latencies = []
        errors = 0
        t_start_total = time.time()
        
        for _ in range(iterations):
            t0 = time.time()
            resp = client.get(ep)
            dt_ms = (time.time() - t0) * 1000.0
            latencies.append(dt_ms)
            if resp.status_code != 200:
                errors += 1

        total_time_sec = time.time() - t_start_total
        rps = round(iterations / total_time_sec, 1)
        med_lat = round(statistics.median(latencies), 2)
        p95_lat = round(float(np.percentile(latencies, 95)), 2)
        p99_lat = round(float(np.percentile(latencies, 99)), 2)
        err_rate = round((errors / iterations) * 100.0, 1)

        benchmark_results[ep] = {
            "rps": rps,
            "median_ms": med_lat,
            "p95_ms": p95_lat,
            "p99_ms": p99_lat,
            "error_rate_pct": err_rate
        }

        print(f"Endpoint: {ep:<45} | RPS: {rps:>5.1f} | Median: {med_lat:>6.2f}ms | p95: {p95_lat:>6.2f}ms | p99: {p99_lat:>6.2f}ms | Err: {err_rate}%")

    print("\nBenchmark completed successfully.")
    return benchmark_results

if __name__ == "__main__":
    run_performance_benchmark(iterations=30)
