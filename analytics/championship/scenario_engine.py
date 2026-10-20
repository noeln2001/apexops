from typing import List, Dict, Any, Optional
from analytics.championship.scoring_rules import (
    REMAINING_ROUNDS_2026,
    GRAND_PRIX_POINTS,
    SPRINT_POINTS,
    get_gp_points,
    get_sprint_points,
    calculate_max_remaining_points
)

class TitleScenarioEngine:
    """
    Engine calculating realistic, mathematically precise championship scenarios
    for Max Verstappen (and configurable for any driver).
    """

    @classmethod
    def generate_driver_scenarios(
        cls,
        standings: List[Dict[str, Any]],
        target_driver_id: str = "max_verstappen"
    ) -> Dict[str, Any]:
        """
        Generates tactical championship scenarios for target driver against current leader and rivals.
        """
        # Identify target driver
        target_driver = next((d for d in standings if d["driver_id"] == target_driver_id), None)
        if not target_driver:
            # Fallback to Verstappen if target not found
            target_driver = next((d for d in standings if d["driver_id"] == "max_verstappen"), standings[0])

        leader = standings[0]
        leader_id = leader["driver_id"]
        is_target_leader = (target_driver["driver_id"] == leader_id)

        target_start_pts = float(target_driver["current_points"])
        leader_start_pts = float(leader["current_points"])
        start_gap = round(leader_start_pts - target_start_pts, 1)

        total_remaining_pts = calculate_max_remaining_points(REMAINING_ROUNDS_2026, include_fastest_lap=True)

        scenarios_list = []

        # -------------------------------------------------------------
        # SCENARIO 1: "The Maximum Maximum" - Win All 6 Remaining GPs & 3 Sprints
        # -------------------------------------------------------------
        max_possible_points_gain = (6 * 26) + (3 * 8) # 180 points
        target_pts_scen1 = round(target_start_pts + max_possible_points_gain, 1)
        # Assume leader finishes average P2 across remaining rounds: 6 * 18 + 3 * 7 = 108 + 21 = 129 pts
        leader_gain_p2 = (6 * 18) + (3 * 7) # 129 points
        leader_pts_scen1 = round(leader_start_pts + leader_gain_p2, 1)
        diff_scen1 = round(target_pts_scen1 - leader_pts_scen1, 1)
        wins_title_scen1 = target_pts_scen1 > leader_pts_scen1

        scenarios_list.append({
            "id": "maximum_clean_sweep",
            "title": f"{target_driver['name']} Clean Sweep — Wins All 6 Remaining GPs & 3 Sprints",
            "category": "BEST_CASE",
            "description": f"Dominant run taking maximum available 180 points (6 Feature Wins + Fastest Laps + 3 Sprint Wins).",
            "target_starting_points": target_start_pts,
            "target_gained_points": max_possible_points_gain,
            "target_final_points": target_pts_scen1,
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": leader_gain_p2,
            "leader_final_points": leader_pts_scen1,
            "resulting_points_difference": diff_scen1,
            "target_wins_championship": wins_title_scen1,
            "remains_eligible": True,
            "explanation": (
                f"If {target_driver['name']} wins all 6 remaining Grands Prix and 3 Sprints (+180 pts), "
                f"his total reaches {target_pts_scen1} points. Even if {leader['name']} finishes P2 in every single session (+129 pts, reaching {leader_pts_scen1} pts), "
                f"{target_driver['name']} overhauls the deficit and WINS the World Championship by {abs(diff_scen1)} points!"
                if wins_title_scen1 else
                f"Even with 6 wins (+180 pts to reach {target_pts_scen1}), if {leader['name']} scores {leader_gain_p2} pts (reaching {leader_pts_scen1}), "
                f"{leader['name']} would hold on by {abs(diff_scen1)} points. {target_driver['name']} needs rivals to finish P3 or lower in at least 2 rounds."
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 2: Austin GP & Sprint Swing — Target P1, Leader P4
        # -------------------------------------------------------------
        # Austin has a Sprint (8 pts) + GP (25 pts) + FL (1 pt) = 34 pts max
        target_austin_gain = 25 + 8 + 1 # 34 pts
        leader_austin_p4_gain = 12 + 5 # 17 pts (P4 in GP + P4 in Sprint)
        net_swing_austin = target_austin_gain - leader_austin_p4_gain # +17 pts
        new_deficit_austin = round(start_gap - net_swing_austin, 1)

        scenarios_list.append({
            "id": "austin_swing_p4",
            "title": "United States GP Swing — Max P1 Double, Leader P4",
            "category": "TACTICAL_SWING",
            "description": f"Target driver sweeps Austin Sprint and Grand Prix while {leader['name']} finishes P4 in both sessions.",
            "target_starting_points": target_start_pts,
            "target_gained_points": target_austin_gain,
            "target_final_points": round(target_start_pts + target_austin_gain, 1),
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": leader_austin_p4_gain,
            "leader_final_points": round(leader_start_pts + leader_austin_p4_gain, 1),
            "resulting_points_difference": new_deficit_austin,
            "target_wins_championship": False, # Only 1 round completed
            "remains_eligible": True,
            "explanation": (
                f"If {target_driver['name']} wins both the Sprint and Grand Prix with Fastest Lap in Austin (+34 pts) "
                f"while {leader['name']} finishes P4 in both (+17 pts), {target_driver['name']} takes a net +17 point swing. "
                f"His championship deficit reduces from {start_gap} pts down to {new_deficit_austin} pts with 5 rounds and 2 sprints remaining (146 available points)."
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 3: Leader DNF Shock in Austin — Target P1, Leader 0 pts
        # -------------------------------------------------------------
        target_austin_max = 34
        leader_austin_dnf = 0
        net_swing_dnf = 34
        new_deficit_dnf = round(start_gap - net_swing_dnf, 1)

        scenarios_list.append({
            "id": "leader_dnf_austin",
            "title": f"Championship Shock — {leader['name']} Suffers Double DNF in Austin",
            "category": "RIVAL_MISFORTUNE",
            "description": f"Target driver secures 34 points in Austin while {leader['name']} suffers mechanical failure or collision.",
            "target_starting_points": target_start_pts,
            "target_gained_points": target_austin_max,
            "target_final_points": round(target_start_pts + target_austin_max, 1),
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": 0,
            "leader_final_points": leader_start_pts,
            "resulting_points_difference": new_deficit_dnf,
            "target_wins_championship": False,
            "remains_eligible": True,
            "explanation": (
                f"A disastrous weekend for {leader['name']} (0 points scored) combined with a {target_driver['name']} victory (+34 pts) "
                f"slashes the championship gap instantly by 34 points, bringing the deficit from {start_gap} pts down to {new_deficit_dnf} pts. "
                f"This transforms the title fight into an open contest heading into Mexico and Brazil."
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 4: Consistency Grinder — Target P2 in All Remaining Rounds
        # -------------------------------------------------------------
        target_p2_gain = (6 * 18) + (3 * 7) # 129 pts
        leader_split_gain = (3 * 25) + (3 * 15) + (2 * 8) + (1 * 6) # 3 wins, 3 P3s, mixed sprints = 142 pts
        target_p2_final = round(target_start_pts + target_p2_gain, 1)
        leader_split_final = round(leader_start_pts + leader_split_gain, 1)

        scenarios_list.append({
            "id": "podium_grinder_p2",
            "title": f"Podium Grinder — {target_driver['name']} P2 in Every Session",
            "category": "CONSISTENCY",
            "description": f"Target driver finishes runner-up in every remaining race and sprint without taking a win.",
            "target_starting_points": target_start_pts,
            "target_gained_points": target_p2_gain,
            "target_final_points": target_p2_final,
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": leader_split_gain,
            "leader_final_points": leader_split_final,
            "resulting_points_difference": round(leader_split_final - target_p2_final, 1),
            "target_wins_championship": target_p2_final > leader_split_final,
            "remains_eligible": False if target_p2_final < leader_split_final else True,
            "explanation": (
                f"Scoring P2 in all 6 GPs and 3 sprints yields 129 points. Because {target_driver['name']} starts {start_gap} points behind, "
                f"finishing P2 without wins is statistically insufficient to overhaul {leader['name']}. "
                f"{target_driver['name']} MUST win at least 3-4 Grands Prix to generate the required positive point swing."
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 5: Elimination Threat — Target Suffers DNF in Austin
        # -------------------------------------------------------------
        target_dnf_gain = 0
        leader_austin_win_gain = 34
        deficit_after_target_dnf = round(start_gap + 34, 1)
        remaining_after_austin = total_remaining_pts - 34 # 146 pts left
        is_eliminated_austin = (target_start_pts + remaining_after_austin) < (leader_start_pts + 34)

        scenarios_list.append({
            "id": "target_dnf_austin",
            "title": f"Worst Case Nightmare — {target_driver['name']} DNF at Austin, Leader Wins",
            "category": "ELIMINATION_RISK",
            "description": f"{target_driver['name']} retires with 0 points while {leader['name']} scores maximum 34 points in Texas.",
            "target_starting_points": target_start_pts,
            "target_gained_points": 0,
            "target_final_points": target_start_pts,
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": 34,
            "leader_final_points": round(leader_start_pts + 34, 1),
            "resulting_points_difference": deficit_after_target_dnf,
            "target_wins_championship": False,
            "remains_eligible": not is_eliminated_austin,
            "explanation": (
                f"If {target_driver['name']} scores 0 points in Austin while {leader['name']} takes all 34 points, "
                f"the gap blows out from {start_gap} to {deficit_after_target_dnf} points. "
                + (f"With only {remaining_after_austin} points remaining in the season, {target_driver['name']} is MATHEMATICALLY ELIMINATED from the World Championship!"
                   if is_eliminated_austin else
                   f"With {remaining_after_austin} points available, {target_driver['name']} would retain a razor-thin mathematical hope of {round(target_start_pts + remaining_after_austin - (leader_start_pts + 34), 1)} pts.")
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 6: Multi-Car Collision in Interlagos / Qatar
        # -------------------------------------------------------------
        scenarios_list.append({
            "id": "multi_rival_dnf",
            "title": "Wet Weather Chaos — Mercedes & Ferrari Collision",
            "category": "CHAOS_EVENT",
            "description": "Heavy rainfall at Interlagos causes multi-car pileup eliminating Antonelli and Russell, allowing Max to win from behind.",
            "target_starting_points": target_start_pts,
            "target_gained_points": 34,
            "target_final_points": round(target_start_pts + 34, 1),
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": 0,
            "leader_final_points": leader_start_pts,
            "resulting_points_difference": round(start_gap - 34, 1),
            "target_wins_championship": False,
            "remains_eligible": True,
            "explanation": (
                f"A double-zero score for the Mercedes team at Interlagos allows {target_driver['name']} to gain 34 points in a single weekend. "
                f"This cuts the championship deficit to {round(start_gap - 34, 1)} points, placing immense psychological pressure on the championship leader."
            )
        })

        # -------------------------------------------------------------
        # SCENARIO 7: Exact Mathematical Elimination Threshold
        # -------------------------------------------------------------
        # What is the exact point delta that eliminates target driver?
        # Target is eliminated when: target_current + remaining_pts < leader_current + delta
        # => delta > target_current + remaining_pts - leader_current
        # => delta > max_achievable - leader_current
        max_possible_target = target_start_pts + total_remaining_pts
        cushion = round(max_possible_target - leader_start_pts, 1)

        scenarios_list.append({
            "id": "mathematical_threshold",
            "title": f"Mathematical Elimination Threshold: +{cushion} Point Buffer",
            "category": "MATHEMATICAL_BOUNDARY",
            "description": f"The exact point margin separating {target_driver['name']} from mathematical elimination.",
            "target_starting_points": target_start_pts,
            "target_gained_points": 0,
            "target_final_points": max_possible_target,
            "leader_starting_points": leader_start_pts,
            "leader_assumed_gain": cushion,
            "leader_final_points": round(leader_start_pts + cushion, 1),
            "resulting_points_difference": 0.0,
            "target_wins_championship": False,
            "remains_eligible": True,
            "explanation": (
                f"{target_driver['name']} currently possesses a mathematical survival buffer of {cushion} points. "
                f"If {leader['name']} extends his lead by more than {cushion} points across any combination of remaining races, "
                f"{target_driver['name']} is instantly mathematically eliminated from the 2026 World Championship."
            )
        })

        return {
            "target_driver": target_driver,
            "leader": leader,
            "starting_deficit": start_gap,
            "remaining_points_available": total_remaining_pts,
            "survival_cushion_points": cushion,
            "scenarios_count": len(scenarios_list),
            "scenarios": scenarios_list
        }
