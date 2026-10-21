from typing import Any, Dict, List

from analytics.championship.scoring_rules import REMAINING_ROUNDS_2026, get_gp_points, get_sprint_points


class InteractiveChampionshipSimulator:
    """
    Simulates race-by-race user finishing position selections across all 6 remaining rounds
    and 3 sprints, projecting final points, standings changes, and championship winner.
    """

    @classmethod
    def apply_simulation(
        cls,
        current_standings: List[Dict[str, Any]],
        race_selections: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        race_selections format:
        {
           "round_18_gp": {"max_verstappen": 1, "antonelli": 4, "norris": 2, ...},
           "round_18_sprint": {"max_verstappen": 1, "antonelli": 5, ...},
           "round_18_fl": "max_verstappen",
           "round_19_gp": ...,
           ...
        }
        """
        # Map initial state
        driver_points = {d["driver_id"]: float(d["current_points"]) for d in current_standings}
        driver_wins = {d["driver_id"]: int(d.get("wins", 0)) for d in current_standings}
        driver_finishes: Dict[str, List[int]] = {d["driver_id"]: [] for d in current_standings}

        # Apply each round selection
        for r in REMAINING_ROUNDS_2026:
            r_num = r["round"]
            gp_key = f"round_{r_num}_gp"
            fl_key = f"round_{r_num}_fl"
            sprint_key = f"round_{r_num}_sprint"

            gp_results = race_selections.get(gp_key, {})
            fl_driver = race_selections.get(fl_key)
            sprint_results = race_selections.get(sprint_key, {})

            # Grand Prix session
            for d_id, pos_val in gp_results.items():
                if d_id not in driver_points:
                    continue
                try:
                    pos = int(pos_val)
                    if 1 <= pos <= 20:
                        has_fl = (fl_driver == d_id and pos <= 10)
                        pts = get_gp_points(pos, fastest_lap=has_fl)
                        driver_points[d_id] += pts
                        driver_finishes[d_id].append(pos)
                        if pos == 1:
                            driver_wins[d_id] += 1
                except (ValueError, TypeError):
                    pass # DNF/DNS/DSQ gives 0 points

            # Sprint session (if applicable)
            if r.get("has_sprint") and sprint_results:
                for d_id, pos_val in sprint_results.items():
                    if d_id not in driver_points:
                        continue
                    try:
                        pos = int(pos_val)
                        if 1 <= pos <= 8:
                            pts = get_sprint_points(pos)
                            driver_points[d_id] += pts
                    except (ValueError, TypeError):
                        pass

        # Build projected standings list
        projected = []
        for d in current_standings:
            d_id = d["driver_id"]
            start_pts = float(d["current_points"])
            fin_pts = round(driver_points[d_id], 1)
            pts_gain = round(fin_pts - start_pts, 1)

            projected.append({
                "driver_id": d_id,
                "name": d["name"],
                "code": d.get("code", d_id[:3].upper()),
                "team": d.get("team", "Unknown"),
                "starting_position": d["position"],
                "starting_points": start_pts,
                "projected_points": fin_pts,
                "points_gained": pts_gain,
                "projected_wins": driver_wins[d_id],
                "finishes_list": driver_finishes[d_id]
            })

        # Sort projected standings using official countback tie-breaker
        def sort_key(item):
            # Points primary, wins secondary
            return (item["projected_points"], item["projected_wins"])

        projected.sort(key=sort_key, reverse=True)

        for rank_idx, item in enumerate(projected):
            item["projected_position"] = rank_idx + 1
            item["position_change"] = item["starting_position"] - item["projected_position"] # positive means climbed up

        champion = projected[0]

        return {
            "status": "SIMULATED",
            "champion": champion,
            "projected_standings": projected,
            "rounds_simulated": len(race_selections)
        }

    @classmethod
    def get_preset_scenario(cls, preset_key: str, target_driver_id: str = "max_verstappen", leader_id: str = "antonelli") -> Dict[str, Any]:
        """Returns pre-filled finishing order maps for instant interactive buttons."""
        selections = {}

        if preset_key == "max_wins_austin":
            # Round 18 Sprint & GP
            selections["round_18_gp"] = {target_driver_id: 1, leader_id: 4, "norris": 2, "russell": 3, "hamilton": 5}
            selections["round_18_fl"] = target_driver_id
            selections["round_18_sprint"] = {target_driver_id: 1, leader_id: 4, "russell": 2, "norris": 3}

        elif preset_key == "max_wins_all":
            for r in REMAINING_ROUNDS_2026:
                r_num = r["round"]
                selections[f"round_{r_num}_gp"] = {target_driver_id: 1, leader_id: 2, "norris": 3, "russell": 4, "hamilton": 5}
                selections[f"round_{r_num}_fl"] = target_driver_id
                if r.get("has_sprint"):
                    selections[f"round_{r_num}_sprint"] = {target_driver_id: 1, leader_id: 2, "russell": 3, "norris": 4}

        elif preset_key == "max_wins_leader_dnf":
            # Austin: Max wins, Antonelli DNF
            selections["round_18_gp"] = {target_driver_id: 1, leader_id: "DNF", "norris": 2, "russell": 3, "hamilton": 4}
            selections["round_18_fl"] = target_driver_id
            selections["round_18_sprint"] = {target_driver_id: 1, leader_id: "DNF", "norris": 2, "russell": 3}

        elif preset_key == "max_wins_leader_p5":
            for r in REMAINING_ROUNDS_2026:
                r_num = r["round"]
                selections[f"round_{r_num}_gp"] = {target_driver_id: 1, leader_id: 5, "norris": 2, "russell": 3, "hamilton": 4}
                selections[f"round_{r_num}_fl"] = target_driver_id
                if r.get("has_sprint"):
                    selections[f"round_{r_num}_sprint"] = {target_driver_id: 1, leader_id: 5, "russell": 2, "norris": 3}

        elif preset_key == "max_p2":
            for r in REMAINING_ROUNDS_2026:
                r_num = r["round"]
                selections[f"round_{r_num}_gp"] = {target_driver_id: 2, leader_id: 1, "norris": 3, "russell": 4, "hamilton": 5}
                if r.get("has_sprint"):
                    selections[f"round_{r_num}_sprint"] = {target_driver_id: 2, leader_id: 1, "russell": 3, "norris": 4}

        return selections
