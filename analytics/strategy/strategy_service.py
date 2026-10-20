import numpy as np
from typing import List, Dict, Any

class StrategyService:
    """Analyzes tyre compound degradation, pit windows, and undercut/overcut strategy."""

    COMPOUND_CHARACTERISTICS = {
        "SOFT": {"base_delta": 0.0, "deg_per_lap": 0.12, "optimal_laps": 18, "color": "#E80020"},
        "MEDIUM": {"base_delta": 0.45, "deg_per_lap": 0.07, "optimal_laps": 28, "color": "#FFF500"},
        "HARD": {"base_delta": 0.95, "deg_per_lap": 0.04, "optimal_laps": 40, "color": "#FFFFFF"},
        "INTERMEDIATE": {"base_delta": 3.5, "deg_per_lap": 0.15, "optimal_laps": 25, "color": "#39B54A"},
        "WET": {"base_delta": 6.8, "deg_per_lap": 0.18, "optimal_laps": 30, "color": "#00AEEF"}
    }

    @classmethod
    def calculate_stint_pace(cls, compound: str, laps: int, base_lap_sec: float = 95.0) -> List[Dict[str, Any]]:
        """Simulates lap-by-lap pace progression for a given tyre compound."""
        comp_info = cls.COMPOUND_CHARACTERISTICS.get(compound.upper(), cls.COMPOUND_CHARACTERISTICS["MEDIUM"])
        pace_data = []
        for lap in range(1, laps + 1):
            # Fuel burn effect: car gets ~0.06s faster per lap as fuel burns off
            fuel_correction = -0.055 * lap
            # Non-linear tyre cliff effect after optimal life
            cliff_factor = 1.0 if lap <= comp_info["optimal_laps"] else 1.0 + 0.15 * (lap - comp_info["optimal_laps"])
            tyre_wear = comp_info["deg_per_lap"] * lap * cliff_factor
            
            lap_time = base_lap_sec + comp_info["base_delta"] + tyre_wear + fuel_correction
            pace_data.append({
                "lap": lap,
                "lap_time_sec": round(lap_time, 3),
                "deg_delta": round(tyre_wear, 3),
                "compound": compound.upper()
            })
        return pace_data

    @classmethod
    def evaluate_undercut_window(
        cls, 
        current_gap_sec: float, 
        lead_car_compound: str, 
        chase_car_compound: str, 
        pit_loss_sec: float = 21.5,
        tyre_age_diff_laps: int = 15
    ) -> Dict[str, Any]:
        """Calculates whether an undercut pit-stop on fresh rubber will overtake the track-position leader."""
        # Fresh out-lap delta: new tyres are roughly 1.4s to 2.2s faster on cold out-lap than worn tyres
        new_tyre_advantage_sec = 1.85
        net_delta = new_tyre_advantage_sec - current_gap_sec

        undercut_success = net_delta > 0.0
        return {
            "current_gap_sec": current_gap_sec,
            "estimated_outlap_gain_sec": round(new_tyre_advantage_sec, 2),
            "projected_gap_after_pit": round(abs(net_delta), 2),
            "undercut_viable": undercut_success,
            "recommended_action": "BOX NOW FOR UNDERCUT" if undercut_success else "EXTEND STINT / SEEK OVERCUT",
            "pit_loss_time_sec": pit_loss_sec
        }
