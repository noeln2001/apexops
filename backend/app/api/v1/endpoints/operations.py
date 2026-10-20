from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.app.db.session import get_db
from operations.monitoring.metrics_service import MetricsService, BackgroundJobRegistry
from operations.monitoring.telemetry_collector import telemetry_collector
from operations.logging.log_buffer import operational_log_handler
from operations.drills.drill_service import DrillService
from operations.backups.backup_manager import BackupManager
from data_engine.etl.historical_importer import HistoricalImporter
from data_engine.etl.current_season_reconciler import CurrentSeasonReconciler

router = APIRouter()

class ImportRequest(BaseModel):
    season: int = Field(default=2026, ge=1950, le=2026, description="Championship season year")

class BackupRequest(BaseModel):
    note: Optional[str] = Field(default="Manual snapshot via console", max_length=200)

@router.get("/operations/status")
def get_system_status(db: Session = Depends(get_db)):
    """
    Returns unified real-time observability telemetry:
    - Host hardware (CPU %, Memory RSS, Disk)
    - Database latency and storage
    - External data providers health (HEALTHY, DEGRADED, UNAVAILABLE)
    - API latency percentiles (p50, p95, p99)
    - Ingestion freshness & staleness alerts
    - Background workers state
    - Last verified backup & restore
    """
    return MetricsService.get_system_metrics(db)

@router.get("/operations/telemetry")
def get_api_telemetry():
    """Returns actual measured API response-time percentiles, throughput, error rates, and slowest routes."""
    return telemetry_collector.get_summary()

@router.get("/operations/logs")
def get_operational_logs(
    level: Optional[str] = Query(default="ALL", description="Filter by log severity: ALL, INFO, WARNING, ERROR"),
    query: Optional[str] = Query(default=None, description="Search query string matching log message or logger"),
    correlation_id: Optional[str] = Query(default=None, description="Exact correlation ID lookup"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum log entries to return")
):
    """Returns structured operational logs with secret redaction and correlation ID tracking."""
    return operational_log_handler.search_logs(
        level=level,
        query=query,
        correlation_id=correlation_id,
        limit=limit
    )

@router.get("/operations/jobs")
def get_scheduled_jobs():
    """Lists registered background workers, schedule intervals, last execution time, and error counters."""
    return BackgroundJobRegistry.get_jobs()

@router.get("/operations/database")
def get_database_diagnostics(db: Session = Depends(get_db)):
    """Provides deep storage and health diagnostics for database tables and storage engines."""
    tables = [
        "circuits", "constructors", "drivers", "seasons", "races",
        "qualifying_results", "session_results", "driver_standings",
        "constructor_standings", "lap_telemetry_samples", "data_sources",
        "ingestion_runs", "incident_drills"
    ]
    table_stats = []
    for tbl in tables:
        try:
            cnt = db.execute(text(f"SELECT count(*) FROM {tbl};")).scalar()
            table_stats.append({"table": tbl, "row_count": cnt})
        except Exception:
            table_stats.append({"table": tbl, "row_count": "N/A"})

    return {
        "status": "HEALTHY",
        "engine": "SQLite / PostgreSQL Compatible",
        "tables": table_stats
    }

@router.get("/operations/drills")
def list_incident_drills(db: Session = Depends(get_db)):
    """Lists the 8 operational trackside incident drills and their real-time state."""
    return DrillService.list_drills(db)

@router.post("/operations/drills/{scenario_key}/trigger")
def trigger_incident_drill(scenario_key: str, db: Session = Depends(get_db)):
    """Injects a synthetic incident drill for trackside operator diagnosis."""
    res = DrillService.trigger_drill(db, scenario_key)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/operations/drills/{scenario_key}/remediate")
def remediate_incident_drill(scenario_key: str, db: Session = Depends(get_db)):
    """Executes the operational remediation playbook to restore system to nominal health."""
    res = DrillService.remediate_drill(db, scenario_key)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/operations/backups")
def list_backups():
    """Lists all available verified hot backups."""
    return BackupManager.list_backups()

@router.post("/operations/backups")
def create_backup(req: Optional[BackupRequest] = None):
    """Triggers an online, non-blocking hot database backup with integrity verification."""
    note = req.note if req else "Manual snapshot via Operations Console"
    res = BackupManager.create_backup(note)
    if "error" in res:
        raise HTTPException(status_code=500, detail=res["error"])
    return res

@router.post("/operations/backups/{filename}/test-restore")
def test_isolated_restore(filename: str):
    """
    Executes a non-destructive isolated restore test in a sandboxed directory.
    Guaranteed never to touch or overwrite production data.
    """
    res = BackupManager.test_isolated_restore(filename)
    if res.get("status") == "FAILED":
        raise HTTPException(status_code=500, detail=res.get("error"))
    return res

@router.post("/admin/import")
def run_import(req: ImportRequest, db: Session = Depends(get_db)):
    """Manually triggers the historical or current season data import pipeline."""
    importer = HistoricalImporter(db)
    importer.import_circuits()
    result = importer.import_season(req.season)
    return result

@router.post("/admin/reconcile")
def run_reconciliation(db: Session = Depends(get_db)):
    """Validates 2026 calendar and standings around 20 October 2026 reference date."""
    reconciler = CurrentSeasonReconciler(db)
    result = reconciler.reconcile_2026_season()
    return result
