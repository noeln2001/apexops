import time
import logging
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger("apexops.adapter")

class BaseProviderAdapter:
    """Base class for all ApexOps data providers with retries, timeout, and metrics."""
    
    def __init__(self, name: str, base_url: str, timeout_sec: int = 10, max_retries: int = 3):
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.timeout_sec = timeout_sec
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "ApexOps-Motorsport-Platform/1.0",
            "Accept": "application/json"
        })

    def get_json(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        backoff = 1.0
        for attempt in range(1, self.max_retries + 1):
            try:
                start_time = time.time()
                resp = self.session.get(url, params=params, timeout=self.timeout_sec)
                duration_ms = (time.time() - start_time) * 1000
                
                if resp.status_code == 200:
                    logger.debug(f"[{self.name}] GET {url} SUCCESS ({duration_ms:.1f}ms)")
                    return resp.json()
                elif resp.status_code in [429, 502, 503, 504]:
                    logger.warning(f"[{self.name}] Transient HTTP {resp.status_code} on attempt {attempt}. Retrying in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
                else:
                    logger.error(f"[{self.name}] HTTP {resp.status_code} for {url}: {resp.text[:200]}")
                    return None
            except requests.RequestException as exc:
                logger.warning(f"[{self.name}] Request error on attempt {attempt}: {exc}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
        logger.error(f"[{self.name}] Max retries reached for {url}.")
        return None
