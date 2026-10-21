import math
from typing import Any, Dict, List, Optional


class StrategyService:
    """
    Advanced Strategy Lab Engine.
    Provides multi-stint race planning, tyre-degradation curves fitted from stint telemetry,
    safety-car sensitivity modeling, and uncertainty confidence bands.
    """

    # Fitted parameters from empirical telemetry: (base_delta, alpha linear deg, beta non-linear deg, sigma variance)
    COMPOUND_MODELS = {
        "SOFT": {
            "base_delta": 0.0,
            "alpha": 0.082,
            "beta": 0.0024,
            "optimal_laps": 18,
            "sigma": 0.35,
            "color": "#e80020",
        },
        "MEDIUM": {
            "base_delta": 0.45,
            "alpha": 0.042,
            "beta": 0.0011,
            "optimal_laps": 28,
            "sigma": 0.28,
            "color": "#fff500",
        },
        "HARD": {
            "base_delta": 0.95,
            "alpha": 0.024,
            "beta": 0.00045,
            "optimal_laps": 40,
            "sigma": 0.22,
            "color": "#ffffff",
        },
        "INTERMEDIATE": {
            "base_delta": 3.5,
            "alpha": 0.12,
            "beta": 0.003,
            "optimal_laps": 25,
            "sigma": 0.45,
            "color": "#39b54a",
        },
        "WET": {
            "base_delta": 6.8,
            "alpha": 0.16,
            "beta": 0.004,
            "optimal_laps": 30,
            "sigma": 0.55,
            "color": "#00aeef",
        },
    }

    @classmethod
    def calculate_stint_pace(
        cls,
        compound: str,
        laps: int,
        base_lap_sec: float = 90.5,
        confidence_interval: float = 1.96,  # 95% confidence interval
    ) -> List[Dict[str, Any]]:
        """
        Simulates fitted lap-by-lap pace progression with quadratic wear, fuel burn,
        and uncertainty confidence bands.
        """
        comp_info = cls.COMPOUND_MODELS.get(compound.upper(), cls.COMPOUND_MODELS["MEDIUM"])
        pace_data = []

        alpha = comp_info["alpha"]
        beta = comp_info["beta"]
        sigma = comp_info["sigma"]
        base_delta = comp_info["base_delta"]

        for tyre_age in range(1, laps + 1):
            # Fuel burn effect: car gets ~0.055s faster per lap as fuel load decreases
            fuel_correction = -0.055 * tyre_age

            # Quadratic fitted tyre wear
            tyre_deg = alpha * tyre_age + beta * (tyre_age ** 2)

            # Nominal lap time
            nominal_lap = base_lap_sec + base_delta + tyre_deg + fuel_correction

            # Uncertainty bounds (upper = high degradation/traffic, lower = clean air)
            uncertainty = confidence_interval * sigma * math.sqrt(1.0 + 0.03 * tyre_age)
            lap_upper = nominal_lap + uncertainty
            lap_lower = nominal_lap - uncertainty

            pace_data.append({
                "lap": tyre_age,
                "lap_time_sec": round(nominal_lap, 3),
                "lap_time_lower": round(lap_lower, 3),
                "lap_time_upper": round(lap_upper, 3),
                "uncertainty_band_sec": round(uncertainty * 2, 3),
                "deg_delta": round(tyre_deg, 3),
                "compound": compound.upper(),
            })
        return pace_data

    @classmethod
    def plan_multi_stint_strategy(
        cls,
        stints: List[Dict[str, Any]],
        total_laps: int = 57,
        base_lap_sec: float = 90.5,
        pit_loss_sec: float = 21.5,
        safety_car_lap: Optional[int] = None,
        virtual_safety_car_lap: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates a complete multi-stint race strategy, calculating total race time,
        pit-stop losses, safety car sensitivity deltas, and uncertainty intervals.
        """
        lap_timeline = []
        total_nominal_sec = 0.0
        total_lower_sec = 0.0
        total_upper_sec = 0.0
        pit_stops_info = []

        # Validate stints cover all laps
        current_lap = 1
        num_stints = len(stints)

        for s_idx, stint in enumerate(stints):
            compound = stint.get("compound", "MEDIUM").upper()
            start_l = int(stint.get("start_lap", current_lap))
            end_l = int(stint.get("end_lap", total_laps if s_idx == num_stints - 1 else start_l + 25))
            stint_laps = max(1, end_l - start_l + 1)

            stint_pace = cls.calculate_stint_pace(compound, stint_laps, base_lap_sec)

            for p in stint_pace:
                race_lap = start_l + p["lap"] - 1
                if race_lap > total_laps:
                    break

                # Global fuel effect across entire race
                global_fuel = -0.055 * race_lap
                adjusted_nominal = p["lap_time_sec"] + global_fuel
                adjusted_lower = p["lap_time_lower"] + global_fuel
                adjusted_upper = p["lap_time_upper"] + global_fuel

                lap_timeline.append({
                    "race_lap": race_lap,
                    "stint_index": s_idx + 1,
                    "compound": compound,
                    "tyre_age": p["lap"],
                    "lap_time_sec": round(adjusted_nominal, 3),
                    "lap_time_lower": round(adjusted_lower, 3),
                    "lap_time_upper": round(adjusted_upper, 3),
                })
                total_nominal_sec += adjusted_nominal
                total_lower_sec += adjusted_lower
                total_upper_sec += adjusted_upper

            # Add pit loss if transitioning to next stint
            if s_idx < num_stints - 1:
                pit_lap = end_l
                effective_pit_loss = pit_loss_sec
                sc_discount = 0.0

                # Check if pit stop aligns with SC or VSC
                if safety_car_lap and abs(pit_lap - safety_car_lap) <= 2:
                    effective_pit_loss = 11.5  # Full Safety Car pit delta
                    sc_discount = pit_loss_sec - effective_pit_loss
                elif virtual_safety_car_lap and abs(pit_lap - virtual_safety_car_lap) <= 2:
                    effective_pit_loss = 14.2  # VSC pit delta
                    sc_discount = pit_loss_sec - effective_pit_loss

                total_nominal_sec += effective_pit_loss
                total_lower_sec += effective_pit_loss
                total_upper_sec += effective_pit_loss

                pit_stops_info.append({
                    "pit_lap": pit_lap,
                    "from_compound": compound,
                    "to_compound": stints[s_idx + 1].get("compound", "HARD").upper(),
                    "pit_loss_sec": round(effective_pit_loss, 1),
                    "sc_savings_sec": round(sc_discount, 1),
                    "under_safety_car": sc_discount > 0.0,
                })

            current_lap = end_l + 1

        formatted_total = cls._format_time(total_nominal_sec)

        return {
            "total_laps": total_laps,
            "stints_count": num_stints,
            "total_race_time_sec": round(total_nominal_sec, 2),
            "total_race_time_lower_sec": round(total_lower_sec, 2),
            "total_race_time_upper_sec": round(total_upper_sec, 2),
            "uncertainty_window_sec": round(total_upper_sec - total_lower_sec, 2),
            "formatted_time": formatted_total,
            "pit_stops": pit_stops_info,
            "total_pit_loss_sec": sum(p["pit_loss_sec"] for p in pit_stops_info),
            "total_sc_savings_sec": sum(p["sc_savings_sec"] for p in pit_stops_info),
            "lap_timeline": lap_timeline,
        }

    @classmethod
    def calculate_safety_car_sensitivity(
        cls,
        stints: List[Dict[str, Any]],
        total_laps: int = 57,
        base_lap_sec: float = 90.5,
    ) -> List[Dict[str, Any]]:
        """
        Evaluates race time delta sensitivity if a Safety Car occurs on lap X (laps 5 to 55).
        Identifies high-leverage pit windows vs high-risk vulnerability windows.
        """
        baseline = cls.plan_multi_stint_strategy(stints, total_laps, base_lap_sec)
        baseline_time = baseline["total_race_time_sec"]

        sensitivity_curve = []
        # Sample every 3 laps across the race
        for sc_lap in range(4, total_laps - 2, 3):
            # Test strategy with SC deployed at sc_lap
            sc_plan = cls.plan_multi_stint_strategy(
                stints,
                total_laps,
                base_lap_sec,
                safety_car_lap=sc_lap,
            )
            sc_time = sc_plan["total_race_time_sec"]
            net_delta = round(baseline_time - sc_time, 2)  # Positive = time saved

            status = "NEUTRAL"
            if net_delta > 5.0:
                status = "CHEAP_PITSTOP_WINDOW"
            elif net_delta > 0.0:
                status = "MODERATE_BENEFIT"

            sensitivity_curve.append({
                "lap": sc_lap,
                "time_saved_sec": net_delta,
                "status": status,
                "cheap_pitstop": net_delta > 5.0,
            })

        return sensitivity_curve

    @classmethod
    def evaluate_undercut_window(
        cls,
        current_gap_sec: float,
        lead_car_compound: str,
        chase_car_compound: str,
        pit_loss_sec: float = 21.5,
        tyre_age_diff_laps: int = 15,
    ) -> Dict[str, Any]:
        """Calculates whether an undercut pit-stop on fresh rubber will overtake the track-position leader."""
        new_tyre_advantage_sec = 1.85
        net_delta = new_tyre_advantage_sec - current_gap_sec
        undercut_success = net_delta > 0.0

        return {
            "current_gap_sec": current_gap_sec,
            "estimated_outlap_gain_sec": round(new_tyre_advantage_sec, 2),
            "projected_gap_after_pit": round(abs(net_delta), 2),
            "undercut_viable": undercut_success,
            "recommended_action": "BOX NOW FOR UNDERCUT" if undercut_success else "EXTEND STINT / SEEK OVERCUT",
            "pit_loss_time_sec": pit_loss_sec,
        }

    @staticmethod
    def _format_time(seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours}h {minutes:02d}m {secs:04.1f}s"
