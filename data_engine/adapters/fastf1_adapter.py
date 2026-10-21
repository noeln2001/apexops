import logging
import os
from typing import Any, Dict, List, Optional

import pandas as pd

from backend.app.core.config import settings

logger = logging.getLogger("apexops.adapter.fastf1")

try:
    import fastf1
    FASTF1_AVAILABLE = True
    # Configure FastF1 cache directory
    cache_path = os.path.join(settings.CACHE_DIR, "fastf1")
    os.makedirs(cache_path, exist_ok=True)
    fastf1.Cache.enable_cache(cache_path)
except Exception as e:
    logger.warning(f"FastF1 initialization warning: {e}")
    FASTF1_AVAILABLE = False

class FastF1Adapter:
    """Adapter leveraging FastF1 for timing feeds, tyre degradation, and vehicle telemetry."""

    def __init__(self):
        self.available = FASTF1_AVAILABLE
        self._unavailable_cache = set()

    def get_session(self, year: int, gp_identifier: Any, session_type: str = "R"):
        """Load session object safely. session_type: 'FP1', 'FP2', 'FP3', 'Q', 'SQ', 'S', 'R'."""
        if not self.available:
            return None
        # 2026 season live timing is not archived on the fastf1 mirror; defer to physical model
        if year >= 2026:
            return None
        cache_key = (year, str(gp_identifier), session_type)
        if cache_key in self._unavailable_cache:
            return None
        try:
            session = fastf1.get_session(year, gp_identifier, session_type)
            session.load(telemetry=True, laps=True, weather=False)
            return session
        except BaseException as exc:
            self._unavailable_cache.add(cache_key)
            logger.warning(f"FastF1 session load unavailable for {year} {gp_identifier} {session_type}: {exc}")
            return None

    def extract_driver_laps(self, session, driver_code: str) -> List[Dict[str, Any]]:
        """Extract all laps with sector times and tyre compound for a specific driver."""
        if session is None or not hasattr(session, "laps"):
            return []
        try:
            driver_laps = session.laps.pick_driver(driver_code)
            results = []
            for _, row in driver_laps.iterlaps():
                lap_sec = row["LapTime"].total_seconds() if pd.notna(row["LapTime"]) else None
                s1_sec = row["Sector1Time"].total_seconds() if pd.notna(row["Sector1Time"]) else None
                s2_sec = row["Sector2Time"].total_seconds() if pd.notna(row["Sector2Time"]) else None
                s3_sec = row["Sector3Time"].total_seconds() if pd.notna(row["Sector3Time"]) else None

                results.append({
                    "lap_number": int(row["LapNumber"]),
                    "lap_time_sec": lap_sec,
                    "compound": str(row["Compound"]) if pd.notna(row["Compound"]) else "UNKNOWN",
                    "tyre_life": int(row["TyreLife"]) if pd.notna(row["TyreLife"]) else 0,
                    "stint": int(row["Stint"]) if pd.notna(row["Stint"]) else 1,
                    "s1_sec": s1_sec,
                    "s2_sec": s2_sec,
                    "s3_sec": s3_sec,
                    "is_personal_best": bool(row["IsPersonalBest"]) if "IsPersonalBest" in row else False
                })
            return results
        except Exception as exc:
            logger.error(f"Error extracting driver laps for {driver_code}: {exc}")
            return []

    def extract_lap_telemetry(self, session, driver_code: str, lap_number: Optional[int] = None, downsample_step: int = 4) -> List[Dict[str, Any]]:
        """Extract high-resolution telemetry downsampled for responsive web visualization."""
        if session is None or not hasattr(session, "laps"):
            return []
        try:
            driver_laps = session.laps.pick_driver(driver_code)
            if lap_number is not None:
                target_lap = driver_laps[driver_laps["LapNumber"] == lap_number]
                if target_lap.empty:
                    target_lap = driver_laps.pick_fastest()
            else:
                target_lap = driver_laps.pick_fastest()

            telem = target_lap.get_telemetry()
            if telem is None or telem.empty:
                return []

            # Downsample to avoid sending megabytes of dense raw sensors
            downsampled = telem.iloc[::downsample_step]
            samples = []
            for _, point in downsampled.iterrows():
                samples.append({
                    "distance_m": round(float(point["Distance"]), 1),
                    "speed_kmh": round(float(point["Speed"]), 1),
                    "throttle_pct": round(float(point["Throttle"]), 1),
                    "brake_bool": bool(point["Brake"] > 0) if "Brake" in point else False,
                    "gear": int(point["nGear"]) if "nGear" in point else 1,
                    "rpm": int(point["RPM"]) if "RPM" in point else 0,
                    "drs": int(point["DRS"]) if "DRS" in point else 0
                })
            return samples
        except Exception as exc:
            logger.error(f"Error extracting telemetry for {driver_code}: {exc}")
            return []
