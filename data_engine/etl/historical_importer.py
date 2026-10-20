import time
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.models.f1_core import Season, ChampionshipRule, Circuit, Constructor, Driver, DriverTeamAssignment
from backend.app.models.f1_events import Race, Session as F1Session, SessionResult, QualifyingResult, SprintResult, DriverStanding, ConstructorStanding
from backend.app.models.operations import IngestionRun, DataQualityIssue, DataSource
from data_engine.adapters.jolpica_adapter import JolpicaAdapter

logger = logging.getLogger("apexops.etl.importer")

class HistoricalImporter:
    """Idempotent historical and current season ETL importer."""

    def __init__(self, db: Session):
        self.db = db
        self.adapter = JolpicaAdapter()

    def import_circuits(self) -> int:
        """Fetch and populate historical circuits."""
        circuits_data = self.adapter.fetch_circuits()
        count = 0
        for c in circuits_data:
            circuit_id = c.get("circuitId")
            if not circuit_id:
                continue
            existing = self.db.query(Circuit).filter(Circuit.circuit_id == circuit_id).first()
            if not existing:
                loc = c.get("Location", {})
                new_c = Circuit(
                    circuit_id=circuit_id,
                    name=c.get("circuitName", "Unknown Circuit"),
                    location=loc.get("locality", "Unknown Locality"),
                    country=loc.get("country", "Unknown Country"),
                    lat=float(loc.get("lat")) if loc.get("lat") else None,
                    lng=float(loc.get("long")) if loc.get("long") else None,
                    url=c.get("url")
                )
                self.db.add(new_c)
                count += 1
        self.db.commit()
        logger.info(f"Imported {count} new circuits.")
        return count

    def import_season(self, year: int) -> Dict[str, Any]:
        """Imports or refreshes an entire championship season idempotently."""
        start_time = time.time()
        logger.info(f"Starting import for season {year}...")
        
        # 1. Season record
        season = self.db.query(Season).filter(Season.year == year).first()
        if not season:
            season = Season(year=year, rounds_count=0)
            self.db.add(season)
            self.db.commit()
            # Default modern championship rule
            rule = ChampionshipRule(
                season_year=year,
                win_points=25,
                sprint_enabled=True if year >= 2021 else False,
                fastest_lap_point=True if (2019 <= year <= 2024) else False,
                scoring_system_json="[25, 18, 15, 12, 10, 8, 6, 4, 2, 1]"
            )
            self.db.add(rule)
            self.db.commit()

        # 2. Calendar / Races
        calendar_races = self.adapter.fetch_calendar(year)
        ref_date = settings.REFERENCE_DATE # "2026-10-20"
        
        races_imported = 0
        results_imported = 0
        
        for r in calendar_races:
            round_num = int(r.get("round", 1))
            race_id = f"{year}-{round_num:02d}"
            race_name = r.get("raceName", f"Round {round_num}")
            date_str = r.get("date", "2026-01-01")
            time_str = r.get("time", "14:00:00Z")
            
            circuit_data = r.get("Circuit", {})
            circuit_id = circuit_data.get("circuitId", "unknown")
            
            # Ensure circuit exists
            if not self.db.query(Circuit).filter(Circuit.circuit_id == circuit_id).first():
                loc = circuit_data.get("Location", {})
                self.db.add(Circuit(
                    circuit_id=circuit_id,
                    name=circuit_data.get("circuitName", race_name),
                    location=loc.get("locality", "Unknown"),
                    country=loc.get("country", "Unknown"),
                    lat=float(loc.get("lat")) if loc.get("lat") else None,
                    lng=float(loc.get("long")) if loc.get("long") else None
                ))
                self.db.commit()

            # Status determination based on Reference Date (2026-10-20)
            if date_str < ref_date:
                status = "Completed"
            elif date_str == ref_date:
                status = "In progress"
            elif round_num == 18 and "United States" in race_name:
                status = "Confirmed" # Validated Austin GP scheduled for 23-25 October 2026
            else:
                status = "Scheduled"

            existing_race = self.db.query(Race).filter(Race.race_id == race_id).first()
            if not existing_race:
                race_obj = Race(
                    race_id=race_id,
                    season_year=year,
                    round=round_num,
                    name=race_name,
                    circuit_id=circuit_id,
                    date=date_str,
                    time_utc=time_str,
                    status=status,
                    url=r.get("url")
                )
                self.db.add(race_obj)
                races_imported += 1
            else:
                existing_race.status = status
                race_obj = existing_race
            self.db.commit()

            # 3. If race is completed, fetch classifications
            if status == "Completed":
                res_data = self.adapter.fetch_race_results(year, round_num)
                if res_data and "Results" in res_data:
                    for res in res_data["Results"]:
                        driver_info = res.get("Driver", {})
                        constructor_info = res.get("Constructor", {})
                        
                        d_id = driver_info.get("driverId")
                        c_id = constructor_info.get("constructorId")
                        if not d_id or not c_id:
                            continue

                        # Ensure Driver exists
                        if not self.db.query(Driver).filter(Driver.driver_id == d_id).first():
                            self.db.add(Driver(
                                driver_id=d_id,
                                code=driver_info.get("code"),
                                permanent_number=int(driver_info.get("permanentNumber")) if driver_info.get("permanentNumber") else None,
                                first_name=driver_info.get("givenName", ""),
                                last_name=driver_info.get("familyName", ""),
                                nationality=driver_info.get("nationality"),
                                dob=driver_info.get("dateOfBirth"),
                                url=driver_info.get("url")
                            ))
                            self.db.commit()

                        # Ensure Constructor exists
                        if not self.db.query(Constructor).filter(Constructor.constructor_id == c_id).first():
                            # Assign iconic motorsport team colors
                            team_colors = {
                                "red_bull": "#3671C6", "mclaren": "#FF8000", "ferrari": "#E80020",
                                "mercedes": "#27F4D2", "aston_martin": "#229971", "alpine": "#0093CC",
                                "williams": "#64C4FF", "rb": "#6692FF", "sauber": "#52E252", "haas": "#B6BABD"
                            }
                            self.db.add(Constructor(
                                constructor_id=c_id,
                                name=constructor_info.get("name", c_id),
                                nationality=constructor_info.get("nationality"),
                                color_hex=team_colors.get(c_id, "#E10600"),
                                url=constructor_info.get("url")
                            ))
                            self.db.commit()

                        # Driver-team mapping
                        if not self.db.query(DriverTeamAssignment).filter(
                            DriverTeamAssignment.driver_id == d_id,
                            DriverTeamAssignment.constructor_id == c_id,
                            DriverTeamAssignment.season_year == year
                        ).first():
                            self.db.add(DriverTeamAssignment(driver_id=d_id, constructor_id=c_id, season_year=year))
                            self.db.commit()

                        # Insert or update result
                        pos = int(res.get("position")) if res.get("position", "").isdigit() else None
                        points = float(res.get("points", 0.0))
                        grid = int(res.get("grid", 0)) if str(res.get("grid", "0")).isdigit() else 0
                        laps = int(res.get("laps", 0)) if str(res.get("laps", "0")).isdigit() else 0
                        time_obj = res.get("Time", {})
                        time_millis = int(time_obj.get("millis")) if time_obj.get("millis") else None
                        fastest_lap = res.get("FastestLap", {})
                        
                        existing_result = self.db.query(SessionResult).filter(
                            SessionResult.race_id == race_id,
                            SessionResult.driver_id == d_id
                        ).first()

                        if not existing_result:
                            self.db.add(SessionResult(
                                race_id=race_id,
                                driver_id=d_id,
                                constructor_id=c_id,
                                grid=grid,
                                position=pos,
                                position_text=res.get("positionText", "DNF"),
                                points=points,
                                laps=laps,
                                status=res.get("status", "Finished"),
                                time_millis=time_millis,
                                time_str=time_obj.get("time"),
                                fastest_lap_rank=int(fastest_lap.get("rank")) if fastest_lap.get("rank") else None,
                                fastest_lap_time=fastest_lap.get("Time", {}).get("time") if fastest_lap.get("Time") else None
                            ))
                            results_imported += 1
                    self.db.commit()

        # Update season rounds count
        season.rounds_count = len(calendar_races)
        self.db.commit()

        # 4. Import Driver Standings
        driver_standings_data = self.adapter.fetch_driver_standings(year)
        latest_completed_round = max([r.round for r in self.db.query(Race).filter(Race.season_year == year, Race.status == "Completed").all()] or [0])
        
        for ds in driver_standings_data:
            d_id = ds.get("Driver", {}).get("driverId")
            constructors = ds.get("Constructors", [])
            c_id = constructors[0].get("constructorId") if constructors else None
            if not d_id:
                continue

            existing_ds = self.db.query(DriverStanding).filter(
                DriverStanding.season_year == year,
                DriverStanding.round == latest_completed_round,
                DriverStanding.driver_id == d_id
            ).first()

            if not existing_ds:
                self.db.add(DriverStanding(
                    season_year=year,
                    round=latest_completed_round,
                    driver_id=d_id,
                    constructor_id=c_id,
                    points=float(ds.get("points", 0.0)),
                    position=int(ds.get("position", 1)),
                    wins=int(ds.get("wins", 0))
                ))
        self.db.commit()

        # 5. Import Constructor Standings
        constructor_standings_data = self.adapter.fetch_constructor_standings(year)
        for cs in constructor_standings_data:
            c_id = cs.get("Constructor", {}).get("constructorId")
            if not c_id:
                continue
            existing_cs = self.db.query(ConstructorStanding).filter(
                ConstructorStanding.season_year == year,
                ConstructorStanding.round == latest_completed_round,
                ConstructorStanding.constructor_id == c_id
            ).first()

            if not existing_cs:
                self.db.add(ConstructorStanding(
                    season_year=year,
                    round=latest_completed_round,
                    constructor_id=c_id,
                    points=float(cs.get("points", 0.0)),
                    position=int(cs.get("position", 1)),
                    wins=int(cs.get("wins", 0))
                ))
        self.db.commit()

        duration = time.time() - start_time
        logger.info(f"Import for season {year} finished in {duration:.2f}s. Races: {len(calendar_races)}, Results: {results_imported}.")
        
        # Log Ingestion Run
        ingest_run = IngestionRun(
            source_name="Jolpica",
            dataset_name=f"Season {year}",
            status="SUCCESS",
            records_processed=len(calendar_races) + results_imported,
            duration_sec=duration,
            completed_at=datetime.utcnow()
        )
        self.db.add(ingest_run)
        self.db.commit()

        return {
            "year": year,
            "rounds_found": len(calendar_races),
            "results_imported": results_imported,
            "duration_sec": round(duration, 2)
        }
