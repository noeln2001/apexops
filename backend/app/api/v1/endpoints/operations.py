from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.app.db.session import get_db
from operations.monitoring.metrics_service import MetricsService
from operations.drills.drill_service import DrillService
from operations.backups.backup_manager import BackupManager
from data_engine.etl.historical_importer import HistoricalImporter
from data_engine.etl.current_season_reconciler import CurrentSeasonReconciler

router = APIRouter()

class ImportRequest(BaseModel):
    season: int = 2026

@router.get("/operations/status")
def get_system_status(db: Session = Depends(get_db)):
    """Returns real platform observability metrics, database status, and hardware metrics."""
    return MetricsService.get_system_metrics(db)

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
def create_backup():
    """Triggers an online, non-blocking hot database backup with integrity verification."""
    res = BackupManager.create_backup("Automated snapshot via Operations Console")
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
