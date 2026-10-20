import os
import shutil
import time
import psutil
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.models.operations import DataSource, IngestionRun, DataQualityIssue, AuditLog

class MetricsService:
    """Collects real system observability and platform health metrics."""

    @staticmethod
    def get_system_metrics(db: Session) -> Dict[str, Any]:
        # Process and hardware metrics
        process = psutil.Process(os.getpid())
        cpu_pct = psutil.cpu_percent(interval=None)
        mem_info = process.memory_info()
        disk = shutil.disk_usage(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")))

        # DB connection test and size
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

        # Provider health states
        providers = db.query(DataSource).all()
        provider_stats = [
            {
                "name": p.name,
                "type": p.type,
                "status": p.health_status,
                "last_ping_ms": p.last_ping_ms,
                "last_success_at": p.last_success_at.isoformat() if p.last_success_at else None
            } for p in providers
        ]

        # Recent ingestion runs
        recent_runs = db.query(IngestionRun).order_by(IngestionRun.id.desc()).limit(5).all()
        runs_data = [
            {
                "id": r.id,
                "dataset": r.dataset_name,
                "status": r.status,
                "records": r.records_processed,
                "duration_sec": r.duration_sec,
                "started_at": r.started_at.isoformat() if r.started_at else None
            } for r in recent_runs
        ]

        # Active quality issues
        open_issues_count = db.query(DataQualityIssue).filter(DataQualityIssue.resolved == False).count()

        return {
            "platform": "ApexOps v1.0.0",
            "environment": settings.ENVIRONMENT,
            "reference_date": settings.REFERENCE_DATE,
            "status": "OPERATIONAL" if db_healthy else "CRITICAL",
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
                "engine": "SQLite / PostgreSQL Compatible"
            },
            "providers": provider_stats,
            "ingestion": {
                "recent_runs": runs_data,
                "open_quality_issues": open_issues_count
            }
        }
