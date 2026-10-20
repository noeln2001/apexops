from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class Race(Base):
    __tablename__ = "races"
    race_id = Column(String(50), primary_key=True) # e.g. "2026-17" or "2026_singapore"
    season_year = Column(Integer, ForeignKey("seasons.year"), nullable=False, index=True)
    round = Column(Integer, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    circuit_id = Column(String(50), ForeignKey("circuits.circuit_id"), nullable=False)
    date = Column(String(20), nullable=False)
    time_utc = Column(String(20), nullable=True)
    status = Column(String(30), default="Scheduled") # Scheduled, Confirmed, In progress, Completed, Postponed, Cancelled
    url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    season_rel = relationship("Season", back_populates="races")
    circuit_rel = relationship("Circuit", back_populates="races")
    sessions = relationship("Session", back_populates="race_rel", cascade="all, delete-orphan")
    results = relationship("SessionResult", back_populates="race_rel", cascade="all, delete-orphan")
    qualifying_results = relationship("QualifyingResult", back_populates="race_rel", cascade="all, delete-orphan")
    sprint_results = relationship("SprintResult", back_populates="race_rel", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_race_season_round", "season_year", "round", unique=True),
    )

class Session(Base):
    __tablename__ = "sessions"
    session_id = Column(String(60), primary_key=True) # e.g. "2026-17-race"
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    session_name = Column(String(50), nullable=False) # Practice 1, Qualifying, Sprint, Race
    session_type = Column(String(30), nullable=False) # FP, QUALI, SPRINT, RACE
    scheduled_time_utc = Column(String(30), nullable=True)
    status = Column(String(30), default="Scheduled")

    race_rel = relationship("Race", back_populates="sessions")

class SessionResult(Base):
    __tablename__ = "session_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=False, index=True)
    grid = Column(Integer, default=0)
    position = Column(Integer, nullable=True)
    position_text = Column(String(10), default="DNF") # "1", "2", "R", "D", "W"
    points = Column(Float, default=0.0)
    laps = Column(Integer, default=0)
    status = Column(String(50), default="Finished")
    time_millis = Column(Integer, nullable=True)
    time_str = Column(String(30), nullable=True)
    fastest_lap_rank = Column(Integer, nullable=True)
    fastest_lap_time = Column(String(20), nullable=True)
    fastest_lap_speed = Column(Float, nullable=True)
    discrepancy_flag = Column(Integer, default=0)

    race_rel = relationship("Race", back_populates="results")
    driver_rel = relationship("Driver")
    constructor_rel = relationship("Constructor")

    __table_args__ = (
        Index("idx_result_race_driver", "race_id", "driver_id", unique=True),
    )

class QualifyingResult(Base):
    __tablename__ = "qualifying_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=False)
    position = Column(Integer, nullable=False)
    q1 = Column(String(20), nullable=True)
    q2 = Column(String(20), nullable=True)
    q3 = Column(String(20), nullable=True)

    race_rel = relationship("Race", back_populates="qualifying_results")
    driver_rel = relationship("Driver")
    constructor_rel = relationship("Constructor")

class SprintResult(Base):
    __tablename__ = "sprint_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=False)
    grid = Column(Integer, default=0)
    position = Column(Integer, nullable=True)
    points = Column(Float, default=0.0)
    laps = Column(Integer, default=0)
    status = Column(String(50), default="Finished")
    time_str = Column(String(30), nullable=True)

    race_rel = relationship("Race", back_populates="sprint_results")

class DriverStanding(Base):
    __tablename__ = "driver_standings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    season_year = Column(Integer, ForeignKey("seasons.year"), nullable=False, index=True)
    round = Column(Integer, nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False, index=True)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=True)
    points = Column(Float, nullable=False, default=0.0)
    position = Column(Integer, nullable=False)
    wins = Column(Integer, nullable=False, default=0)

    season_rel = relationship("Season", back_populates="driver_standings")
    driver_rel = relationship("Driver")
    constructor_rel = relationship("Constructor")

    __table_args__ = (
        Index("idx_driver_standings_season_round_driver", "season_year", "round", "driver_id", unique=True),
    )

class ConstructorStanding(Base):
    __tablename__ = "constructor_standings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    season_year = Column(Integer, ForeignKey("seasons.year"), nullable=False, index=True)
    round = Column(Integer, nullable=False, index=True)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=False, index=True)
    points = Column(Float, nullable=False, default=0.0)
    position = Column(Integer, nullable=False)
    wins = Column(Integer, nullable=False, default=0)

    season_rel = relationship("Season", back_populates="constructor_standings")
    constructor_rel = relationship("Constructor")

    __table_args__ = (
        Index("idx_constructor_standings_season_round_team", "season_year", "round", "constructor_id", unique=True),
    )
