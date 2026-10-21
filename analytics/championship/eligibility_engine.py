from typing import Any, Dict, List

from analytics.championship.scoring_rules import REMAINING_ROUNDS_2026, calculate_max_remaining_points


class ChampionshipEligibilityEngine:
    """
    Mathematical engine evaluating Drivers' World Championship eligibility,
    clinched titles, mathematical eliminations, and points boundaries.
    """

    @classmethod
    def calculate_eligibility(
        cls,
        standings: List[Dict[str, Any]],
        remaining_rounds: List[Dict[str, Any]] = REMAINING_ROUNDS_2026
    ) -> List[Dict[str, Any]]:
        """
        Takes sorted championship standings and evaluates mathematical boundaries for every driver.
        """
        if not standings:
            return []

        max_available_pts = calculate_max_remaining_points(remaining_rounds, include_fastest_lap=True)
        calculate_max_remaining_points(remaining_rounds, include_fastest_lap=False)
        len(remaining_rounds)
        sum(1 for r in remaining_rounds if r.get("has_sprint", False))

        leader = standings[0]
        leader_pts = float(leader.get("current_points", leader.get("points", 0.0)))

        # Check if leader has already mathematically clinched the title:
        # Leader is CLINCHED if leader_pts > second_place.max_achievable_points
        second_place_max = 0.0
        if len(standings) > 1:
            second_pts = float(standings[1].get("current_points", standings[1].get("points", 0.0)))
            second_place_max = second_pts + max_available_pts
        is_title_clinched = (len(standings) > 1) and (leader_pts > second_place_max)

        processed = []
        for idx, driver in enumerate(standings):
            curr_pts = float(driver.get("current_points", driver.get("points", 0.0)))
            max_achievable = round(curr_pts + max_available_pts, 1)
            gap_to_leader = round(leader_pts - curr_pts, 1)

            # Ahead & behind gaps
            prev_pts = float(standings[idx - 1].get("current_points", standings[idx - 1].get("points", 0.0))) if idx > 0 else 0.0
            gap_ahead = round(prev_pts - curr_pts, 1) if idx > 0 else 0.0
            next_pts = float(standings[idx + 1].get("current_points", standings[idx + 1].get("points", 0.0))) if idx < len(standings) - 1 else 0.0
            gap_behind = round(curr_pts - next_pts, 1) if idx < len(standings) - 1 else 0.0

            # Eligibility status:
            # - CLINCHED: Leader when no rival can catch them
            # - CONTENDER: Driver can mathematically tie or surpass current leader
            # - ELIMINATED: Driver's max achievable points < current leader points
            if idx == 0 and is_title_clinched:
                status = "CLINCHED"
                eliminated_at = None
            elif max_achievable >= leader_pts:
                status = "CONTENDER"
                eliminated_at = None
            else:
                status = "ELIMINATED"
                eliminated_at = "Mathematically eliminated (max points < leader current points)"

            # Min points to overhaul current leader
            min_pts_to_catch = max(0.0, round(leader_pts - curr_pts + (0.0 if idx == 0 else 1.0), 1))

            # Maximum possible finishing position in championship
            # Count how many drivers can guarantee finishing ahead even if this driver scores max points
            guaranteed_ahead = sum(1 for other in standings if float(other.get("points", 0.0)) > max_achievable)
            best_possible_pos = guaranteed_ahead + 1

            processed.append({
                "position": idx + 1,
                "driver_id": driver["driver_id"],
                "name": driver.get("name", driver["driver_id"]),
                "code": driver.get("code", driver["driver_id"][:3].upper()),
                "team": driver.get("team", "Unknown"),
                "current_points": curr_pts,
                "wins": int(driver.get("wins", 0)),
                "podiums": int(driver.get("podiums", 0)),
                "dnfs": int(driver.get("dnfs", 0)),
                "points_gap_to_leader": gap_to_leader,
                "points_gap_to_ahead": gap_ahead,
                "points_gap_to_behind": gap_behind,
                "max_achievable_points": max_achievable,
                "max_possible_position": best_possible_pos,
                "min_points_needed_to_lead": min_pts_to_catch,
                "status": status,
                "is_clinched": status == "CLINCHED",
                "is_eliminated": status == "ELIMINATED",
                "is_contender": status == "CONTENDER",
                "eliminated_at": eliminated_at
            })

        return processed

    @classmethod
    def get_summary(cls, processed_standings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides high-level title battle summary metrics."""
        contenders = [d for d in processed_standings if d["is_contender"]]
        eliminated = [d for d in processed_standings if d["is_eliminated"]]

        remaining_pts = calculate_max_remaining_points(REMAINING_ROUNDS_2026, include_fastest_lap=True)

        return {
            "season": 2026,
            "reference_anchor": "2026-10-20 (Post-Singapore GP / Pre-Austin GP)",
            "remaining_rounds": len(REMAINING_ROUNDS_2026),
            "remaining_sprints": sum(1 for r in REMAINING_ROUNDS_2026 if r.get("has_sprint")),
            "max_available_points_per_driver": remaining_pts,
            "total_drivers": len(processed_standings),
            "active_contenders_count": len(contenders),
            "eliminated_drivers_count": len(eliminated),
            "leader": processed_standings[0] if processed_standings else None,
            "contenders_list": [d["name"] for d in contenders]
        }
