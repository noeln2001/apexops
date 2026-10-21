import math
from typing import Any, Dict, List

import numpy as np


class TelemetryService:
    """Computes synchronized distance-aligned telemetry, speed deltas, and time differences."""

    @staticmethod
    def align_telemetry_laps(lap_a: List[Dict[str, Any]], lap_b: List[Dict[str, Any]], num_points: int = 250) -> Dict[str, Any]:
        """Aligns two laps by track distance (0m to max distance) using linear interpolation."""
        if not lap_a or not lap_b:
            return {"error": "Insufficient telemetry data for comparison"}

        dist_a = [p["distance_m"] for p in lap_a]
        speed_a = [p["speed_kmh"] for p in lap_a]
        throttle_a = [p["throttle_pct"] for p in lap_a]
        brake_a = [1.0 if p.get("brake_bool") else 0.0 for p in lap_a]

        dist_b = [p["distance_m"] for p in lap_b]
        speed_b = [p["speed_kmh"] for p in lap_b]
        throttle_b = [p["throttle_pct"] for p in lap_b]
        brake_b = [1.0 if p.get("brake_bool") else 0.0 for p in lap_b]

        max_dist = min(max(dist_a), max(dist_b))
        common_dist = np.linspace(0, max_dist, num_points).tolist()

        interp_speed_a = np.interp(common_dist, dist_a, speed_a).tolist()
        interp_speed_b = np.interp(common_dist, dist_b, speed_b).tolist()
        interp_throttle_a = np.interp(common_dist, dist_a, throttle_a).tolist()
        interp_throttle_b = np.interp(common_dist, dist_b, throttle_b).tolist()
        interp_brake_a = np.interp(common_dist, dist_a, brake_a).tolist()
        interp_brake_b = np.interp(common_dist, dist_b, brake_b).tolist()

        # Delta speed (km/h) and time delta approximation
        speed_delta = [round(a - b, 2) for a, b in zip(interp_speed_a, interp_speed_b)]

        # Cumulative time delta (dt = ds / v)
        time_delta = [0.0]
        for i in range(1, len(common_dist)):
            ds = common_dist[i] - common_dist[i-1]
            va = max(interp_speed_a[i] / 3.6, 5.0)
            vb = max(interp_speed_b[i] / 3.6, 5.0)
            dt_segment = (ds / va) - (ds / vb)
            time_delta.append(round(time_delta[-1] + dt_segment, 3))

        return {
            "distance": [round(d, 1) for d in common_dist],
            "lap_a": {
                "speed": [round(s, 1) for s in interp_speed_a],
                "throttle": [round(t, 1) for t in interp_throttle_a],
                "brake": [round(b, 2) for b in interp_brake_a]
            },
            "lap_b": {
                "speed": [round(s, 1) for s in interp_speed_b],
                "throttle": [round(t, 1) for t in interp_throttle_b],
                "brake": [round(b, 2) for b in interp_brake_b]
            },
            "speed_delta": speed_delta,
            "time_delta": time_delta,
            "max_distance_m": round(max_dist, 1)
        }

    @staticmethod
    def generate_synthetic_telemetry(circuit_name: str, driver_code: str, base_lap_time: float) -> List[Dict[str, Any]]:
        """Generates realistic telemetry points based on verified circuit length for visualization."""
        points = []
        track_len = 5063.0 if "Singapore" in circuit_name else 5513.0 # COTA Austin
        steps = 200

        for i in range(steps):
            d = (i / steps) * track_len
            # Harmonic model approximating straights and braking corners
            angle = (i / steps) * 8 * math.pi
            base_speed = 210.0 + 80.0 * math.sin(angle) - 30.0 * math.cos(angle * 2)
            speed = max(65.0, min(335.0, base_speed))

            # Throttle & Brake logic
            throttle = 100.0 if speed > 180 else max(0.0, (speed - 65.0) * 1.5)
            brake = (speed < 140.0 and math.sin(angle) < -0.3)
            gear = min(8, max(2, int(speed / 42)))
            rpm = int(8000 + (speed % 40) * 110)
            drs = 2 if (speed > 260 and (d < 1000 or (2200 < d < 3200))) else 0

            points.append({
                "distance_m": round(d, 1),
                "speed_kmh": round(speed, 1),
                "throttle_pct": round(throttle, 1),
                "brake_bool": brake,
                "gear": gear,
                "rpm": rpm,
                "drs_status": drs
            })
        return points
