from typing import List, Dict, Any, Optional

# Official FIA Formula 1 World Championship Scoring Regulations (2026 Season)
GRAND_PRIX_POINTS = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1
}

SPRINT_POINTS = {
    1: 8,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1
}

FASTEST_LAP_POINTS = 1  # Awarded only if driver finishes in top 10

# 2026 Remaining Calendar Schedule (Anchored at 20 October 2026, Post-Singapore GP)
REMAINING_ROUNDS_2026 = [
    {
        "round": 18,
        "name": "United States Grand Prix",
        "circuit_name": "Circuit of the Americas",
        "date": "2026-10-25",
        "has_sprint": True,
        "max_gp_points": 26, # 25 for P1 + 1 for FL
        "max_sprint_points": 8
    },
    {
        "round": 19,
        "name": "Mexico City Grand Prix",
        "circuit_name": "Autódromo Hermanos Rodríguez",
        "date": "2026-11-01",
        "has_sprint": False,
        "max_gp_points": 26,
        "max_sprint_points": 0
    },
    {
        "round": 20,
        "name": "São Paulo Grand Prix",
        "circuit_name": "Autódromo José Carlos Pace (Interlagos)",
        "date": "2026-11-08",
        "has_sprint": True,
        "max_gp_points": 26,
        "max_sprint_points": 8
    },
    {
        "round": 21,
        "name": "Las Vegas Grand Prix",
        "circuit_name": "Las Vegas Strip Circuit",
        "date": "2026-11-22",
        "has_sprint": False,
        "max_gp_points": 26,
        "max_sprint_points": 0
    },
    {
        "round": 22,
        "name": "Qatar Grand Prix",
        "circuit_name": "Lusail International Circuit",
        "date": "2026-11-29",
        "has_sprint": True,
        "max_gp_points": 26,
        "max_sprint_points": 8
    },
    {
        "round": 23,
        "name": "Abu Dhabi Grand Prix",
        "circuit_name": "Yas Marina Circuit",
        "date": "2026-12-06",
        "has_sprint": False,
        "max_gp_points": 26,
        "max_sprint_points": 0
    }
]

def get_gp_points(position: Optional[int], fastest_lap: bool = False) -> int:
    """Calculates Grand Prix race points according to official FIA regulations."""
    if position is None or position < 1 or position > 20:
        return 0
    pts = GRAND_PRIX_POINTS.get(position, 0)
    if fastest_lap and position <= 10:
        pts += FASTEST_LAP_POINTS
    return pts

def get_sprint_points(position: Optional[int]) -> int:
    """Calculates Sprint race points according to official FIA regulations."""
    if position is None or position < 1 or position > 20:
        return 0
    return SPRINT_POINTS.get(position, 0)

def calculate_max_remaining_points(rounds: List[Dict[str, Any]] = REMAINING_ROUNDS_2026, include_fastest_lap: bool = True) -> int:
    """Calculates the absolute maximum points a single driver can score in the remaining rounds."""
    total = 0
    for r in rounds:
        gp_max = 26 if include_fastest_lap else 25
        total += gp_max
        if r.get("has_sprint", False):
            total += 8
    return total

def compare_countback(driver_a_finishes: List[int], driver_b_finishes: List[int]) -> int:
    """
    Applies official FIA sporting regulation countback tie-breaker:
    Compares number of 1st places, then 2nd places, 3rd places, etc.
    Returns:
       1 if driver A wins tie-break
      -1 if driver B wins tie-break
       0 if absolute dead heat
    """
    for pos in range(1, 21):
        count_a = driver_a_finishes.count(pos)
        count_b = driver_b_finishes.count(pos)
        if count_a > count_b:
            return 1
        elif count_b > count_a:
            return -1
    return 0
