from analytics.championship.eligibility_engine import ChampionshipEligibilityEngine
from analytics.championship.interactive_simulator import InteractiveChampionshipSimulator
from analytics.championship.monte_carlo_engine import MonteCarloTitleEngine
from analytics.championship.scenario_engine import TitleScenarioEngine
from analytics.championship.scoring_rules import (
    REMAINING_ROUNDS_2026,
    calculate_max_remaining_points,
    compare_countback,
    get_gp_points,
    get_sprint_points,
)


def test_gp_points_standard():
    assert get_gp_points(1) == 25
    assert get_gp_points(2) == 18
    assert get_gp_points(3) == 15
    assert get_gp_points(10) == 1
    assert get_gp_points(11) == 0
    assert get_gp_points(None) == 0

def test_gp_points_fastest_lap():
    # Fastest lap inside top 10 awards +1
    assert get_gp_points(1, fastest_lap=True) == 26
    assert get_gp_points(10, fastest_lap=True) == 2
    # Fastest lap outside top 10 awards 0
    assert get_gp_points(11, fastest_lap=True) == 0

def test_sprint_points():
    assert get_sprint_points(1) == 8
    assert get_sprint_points(2) == 7
    assert get_sprint_points(8) == 1
    assert get_sprint_points(9) == 0

def test_remaining_points_calculation():
    # 6 remaining GPs (6*26=156) + 3 Sprints (3*8=24) = 180 with FL
    pts_with_fl = calculate_max_remaining_points(REMAINING_ROUNDS_2026, include_fastest_lap=True)
    assert pts_with_fl == 180

    # Without FL: 6*25 + 3*8 = 174
    pts_no_fl = calculate_max_remaining_points(REMAINING_ROUNDS_2026, include_fastest_lap=False)
    assert pts_no_fl == 174

def test_countback_tie_breaker():
    # Driver A has one P1, Driver B has zero P1s
    finishes_a = [1, 3, 4]
    finishes_b = [2, 2, 3]
    assert compare_countback(finishes_a, finishes_b) == 1
    assert compare_countback(finishes_b, finishes_a) == -1

    # Equal P1s, but A has more P2s
    finishes_a2 = [1, 2, 4]
    finishes_b2 = [1, 3, 3]
    assert compare_countback(finishes_a2, finishes_b2) == 1

    # Dead heat
    assert compare_countback([1, 2], [1, 2]) == 0

def test_mathematical_eligibility_and_elimination():
    sample_standings = [
        {"driver_id": "leader", "name": "Leader Driver", "current_points": 340.0, "wins": 8},
        {"driver_id": "max_verstappen", "name": "Max Verstappen", "current_points": 221.0, "wins": 2},
        {"driver_id": "backmarker", "name": "Backmarker Driver", "current_points": 30.0, "wins": 0}
    ]

    processed = ChampionshipEligibilityEngine.calculate_eligibility(sample_standings)

    # Leader
    assert processed[0]["status"] == "CONTENDER"
    assert processed[0]["is_contender"] is True

    # Verstappen: 221 + 180 = 401 >= 340 -> CONTENDER
    assert processed[1]["driver_id"] == "max_verstappen"
    assert processed[1]["status"] == "CONTENDER"
    assert processed[1]["max_achievable_points"] == 401.0
    assert processed[1]["points_gap_to_leader"] == 119.0
    assert processed[1]["is_contender"] is True
    assert processed[1]["is_eliminated"] is False

    # Backmarker: 30 + 180 = 210 < 340 -> ELIMINATED
    assert processed[2]["driver_id"] == "backmarker"
    assert processed[2]["status"] == "ELIMINATED"
    assert processed[2]["is_eliminated"] is True

def test_clinching_title():
    # If leader has 400 points and 2nd place has 150 points with 180 available (150+180=330 < 400)
    sample_standings = [
        {"driver_id": "leader", "name": "Leader Driver", "current_points": 400.0, "wins": 10},
        {"driver_id": "rival", "name": "Rival Driver", "current_points": 150.0, "wins": 1}
    ]
    processed = ChampionshipEligibilityEngine.calculate_eligibility(sample_standings)
    assert processed[0]["status"] == "CLINCHED"
    assert processed[0]["is_clinched"] is True
    assert processed[1]["status"] == "ELIMINATED"

def test_title_scenarios_verstappen():
    sample_standings = [
        {"driver_id": "antonelli", "name": "Andrea Kimi Antonelli", "current_points": 340.0, "wins": 8, "position": 1},
        {"driver_id": "max_verstappen", "name": "Max Verstappen", "current_points": 221.0, "wins": 2, "position": 4}
    ]
    res = TitleScenarioEngine.generate_driver_scenarios(sample_standings, "max_verstappen")
    assert res["starting_deficit"] == 119.0
    assert res["scenarios_count"] >= 6

    # Verify scenario IDs
    scen_ids = [s["id"] for s in res["scenarios"]]
    assert "maximum_clean_sweep" in scen_ids
    assert "austin_swing_p4" in scen_ids
    assert "leader_dnf_austin" in scen_ids
    assert "target_dnf_austin" in scen_ids

def test_interactive_simulator_presets():
    sample_standings = [
        {"driver_id": "antonelli", "name": "Andrea Kimi Antonelli", "current_points": 340.0, "wins": 8, "position": 1},
        {"driver_id": "max_verstappen", "name": "Max Verstappen", "current_points": 221.0, "wins": 2, "position": 4}
    ]
    selections = InteractiveChampionshipSimulator.get_preset_scenario("max_wins_austin", "max_verstappen", "antonelli")
    sim_res = InteractiveChampionshipSimulator.apply_simulation(sample_standings, selections)

    assert sim_res["status"] == "SIMULATED"
    # Verstappen gained 25 (GP) + 8 (Sprint) + 1 (FL) = 34 pts
    ver_proj = next(d for d in sim_res["projected_standings"] if d["driver_id"] == "max_verstappen")
    assert ver_proj["projected_points"] == 221.0 + 34.0
    assert ver_proj["points_gained"] == 34.0

def test_monte_carlo_seeded_reproducibility():
    sample_standings = [
        {"driver_id": "antonelli", "name": "Andrea Kimi Antonelli", "current_points": 340.0, "wins": 8},
        {"driver_id": "max_verstappen", "name": "Max Verstappen", "current_points": 221.0, "wins": 2}
    ]
    # Run with fixed seed twice
    res1 = MonteCarloTitleEngine.run_simulation(sample_standings, iterations=200, random_seed=123)
    res2 = MonteCarloTitleEngine.run_simulation(sample_standings, iterations=200, random_seed=123)

    assert res1["drivers"][0]["championship_prob_pct"] == res2["drivers"][0]["championship_prob_pct"]
    assert res1["drivers"][0]["expected_final_points"] == res2["drivers"][0]["expected_final_points"]
