import time
import math
from collections import deque
from typing import Dict, Any, List, Optional
from threading import Lock

class APITelemetryCollector:
    """
    High-performance, in-memory telemetry collector tracking real API latency percentiles,
    throughput, error rates, and recent application error traces.
    Uses a thread-safe sliding window reservoir (no fabricated data).
    """
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(APITelemetryCollector, cls).__new__(cls)
                cls._instance._init_collector()
            return cls._instance

    def _init_collector(self, max_reservoir_size: int = 2000, max_errors: int = 100):
        self.max_size = max_reservoir_size
        self.max_errors = max_errors
        self.latencies: deque = deque(maxlen=max_reservoir_size)
        self.recent_errors: deque = deque(maxlen=max_errors)
        self.total_requests = 0
        self.status_counts = {
            "2xx": 0,
            "3xx": 0,
            "4xx": 0,
            "5xx": 0
        }
        self.start_time = time.time()
        self.endpoint_stats: Dict[str, Dict[str, Any]] = {}

    def record_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        correlation_id: str,
        error_detail: Optional[str] = None
    ):
        with self._lock:
            self.total_requests += 1
            self.latencies.append(duration_ms)

            # Categorize status code
            if 200 <= status_code < 300:
                self.status_counts["2xx"] += 1
            elif 300 <= status_code < 400:
                self.status_counts["3xx"] += 1
            elif 400 <= status_code < 500:
                self.status_counts["4xx"] += 1
            elif status_code >= 500:
                self.status_counts["5xx"] += 1

            # Track endpoint summary
            route_key = f"{method} {path}"
            if route_key not in self.endpoint_stats:
                self.endpoint_stats[route_key] = {
                    "count": 0,
                    "errors": 0,
                    "total_ms": 0.0,
                    "max_ms": 0.0,
                    "min_ms": 999999.0
                }
            stat = self.endpoint_stats[route_key]
            stat["count"] += 1
            stat["total_ms"] += duration_ms
            if duration_ms > stat["max_ms"]:
                stat["max_ms"] = duration_ms
            if duration_ms < stat["min_ms"]:
                stat["min_ms"] = duration_ms

            if status_code >= 400:
                stat["errors"] += 1
                self.recent_errors.append({
                    "timestamp": time.time(),
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": round(duration_ms, 2),
                    "correlation_id": correlation_id,
                    "error_detail": error_detail or f"HTTP {status_code}"
                })

    def get_percentiles(self) -> Dict[str, Any]:
        with self._lock:
            count = len(self.latencies)
            if count == 0:
                return {
                    "count": 0,
                    "p50_ms": 0.0,
                    "p90_ms": 0.0,
                    "p95_ms": 0.0,
                    "p99_ms": 0.0,
                    "min_ms": 0.0,
                    "max_ms": 0.0,
                    "mean_ms": 0.0
                }

            sorted_latencies = sorted(self.latencies)
            def _percentile(p: float) -> float:
                k = (len(sorted_latencies) - 1) * p
                f = math.floor(k)
                c = math.ceil(k)
                if f == c:
                    return sorted_latencies[int(k)]
                d0 = sorted_latencies[int(f)] * (c - k)
                d1 = sorted_latencies[int(c)] * (k - f)
                return round(d0 + d1, 2)

            return {
                "sample_size": count,
                "p50_ms": _percentile(0.50),
                "p90_ms": _percentile(0.90),
                "p95_ms": _percentile(0.95),
                "p99_ms": _percentile(0.99),
                "min_ms": round(sorted_latencies[0], 2),
                "max_ms": round(sorted_latencies[-1], 2),
                "mean_ms": round(sum(sorted_latencies) / count, 2)
            }

    def get_summary(self) -> Dict[str, Any]:
        with self._lock:
            uptime = max(0.1, time.time() - self.start_time)
            req_per_sec = round(self.total_requests / uptime, 2)
            total_errors = self.status_counts["4xx"] + self.status_counts["5xx"]
            error_rate_pct = round((total_errors / self.total_requests * 100), 2) if self.total_requests > 0 else 0.0

            # Top slowest routes
            routes_summary = []
            for route, s in self.endpoint_stats.items():
                routes_summary.append({
                    "route": route,
                    "count": s["count"],
                    "avg_ms": round(s["total_ms"] / s["count"], 2),
                    "max_ms": round(s["max_ms"], 2),
                    "errors": s["errors"]
                })
            routes_summary.sort(key=lambda x: x["avg_ms"], reverse=True)

            return {
                "total_requests": self.total_requests,
                "requests_per_second": req_per_sec,
                "error_rate_percent": error_rate_pct,
                "status_breakdown": dict(self.status_counts),
                "percentiles": self.get_percentiles(),
                "recent_errors": list(self.recent_errors),
                "top_endpoints": routes_summary[:10]
            }

telemetry_collector = APITelemetryCollector()
