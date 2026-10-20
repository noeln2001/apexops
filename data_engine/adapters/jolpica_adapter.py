import logging
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from data_engine.adapters.base_adapter import BaseProviderAdapter

logger = logging.getLogger("apexops.adapter.jolpica")

class JolpicaAdapter(BaseProviderAdapter):
    """Adapter for Jolpica F1 API (Ergast successor) providing historical and current championship data."""
    
    def __init__(self):
        super().__init__(name="Jolpica", base_url=settings.JOLPICA_BASE_URL, timeout_sec=12)

    def fetch_calendar(self, year: int) -> List[Dict[str, Any]]:
        """Fetches the race calendar for a specific season."""
        data = self.get_json(f"{year}.json")
        if data and "MRData" in data and "RaceTable" in data["MRData"]:
            return data["MRData"]["RaceTable"].get("Races", [])
        return []

    def fetch_race_results(self, year: int, round_num: int) -> Optional[Dict[str, Any]]:
        """Fetches race classification results for a round."""
        data = self.get_json(f"{year}/{round_num}/results.json")
        if data and "MRData" in data and "RaceTable" in data["MRData"]:
            races = data["MRData"]["RaceTable"].get("Races", [])
            return races[0] if races else None
        return None

    def fetch_qualifying_results(self, year: int, round_num: int) -> Optional[Dict[str, Any]]:
        """Fetches qualifying segment results (Q1, Q2, Q3) for a round."""
        data = self.get_json(f"{year}/{round_num}/qualifying.json")
        if data and "MRData" in data and "RaceTable" in data["MRData"]:
            races = data["MRData"]["RaceTable"].get("Races", [])
            return races[0] if races else None
        return None

    def fetch_sprint_results(self, year: int, round_num: int) -> Optional[Dict[str, Any]]:
        """Fetches sprint race classification if held on this weekend."""
        data = self.get_json(f"{year}/{round_num}/sprint.json")
        if data and "MRData" in data and "RaceTable" in data["MRData"]:
            races = data["MRData"]["RaceTable"].get("Races", [])
            return races[0] if races else None
        return None

    def fetch_driver_standings(self, year: int, round_num: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetches driver championship standings."""
        endpoint = f"{year}/{round_num}/driverstandings.json" if round_num else f"{year}/driverstandings.json"
        data = self.get_json(endpoint)
        if data and "MRData" in data and "StandingsTable" in data["MRData"]:
            lists = data["MRData"]["StandingsTable"].get("StandingsLists", [])
            if lists:
                return lists[0].get("DriverStandings", [])
        return []

    def fetch_constructor_standings(self, year: int, round_num: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetches constructor championship standings."""
        endpoint = f"{year}/{round_num}/constructorstandings.json" if round_num else f"{year}/constructorstandings.json"
        data = self.get_json(endpoint)
        if data and "MRData" in data and "StandingsTable" in data["MRData"]:
            lists = data["MRData"]["StandingsTable"].get("StandingsLists", [])
            if lists:
                return lists[0].get("ConstructorStandings", [])
        return []

    def fetch_circuits(self) -> List[Dict[str, Any]]:
        """Fetches comprehensive directory of historical circuits."""
        data = self.get_json("circuits.json", params={"limit": 100})
        if data and "MRData" in data and "CircuitTable" in data["MRData"]:
            return data["MRData"]["CircuitTable"].get("Circuits", [])
        return []
