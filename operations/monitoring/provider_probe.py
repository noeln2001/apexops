import time
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
import requests
from sqlalchemy.orm import Session
from backend.app.models.operations import DataSource

logger = logging.getLogger("apexops.monitoring.probe")

class ProviderHealthProbe:
    """Performs real-time latency pings and health checks on upstream F1 data sources with a 3s timeout."""

    @classmethod
    def ping_source(cls, source: DataSource) -> Tuple[str, float]:
        """Pings an individual data source with a strict 3.0s timeout."""
        start = time.time()
        url = source.endpoint_url

        if source.type == "PYTHON_LIB" or not url.startswith("http"):
            try:
                import importlib.util
                lib_name = url.split(".")[0]
                has_spec = importlib.util.find_spec(lib_name) is not None
                latency = round((time.time() - start) * 1000, 1)
                return ("HEALTHY" if has_spec else "DEGRADED", latency)
            except Exception as e:
                logger.warning(f"Library probe failed for {source.name}: {e}")
                return ("UNAVAILABLE", round((time.time() - start) * 1000, 1))

        try:
            resp = requests.get(url, timeout=3.0, headers={"User-Agent": "ApexOps-HealthProbe/1.0"})
            latency = round((time.time() - start) * 1000, 1)
            if resp.status_code < 500:
                return ("HEALTHY", latency)
            return ("DEGRADED", latency)
        except requests.Timeout:
            latency = round((time.time() - start) * 1000, 1)
            return ("UNAVAILABLE", latency)
        except Exception as e:
            logger.debug(f"HTTP probe connection issue for {source.name}: {e}")
            latency = round((time.time() - start) * 1000, 1)
            return ("UNAVAILABLE", latency)

    @classmethod
    def probe_all_sources(cls, db: Session) -> List[Dict[str, Any]]:
        """Probes all registered upstream providers and persists measured status and latency."""
        sources = db.query(DataSource).all()
        results = []
        for s in sources:
            status, latency = cls.ping_source(s)
            s.health_status = status
            s.last_ping_ms = latency
            s.last_checked = datetime.now(timezone.utc)
            results.append({
                "name": s.name,
                "status": status,
                "latency_ms": latency,
                "endpoint": s.endpoint_url
            })
        db.commit()
        return results
