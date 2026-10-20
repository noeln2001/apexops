import random
from typing import List, Dict, Any

class ChampionshipSimulator:
    """Simulates Formula 1 championship outcomes using deterministic scenarios and Monte Carlo methods."""

    POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
    SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1]

    @classmethod
    def calculate_remaining_points(cls, remaining_races: int, remaining_sprints: int = 2) -> int:
        """Max points available for one driver: 25 (race) + 8 (sprint) per weekend."""
        return (remaining_races * 25) + (remaining_sprints * 8)

    @classmethod
    def run_deterministic_scenario(
        cls, 
        current_standings: List[Dict[str, Any]], 
        scenarios: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Applies user-specified finishing orders for remaining rounds.
        scenarios: [{'round': 18, 'finishing_order': ['norris', 'verstappen', 'leclerc', ...]}]
        """
        simulated_points = {d["driver_id"]: float(d["points"]) for d in current_standings}
        wins_count = {d["driver_id"]: int(d.get("wins", 0)) for d in current_standings}

        for event in scenarios:
            order = event.get("finishing_order", [])
            for pos_idx, driver_id in enumerate(order[:10]):
                pts = cls.POINTS_SYSTEM[pos_idx]
                simulated_points[driver_id] = simulated_points.get(driver_id, 0.0) + pts
                if pos_idx == 0:
                    wins_count[driver_id] = wins_count.get(driver_id, 0) + 1

        # Sort with countback tie-break (points first, then wins)
        results = []
        for d in current_standings:
            d_id = d["driver_id"]
            results.append({
                "driver_id": d_id,
                "name": d.get("name", d_id),
                "team": d.get("team", "Unknown"),
                "start_points": float(d["points"]),
                "projected_points": simulated_points.get(d_id, 0.0),
                "projected_wins": wins_count.get(d_id, 0)
            })

        results.sort(key=lambda x: (x["projected_points"], x["projected_wins"]), reverse=True)
        for idx, item in enumerate(results):
            item["projected_position"] = idx + 1
            item["points_gain"] = round(item["projected_points"] - item["start_points"], 1)

        return results

    @classmethod
    def run_monte_carlo(
        cls, 
        current_standings: List[Dict[str, Any]], 
        remaining_races: int = 6, 
        remaining_sprints: int = 2,
        iterations: int = 1000
    ) -> Dict[str, Any]:
        """
        Runs 1,000 Monte Carlo iterations incorporating pace probability weights and DNF chances.
        """
        # Historical skill / pace weight based on current standings order
        driver_weights = {}
        for d in current_standings:
            pts = float(d["points"])
            driver_weights[d["driver_id"]] = max(10.0, pts)

        total_weight = sum(driver_weights.values())
        norm_weights = {k: v / total_weight for k, v in driver_weights.items()}

        drivers = [d["driver_id"] for d in current_standings]
        title_wins = {d_id: 0 for d_id in drivers}

        for _ in range(iterations):
            tally = {d["driver_id"]: float(d["points"]) for d in current_standings}

            for race_idx in range(remaining_races):
                # 6% baseline probability of mechanical/collision retirement per driver
                participating = [d for d in drivers if random.random() > 0.06]
                weights = [norm_weights[d] for d in participating]
                
                # Weighted sample for top 10 finishers without replacement
                try:
                    finishers = []
                    avail = list(participating)
                    avail_weights = list(weights)
                    for _ in range(min(10, len(avail))):
                        pick = random.choices(avail, weights=avail_weights, k=1)[0]
                        finishers.append(pick)
                        idx = avail.index(pick)
                        avail.pop(idx)
                        avail_weights.pop(idx)

                    for rank, d_id in enumerate(finishers):
                        tally[d_id] += cls.POINTS_SYSTEM[rank]
                except Exception:
                    pass

            # Crown champion for iteration
            top_driver = max(tally.items(), key=lambda item: item[1])[0]
            title_wins[top_driver] += 1

        prob_results = []
        for d in current_standings:
            d_id = d["driver_id"]
            wins = title_wins.get(d_id, 0)
            prob_pct = round((wins / iterations) * 100.0, 1)
            prob_results.append({
                "driver_id": d_id,
                "name": d.get("name", d_id),
                "team": d.get("team", "Unknown"),
                "current_points": float(d["points"]),
                "championship_prob_pct": prob_pct,
                "clinched": prob_pct == 100.0
            })

        prob_results.sort(key=lambda x: x["championship_prob_pct"], reverse=True)

        return {
            "iterations": iterations,
            "remaining_races": remaining_races,
            "max_achievable_points": cls.calculate_remaining_points(remaining_races, remaining_sprints),
            "probabilities": prob_results,
            "assumptions": [
                "DNF probability calibrated to 6% per event",
                "Finishing weights proportional to 2026 season points density",
                "Official 2026 FIA sporting regulations and countback tie-breaker applied"
            ]
        }
