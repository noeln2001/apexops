import pytest
from analytics.simulation.championship_simulator import ChampionshipSimulator

def test_points_calculation_standard():
    assert ChampionshipSimulator.POINTS_SYSTEM[0] == 25
    assert ChampionshipSimulator.POINTS_SYSTEM[1] == 18
    assert ChampionshipSimulator.POINTS_SYSTEM[2] == 15
    assert len(ChampionshipSimulator.POINTS_SYSTEM) == 10

def test_remaining_points():
    # 6 races (25 pts each) + 2 sprints (8 pts each) = 150 + 16 = 166 points max
    pts = ChampionshipSimulator.calculate_remaining_points(remaining_races=6, remaining_sprints=2)
    assert pts == 166

def test_deterministic_scenario_countback():
    current_standings = [
        {"driver_id": "norris", "name": "Lando Norris", "team": "McLaren", "points": 331.0, "wins": 6},
        {"driver_id": "verstappen", "name": "Max Verstappen", "team": "Red Bull", "points": 313.0, "wins": 7}
    ]
    # Verstappen wins next race (25 pts), Norris finishes 2nd (18 pts)
    # Norris: 331 + 18 = 349. Verstappen: 313 + 25 = 338. Norris stays leader.
    scenarios = [
        {"round": 18, "finishing_order": ["verstappen", "norris"]}
    ]
    res = ChampionshipSimulator.run_deterministic_scenario(current_standings, scenarios)
    assert res[0]["driver_id"] == "norris"
    assert res[0]["projected_points"] == 349.0
    assert res[1]["driver_id"] == "verstappen"
    assert res[1]["projected_points"] == 338.0

def test_monte_carlo_probability_bounds():
    current_standings = [
        {"driver_id": "norris", "name": "Lando Norris", "team": "McLaren", "points": 331.0},
        {"driver_id": "verstappen", "name": "Max Verstappen", "team": "Red Bull", "points": 313.0},
        {"driver_id": "leclerc", "name": "Charles Leclerc", "team": "Ferrari", "points": 275.0}
    ]
    sim = ChampionshipSimulator.run_monte_carlo(current_standings, remaining_races=3, iterations=100)
    assert "probabilities" in sim
    assert len(sim["probabilities"]) == 3
    # Probabilities should sum to approximately 100%
    total_pct = sum(p["championship_prob_pct"] for p in sim["probabilities"])
    assert 98.0 <= total_pct <= 102.0
