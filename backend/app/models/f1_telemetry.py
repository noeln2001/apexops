from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Index, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class LapTime(Base):
    __tablename__ = "lap_times"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    lap_number = Column(Integer, nullable=False)
    lap_time_str = Column(String(20), nullable=False)
    lap_time_sec = Column(Float, nullable=False)
    s1_sec = Column(Float, nullable=True)
    s2_sec = Column(Float, nullable=True)
    s3_sec = Column(Float, nullable=True)
    position = Column(Integer, nullable=True)
    is_personal_best = Column(Boolean, default=False)
    is_track_best = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_lap_race_driver_lap", "race_id", "driver_id", "lap_number"),
    )

class PitStop(Base):
    __tablename__ = "pit_stops"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    stop_number = Column(Integer, nullable=False)
    lap = Column(Integer, nullable=False)
    time_str = Column(String(20), nullable=True)
    duration_sec = Column(Float, nullable=False)

    __table_args__ = (
        Index("idx_pit_race_driver_stop", "race_id", "driver_id", "stop_number"),
    )

class TyreStint(Base):
    __tablename__ = "tyre_stints"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    stint_number = Column(Integer, nullable=False)
    compound = Column(String(20), nullable=False) # SOFT, MEDIUM, HARD, INTERMEDIATE, WET
    start_lap = Column(Integer, nullable=False)
    end_lap = Column(Integer, nullable=False)
    laps_on_tyre = Column(Integer, nullable=False)
    avg_lap_sec = Column(Float, nullable=True)

class TelemetrySample(Base):
    __tablename__ = "telemetry_samples"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(60), ForeignKey("sessions.session_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    lap_number = Column(Integer, nullable=False)
    distance_m = Column(Float, nullable=False)
    speed_kmh = Column(Float, nullable=False)
    throttle_pct = Column(Float, nullable=False)
    brake_bool = Column(Boolean, default=False)
    gear = Column(Integer, nullable=False)
    rpm = Column(Integer, nullable=False)
    drs_status = Column(Integer, default=0) # 0=Off, 1=Available, 2=Active

    __table_args__ = (
        Index("idx_telem_session_driver_lap", "session_id", "driver_id", "lap_number"),
    )

from datetime import datetime, timezone

class WeatherSample(Base):
    __tablename__ = "weather_samples"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(60), ForeignKey("sessions.session_id"), nullable=False, index=True)
    timestamp_utc = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    air_temp_c = Column(Float, nullable=False)
    track_temp_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    pressure_mbar = Column(Float, nullable=True)
    wind_speed_ms = Column(Float, nullable=True)
    rainfall_bool = Column(Boolean, default=False)
