from typing import Any, Dict, List

from analytics.championship.scoring_rules import REMAINING_ROUNDS_2026, calculate_max_remaining_points


class DriverComparisonEngine:
    """
    Computes rigorous head-to-head statistical comparisons and points trajectory
    between a target driver (default: Max Verstappen) and a rival.
    """

    @classmethod
    def compare_drivers(
        cls,
        standings: List[Dict[str, Any]],
        driver_a_id: str = "max_verstappen",
        driver_b_id: str = "antonelli"
    ) -> Dict[str, Any]:
        driver_a = next((d for d in standings if d["driver_id"] == driver_a_id), None)
        driver_b = next((d for d in standings if d["driver_id"] == driver_b_id), None)

        if not driver_a:
            driver_a = standings[0]
        if not driver_b:
            driver_b = standings[1] if len(standings) > 1 else standings[0]

        pts_a = float(driver_a["current_points"])
        pts_b = float(driver_b["current_points"])
        gap_a_to_b = round(pts_b - pts_a, 1)

        remaining_races = len(REMAINING_ROUNDS_2026)
        remaining_sprints = sum(1 for r in REMAINING_ROUNDS_2026 if r.get("has_sprint"))
        max_remaining_pts = calculate_max_remaining_points(REMAINING_ROUNDS_2026)

        # Average point swing needed per remaining GP
        required_swing_per_gp = round(gap_a_to_b / remaining_races, 1) if remaining_races > 0 else 0.0

        # Best realistic overhauling point:
        # If A wins GP (+25) and B finishes P3 (+15), net swing is +10 per GP
        races_needed_at_p1_vs_p3 = max(1, round(gap_a_to_b / 10.0, 1)) if gap_a_to_b > 0 else 0.0

        return {
            "driver_a": {
                "id": driver_a["driver_id"],
                "name": driver_a["name"],
                "team": driver_a.get("team", "Unknown"),
                "position": driver_a["position"],
                "points": pts_a,
                "wins": driver_a.get("wins", 0),
                "podiums": driver_a.get("podiums", 0),
                "max_achievable": driver_a.get("max_achievable_points", pts_a + max_remaining_pts),
                "status": driver_a.get("status", "CONTENDER")
            },
            "driver_b": {
                "id": driver_b["driver_id"],
                "name": driver_b["name"],
                "team": driver_b.get("team", "Unknown"),
                "position": driver_b["position"],
                "points": pts_b,
                "wins": driver_b.get("wins", 0),
                "podiums": driver_b.get("podiums", 0),
                "max_achievable": driver_b.get("max_achievable_points", pts_b + max_remaining_pts),
                "status": driver_b.get("status", "CONTENDER")
            },
            "points_difference": abs(gap_a_to_b),
            "ahead_driver_id": driver_b["driver_id"] if gap_a_to_b > 0 else driver_a["driver_id"],
            "remaining_rounds": remaining_races,
            "remaining_sprints": remaining_sprints,
            "required_point_swing_per_round": required_swing_per_gp,
            "races_needed_at_10pt_swing": races_needed_at_p1_vs_p3,
            "tactical_analysis": (
                f"{driver_a['name']} trails {driver_b['name']} by {abs(gap_a_to_b)} points. "
                f"To claim the World Championship, {driver_a['name']} needs to outscore {driver_b['name']} by an average of {required_swing_per_gp} points "
                f"across each of the {remaining_races} remaining Grands Prix."
                if gap_a_to_b > 0 else
                f"{driver_a['name']} leads {driver_b['name']} by {abs(gap_a_to_b)} points. "
                f"{driver_b['name']} needs an average swing of {abs(required_swing_per_gp)} points per race to catch up."
            )
        }
