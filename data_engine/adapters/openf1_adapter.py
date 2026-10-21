import logging
from typing import Any, Dict, List, Optional

from backend.app.core.config import settings
from data_engine.adapters.base_adapter import BaseProviderAdapter

logger = logging.getLogger("apexops.adapter.openf1")

class OpenF1Adapter(BaseProviderAdapter):
    """Adapter for OpenF1 API providing session meetings, live intervals, laps and car data."""

    def __init__(self):
        super().__init__(name="OpenF1", base_url=settings.OPENF1_BASE_URL, timeout_sec=10)

    def fetch_meetings(self, year: int) -> List[Dict[str, Any]]:
        """Fetch Grand Prix meetings for a specified season."""
        res = self.get_json("meetings", params={"year": year})
        return res if isinstance(res, list) else []

    def fetch_sessions(self, meeting_key: Any) -> List[Dict[str, Any]]:
        """Fetch weekend practice, qualifying and race sessions for a meeting."""
        res = self.get_json("sessions", params={"meeting_key": meeting_key})
        return res if isinstance(res, list) else []

    def fetch_laps(self, session_key: Any, driver_number: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch sector times and lap metrics."""
        params = {"session_key": session_key}
        if driver_number:
            params["driver_number"] = driver_number
        res = self.get_json("laps", params=params)
        return res if isinstance(res, list) else []

    def fetch_weather(self, session_key: Any) -> List[Dict[str, Any]]:
        """Fetch track and ambient weather conditions."""
        res = self.get_json("weather", params={"session_key": session_key})
        return res if isinstance(res, list) else []

    def fetch_intervals(self, session_key: Any) -> List[Dict[str, Any]]:
        """Fetch live gap to leader and intervals between cars."""
        res = self.get_json("intervals", params={"session_key": session_key})
        return res if isinstance(res, list) else []
