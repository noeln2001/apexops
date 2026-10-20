from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class Season(Base):
    __tablename__ = "seasons"
    year = Column(Integer, primary_key=True)
    championship_type = Column(String(50), default="FIA Formula One World Championship")
    regulations_summary = Column(Text, nullable=True)
    rounds_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    races = relationship("Race", back_populates="season_rel")
    driver_standings = relationship("DriverStanding", back_populates="season_rel")
    constructor_standings = relationship("ConstructorStanding", back_populates="season_rel")

class ChampionshipRule(Base):
    __tablename__ = "championship_rules"
    id = Column(Integer, primary_key=True, autoincrement=True)
    season_year = Column(Integer, ForeignKey("seasons.year"), nullable=False)
    win_points = Column(Integer, default=25)
    sprint_enabled = Column(Boolean, default=True)
    fastest_lap_point = Column(Boolean, default=True)
    scoring_system_json = Column(Text, nullable=True) # Full points map e.g. [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
    tie_break_rule = Column(String(100), default="Most wins, then highest finishes")

class Circuit(Base):
    __tablename__ = "circuits"
    circuit_id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    location = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    timezone = Column(String(50), default="UTC")
    length_km = Column(Float, nullable=True)
    turns = Column(Integer, nullable=True)
    drs_zones = Column(Integer, default=2)
    lap_record_time = Column(String(20), nullable=True)
    lap_record_driver = Column(String(100), nullable=True)
    lap_record_year = Column(Integer, nullable=True)
    url = Column(String(255), nullable=True)

    races = relationship("Race", back_populates="circuit_rel")
    layouts = relationship("CircuitLayout", back_populates="circuit_rel")

class CircuitLayout(Base):
    __tablename__ = "circuit_layouts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    circuit_id = Column(String(50), ForeignKey("circuits.circuit_id"), nullable=False)
    configuration_name = Column(String(100), default="Grand Prix Circuit")
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    length_km = Column(Float, nullable=True)
    geometry_json = Column(Text, nullable=True)

    circuit_rel = relationship("Circuit", back_populates="layouts")

class Constructor(Base):
    __tablename__ = "constructors"
    constructor_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    nationality = Column(String(50), nullable=True)
    color_hex = Column(String(10), default="#E10600")
    power_unit = Column(String(50), nullable=True)
    url = Column(String(255), nullable=True)
    total_wins = Column(Integer, default=0)
    total_podiums = Column(Integer, default=0)
    total_poles = Column(Integer, default=0)
    total_championships = Column(Integer, default=0)

    driver_assignments = relationship("DriverTeamAssignment", back_populates="constructor_rel")

class Driver(Base):
    __tablename__ = "drivers"
    driver_id = Column(String(50), primary_key=True)
    code = Column(String(10), nullable=True, index=True)
    permanent_number = Column(Integer, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    nationality = Column(String(50), nullable=True)
    dob = Column(String(20), nullable=True)
    url = Column(String(255), nullable=True)
    total_wins = Column(Integer, default=0)
    total_podiums = Column(Integer, default=0)
    total_poles = Column(Integer, default=0)
    total_championships = Column(Integer, default=0)

    team_assignments = relationship("DriverTeamAssignment", back_populates="driver_rel")

class DriverTeamAssignment(Base):
    __tablename__ = "driver_team_assignments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False)
    constructor_id = Column(String(50), ForeignKey("constructors.constructor_id"), nullable=False)
    season_year = Column(Integer, ForeignKey("seasons.year"), nullable=False)
    is_primary = Column(Boolean, default=True)

    driver_rel = relationship("Driver", back_populates="team_assignments")
    constructor_rel = relationship("Constructor", back_populates="driver_assignments")
