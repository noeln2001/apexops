from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime
from datetime import datetime, timezone
from backend.app.db.session import Base

class DataSource(Base):
    __tablename__ = "data_sources"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    type = Column(String(30), default="REST_API") # REST_API, PYTHON_LIB, RSS
    endpoint_url = Column(String(255), nullable=True)
    health_status = Column(String(20), default="HEALTHY") # HEALTHY, DEGRADED, DOWN
    last_ping_ms = Column(Float, default=0.0)
    last_success_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    consecutive_failures = Column(Integer, default=0)

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_name = Column(String(50), nullable=False)
    dataset_name = Column(String(100), nullable=False)
    status = Column(String(20), default="RUNNING") # RUNNING, SUCCESS, FAILED
    records_processed = Column(Integer, default=0)
    duration_sec = Column(Float, default=0.0)
    error_log = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

class DataQualityIssue(Base):
    __tablename__ = "data_quality_issues"
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_name = Column(String(50), nullable=False)
    table_name = Column(String(50), nullable=False)
    record_id = Column(String(100), nullable=False)
    issue_type = Column(String(50), nullable=False) # MISSING_FIELD, OUTLIER, DISCREPANCY, TIMEOUT
    description = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved = Column(Boolean, default=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String(100), default="system")
    action = Column(String(100), nullable=False) # e.g. "RUN_HISTORICAL_IMPORT", "TRIGGER_INCIDENT_DRILL"
    resource = Column(String(100), nullable=False)
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class IncidentDrill(Base):
    __tablename__ = "incident_drills"
    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_key = Column(String(50), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False) # INFRASTRUCTURE, INGESTION, DATABASE, LATENCY
    description = Column(Text, nullable=False)
    status = Column(String(20), default="IDLE") # IDLE, ACTIVE, RESOLVED
    injected_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    logs_output = Column(Text, nullable=True)
    remediation_steps = Column(Text, nullable=False)
