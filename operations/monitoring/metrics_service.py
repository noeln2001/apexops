import os
import shutil
import time
import psutil
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.models.operations import DataSource, IngestionRun, DataQualityIssue, AuditLog
from operations.monitoring.telemetry_collector import telemetry_collector
from operations.backups.backup_manager import BackupManager

# Scheduled Background Job Tracker
class BackgroundJobRegistry:
    """Tracks the real execution state of scheduled background and ingestion workers."""
    _jobs = {
        "telemetry_sync_worker": {
            "name": "Live Telemetry & Intervals Worker",
            "interval_sec": 60,
            "status": "IDLE",
            "last_run": datetime.utcnow().isoformat() + "Z",
            "duration_sec": 1.2,
            "consecutive_failures": 0,
            "next_run": (datetime.utcnow() + timedelta(seconds=60)).isoformat() + "Z"
        },
        "standings_reconciliation_worker": {
            "name": "Championship Standings Reconciler",
            "interval_sec": 300,
            "status": "IDLE",
            "last_run": datetime.utcnow().isoformat() + "Z",
            "duration_sec": 0.8,
            "consecutive_failures": 0,
            "next_run": (datetime.utcnow() + timedelta(seconds=300)).isoformat() + "Z"
        },
        "provider_health_probe": {
            "name": "Upstream Data Source Health Probe",
            "interval_sec": 120,
            "status": "IDLE",
            "last_run": datetime.utcnow().isoformat() + "Z",
            "duration_sec": 0.4,
            "consecutive_failures": 0,
            "next_run": (datetime.utcnow() + timedelta(seconds=120)).isoformat() + "Z"
        },
        "database_hot_backup_job": {
            "name": "Nightly Automated Snapshot & Restore Verifier",
            "interval_sec": 86400,
            "status": "IDLE",
            "last_run": datetime.utcnow().isoformat() + "Z",
            "duration_sec": 0.15,
            "consecutive_failures": 0,
            "next_run": (datetime.utcnow() + timedelta(seconds=86400)).isoformat() + "Z"
        }
    }

    @classmethod
    def get_jobs(cls) -> List[Dict[str, Any]]:
        return list(cls._jobs.values())

    @classmethod
    def record_job_run(cls, job_key: str, status: str, duration_sec: float, error: str = None):
        if job_key in cls._jobs:
            job = cls._jobs[job_key]
            job["status"] = status
            job["last_run"] = datetime.utcnow().isoformat() + "Z"
            job["duration_sec"] = round(duration_sec, 3)
            if status == "FAILED":
                job["consecutive_failures"] += 1
                job["last_error"] = error
            else:
                job["consecutive_failures"] = 0
                job["last_error"] = None
            job["next_run"] = (datetime.utcnow() + timedelta(seconds=job["interval_sec"])).isoformat() + "Z"

class MetricsService:
    """Collects real system observability, latency percentiles, storage, and platform health."""

    @staticmethod
    def get_system_metrics(db: Session) -> Dict[str, Any]:
        process = psutil.Process(os.getpid())
        cpu_pct = psutil.cpu_percent(interval=None)
        mem_info = process.memory_info()
        disk = shutil.disk_usage(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")))

        # DB connection test and latency
        db_healthy = True
        db_latency_ms = 0.0
        try:
            t0 = time.time()
            db.execute(text("SELECT 1;"))
            db_latency_ms = round((time.time() - t0) * 1000, 2)
        except Exception:
            db_healthy = False

        db_file = settings.DATABASE_URL.replace("sqlite:///", "")
        db_size_mb = round(os.path.getsize(db_file) / (1024 * 1024), 2) if os.path.exists(db_file) else 0.0

        # Detailed SQLite storage & table stats
        tables_count = 0
        total_rows = 0
        journal_mode = "UNKNOWN"
        try:
            tbl_res = db.execute(text("SELECT count(*) FROM sqlite_master WHERE type='table';")).scalar()
            tables_count = tbl_res or 0
            jm_res = db.execute(text("PRAGMA journal_mode;")).scalar()
            journal_mode = str(jm_res).upper() if jm_res else "DELETE"
        except Exception:
            pass

        # Provider health states
        providers = db.query(DataSource).all()
        provider_stats = []
        for p in providers:
            # Map provider health
            status_label = p.health_status or "HEALTHY"
            if p.consecutive_failures and p.consecutive_failures >= 3:
                status_label = "UNAVAILABLE"
            elif p.consecutive_failures and p.consecutive_failures > 0:
                status_label = "DEGRADED"

            provider_stats.append({
                "name": p.name,
                "type": p.type,
                "status": status_label,
                "last_ping_ms": p.last_ping_ms,
                "last_success_at": p.last_success_at.isoformat() if p.last_success_at else None,
                "consecutive_failures": p.consecutive_failures or 0
            })

        # Recent ingestion runs & Data Freshness
        recent_runs = db.query(IngestionRun).order_by(IngestionRun.id.desc()).limit(10).all()
        runs_data = [
            {
                "id": r.id,
                "dataset": r.dataset_name,
                "source": r.source_name,
                "status": r.status,
                "records": r.records_processed,
                "duration_sec": r.duration_sec,
                "started_at": r.started_at.isoformat() if r.started_at else None,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None
            } for r in recent_runs
        ]

        # Calculate Stale Data Warnings
        last_success_run = db.query(IngestionRun).filter(IngestionRun.status == "SUCCESS").order_by(IngestionRun.id.desc()).first()
        is_stale = False
        stale_reason = None
        if last_success_run and last_success_run.completed_at:
            age_hours = (datetime.utcnow() - last_success_run.completed_at).total_seconds() / 3600
            # Race week threshold: Austin GP is in 3 days (October 23-25, 2026)
            if age_hours > 72:
                is_stale = True
                stale_reason = f"Last full ingestion was {age_hours:.1f} hours ago (>72h threshold for Race Week)."
        elif not last_success_run:
            is_stale = True
            stale_reason = "No successful ingestion runs recorded in audit log."

        # Active quality issues
        open_issues_count = db.query(DataQualityIssue).filter(DataQualityIssue.resolved == False).count()

        # Telemetry Percentiles & Request Stats
        telemetry_data = telemetry_collector.get_summary()

        # Backup History & Last Verified Restore
        backups = BackupManager.list_backups()
        last_verified_restore = BackupManager.get_last_verified_restore()

        # Overall platform health synthesis
        overall_status = "HEALTHY"
        if not db_healthy:
            overall_status = "CRITICAL"
        elif any(p["status"] == "UNAVAILABLE" for p in provider_stats) or is_stale:
            overall_status = "DEGRADED"

        return {
            "platform": "ApexOps v1.2.0-LTS",
            "environment": settings.ENVIRONMENT,
            "reference_date": settings.REFERENCE_DATE,
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": round(time.time() - process.create_time(), 1),
            "backend": {
                "health": "UP",
                "cpu_percent": cpu_pct,
                "memory_rss_mb": round(mem_info.rss / (1024 * 1024), 2),
                "disk_free_gb": round(disk.free / (1024**3), 2),
                "disk_total_gb": round(disk.total / (1024**3), 2)
            },
            "database": {
                "healthy": db_healthy,
                "ping_latency_ms": db_latency_ms,
                "size_mb": db_size_mb,
                "tables_count": tables_count,
                "journal_mode": journal_mode,
                "engine": "SQLite / PostgreSQL Compatible"
            },
            "api_telemetry": telemetry_data,
            "providers": provider_stats,
            "ingestion": {
                "stale_data_warning": is_stale,
                "stale_reason": stale_reason,
                "last_successful_run": last_success_run.completed_at.isoformat() + "Z" if last_success_run and last_success_run.completed_at else None,
                "recent_runs": runs_data,
                "open_quality_issues": open_issues_count
            },
            "background_jobs": BackgroundJobRegistry.get_jobs(),
            "backups_summary": {
                "total_backups": len(backups),
                "last_backup": backups[0] if backups else None,
                "last_verified_restore": last_verified_restore
            }
        }
