import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.models.f1_events import Race
from backend.app.models.operations import IngestionRun
from data_engine.etl.current_season_reconciler import CurrentSeasonReconciler
from operations.monitoring.metrics_service import BackgroundJobRegistry

logger = logging.getLogger("apexops.etl.scheduler")

_scheduler: Optional[BackgroundScheduler] = None


def is_race_weekend(db: Session, ref_date: Optional[str] = None) -> bool:
    """
    Checks if current date (or reference date) falls within a race weekend window
    (within 3 days before or during any scheduled/confirmed race).
    """
    date_str = ref_date or settings.REFERENCE_DATE
    try:
        current_dt = datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        current_dt = datetime.now(timezone.utc).date()

    races = db.query(Race).all()
    for race in races:
        try:
            race_dt = datetime.strptime(race.date, "%Y-%m-%d").date()
            # If within 3 days before or on race day
            delta_days = (race_dt - current_dt).days
            if -1 <= delta_days <= 3:
                return True
        except Exception:
            continue
    return False


def run_scheduled_reconciliation(db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Idempotently runs the Jolpica season reconciler and writes an IngestionRun audit record.
    Can be invoked by APScheduler or triggered on-demand via REST endpoint.
    """
    owns_session = False
    if db is None:
        db = SessionLocal()
        owns_session = True

    start_time = datetime.now(timezone.utc)
    t0 = time.time()
    logger.info("Executing scheduled Jolpica season reconciliation...")

    try:
        reconciler = CurrentSeasonReconciler(db)
        results = reconciler.reconcile_2026_season()
        duration = round(time.time() - t0, 3)

        records_count = results.get("total_rounds", 24) + len(results.get("standings_discrepancies", []))

        run_record = IngestionRun(
            source_name="Jolpica",
            dataset_name="2026_season_standings_and_calendar",
            status="SUCCESS",
            records_processed=records_count,
            duration_sec=duration,
            started_at=start_time,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(run_record)
        db.commit()

        BackgroundJobRegistry.record_job_run(
            job_key="standings_reconciliation_worker",
            status="IDLE",
            duration_sec=duration,
        )

        logger.info(f"Scheduled reconciliation completed successfully in {duration}s. Run ID: {run_record.id}")
        return {
            "status": "SUCCESS",
            "run_id": run_record.id,
            "records_processed": records_count,
            "duration_sec": duration,
            "validation_results": results,
            "timestamp": run_record.completed_at.isoformat(),
        }

    except Exception as e:
        duration = round(time.time() - t0, 3)
        logger.error(f"Scheduled reconciliation failed: {e}", exc_info=True)
        try:
            failed_run = IngestionRun(
                source_name="Jolpica",
                dataset_name="2026_season_standings_and_calendar",
                status="FAILED",
                records_processed=0,
                duration_sec=duration,
                error_log=str(e),
                started_at=start_time,
                completed_at=datetime.now(timezone.utc),
            )
            db.add(failed_run)
            db.commit()
            BackgroundJobRegistry.record_job_run(
                job_key="standings_reconciliation_worker",
                status="FAILED",
                duration_sec=duration,
                error=str(e),
            )
        except Exception:
            pass
        return {
            "status": "FAILED",
            "error": str(e),
            "duration_sec": duration,
        }
    finally:
        if owns_session:
            db.close()


def get_ingestion_schedule_status(db: Session) -> Dict[str, Any]:
    """Returns the current scheduled ingestion cadence and data freshness status."""
    race_wknd = is_race_weekend(db)
    cadence = "HOURLY (Race Weekend Active)" if race_wknd else "DAILY (Standard Interval)"
    interval_hours = 1 if race_wknd else 24

    last_run = (
        db.query(IngestionRun)
        .filter(IngestionRun.source_name == "Jolpica", IngestionRun.status == "SUCCESS")
        .order_by(IngestionRun.completed_at.desc())
        .first()
    )

    is_fresh = False
    age_hours = None
    if last_run and last_run.completed_at:
        now_utc = datetime.now(timezone.utc)
        comp_utc = last_run.completed_at
        if comp_utc.tzinfo is None:
            comp_utc = comp_utc.replace(tzinfo=timezone.utc)
        age_hours = round((now_utc - comp_utc).total_seconds() / 3600, 2)
        # Fresh if run within 2x interval
        is_fresh = age_hours <= (interval_hours * 2)

    return {
        "cadence": cadence,
        "is_race_weekend": race_wknd,
        "interval_hours": interval_hours,
        "freshness_status": "FRESH" if is_fresh else "STALE",
        "age_hours": age_hours,
        "last_run_id": last_run.id if last_run else None,
        "last_run_at": last_run.completed_at.isoformat() if last_run and last_run.completed_at else None,
        "next_scheduled_run": (datetime.now(timezone.utc) + timedelta(hours=interval_hours)).isoformat(),
    }


def start_scheduled_ingestion():
    """Initializes and starts the APScheduler background worker."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return _scheduler

    _scheduler = BackgroundScheduler(timezone="UTC")

    db = SessionLocal()
    try:
        race_wknd = is_race_weekend(db)
        # Hourly on race weekends, daily otherwise
        hours_interval = 1 if race_wknd else 24
    except Exception:
        hours_interval = 24
    finally:
        db.close()

    _scheduler.add_job(
        run_scheduled_reconciliation,
        "interval",
        hours=hours_interval,
        id="jolpica_season_reconciler",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info(f"APScheduler started with Jolpica reconciler interval: {hours_interval}h")
    return _scheduler


def shutdown_scheduled_ingestion():
    """Stops the APScheduler background worker gracefully."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("APScheduler background ingestion stopped.")
