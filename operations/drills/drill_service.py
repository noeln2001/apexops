import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from backend.app.models.operations import AuditLog, IncidentDrill

logger = logging.getLogger("apexops.drills")

DRILL_SCENARIOS = [
    {
        "scenario_key": "DRILL-01",
        "name": "External Data Provider Unavailable (Circuit Breaker Tripped)",
        "category": "INGESTION",
        "description": "Simulates 503 Service Unavailable errors from upstream Jolpica API during active race weekend ingestion.",
        "symptoms": "HTTP 503 returned, consecutive failures threshold exceeded (3/3), Circuit Breaker engaged to prevent cascading backend timeouts.",
        "remediation_steps": "1. Verify network egress. 2. Switch adapter mode to Local Cache Fallback. 3. Flush transient error queue. 4. Reset circuit breaker.",
        "default_log": "[WARN] JolpicaAdapter: Upstream endpoint https://api.jolpi.ca/ergast/f1/2026/18 returned HTTP 503. Tripping circuit breaker into HALF-OPEN state."
    },
    {
        "scenario_key": "DRILL-02",
        "name": "Database Connection Pool Saturation",
        "category": "DATABASE",
        "description": "Simulates concurrent live timing requests exhausting the connection pool limit.",
        "symptoms": "SQLAlchemy QueuePool limit of 20 connections reached; query latency spike to >2500ms.",
        "remediation_steps": "1. Terminate orphaned idle sessions. 2. Scale connection pool limit with max_overflow=10. 3. Enable read-replica pooling.",
        "default_log": "[ERROR] DB Pool: Timeout waiting for connection from pool. Active: 20, Waiting: 14."
    },
    {
        "scenario_key": "DRILL-03",
        "name": "Stale Telemetry Feed Ingestion Lag",
        "category": "TELEMETRY",
        "description": "Detects packet gap > 45 seconds between live track sensors and ingest worker.",
        "symptoms": "Telemetry timestamp delta exceeded SLA threshold of 10s. Ingestion lag warning on Trackside dashboard.",
        "remediation_steps": "1. Inspect worker buffer. 2. Force restart worker process. 3. Re-synchronize timecode via OpenF1 session anchor.",
        "default_log": "[ALERT] TelemetryIngest: Ingestion lag 48.2s exceeds SLA (10.0s). Driver #4 telemetry delayed."
    },
    {
        "scenario_key": "DRILL-04",
        "name": "Interrupted Historical Import Resume",
        "category": "INGESTION",
        "description": "Simulates worker crash during a multi-season historical backfill.",
        "symptoms": "IngestionRun record left in 'RUNNING' state with no heartbeat for > 10 minutes.",
        "remediation_steps": "1. Detect incomplete checkpoint. 2. Mark stalled run as INTERRUPTED. 3. Re-trigger idempotent import from last saved round.",
        "default_log": "[ERROR] ETL Engine: Worker process killed unexpectedly during Season 2024 Round 14 backfill. Checkpoint intact."
    },
    {
        "scenario_key": "DRILL-05",
        "name": "Storage Saturation Threshold Warning",
        "category": "INFRASTRUCTURE",
        "description": "Simulates disk free space dropping below 15% safety margin on telemetry storage volume.",
        "symptoms": "Disk usage alert fired; automated compression triggered.",
        "remediation_steps": "1. Run log rotation. 2. Purge uncompressed raw cache older than 14 days. 3. Compress cold season SQLite dumps.",
        "default_log": "[CRITICAL] StorageMonitor: Partition /var/lib/apexops at 88.4% capacity. Free space: 4.2 GB."
    },
    {
        "scenario_key": "DRILL-06",
        "name": "Malformed Upstream Telemetry Payload Rejection",
        "category": "DATA_INTEGRITY",
        "description": "Detects out-of-range sensor readings (e.g. speed 820 km/h or negative throttle) and quarantines payload.",
        "symptoms": "Pydantic validation error raised. Payload diverted to dead-letter quarantine table.",
        "remediation_steps": "1. Inspect quarantine table. 2. Verify sensor calibration delta. 3. Discard malformed packet without dropping session.",
        "default_log": "[WARNING] TelemetryValidator: Value outlier detected: Speed 845.2 km/h exceeds maximum physical constraint (380 km/h). Quarantining."
    },
    {
        "scenario_key": "DRILL-07",
        "name": "Corrupted Backup Detection & Isolated Test Restore",
        "category": "DISASTER_RECOVERY",
        "description": "Validates that database backup integrity checks detect corrupted headers and successfully execute automated restore testing.",
        "symptoms": "Backup checksum verification failed or isolated restore sandbox aborted.",
        "remediation_steps": "1. Discard invalid archive. 2. Re-execute clean hot snapshot. 3. Verify SQLite/Postgres page integrity in isolated temp DB.",
        "default_log": "[INFO] BackupVerifier: Running automated isolated test restore in sandbox DB. Integrity check: 100% PASS."
    },
    {
        "scenario_key": "DRILL-08",
        "name": "API Response Latency Degradation & Query Plan Optimization",
        "category": "PERFORMANCE",
        "description": "Simulates missing index on session lap query causing full table scan.",
        "symptoms": "p99 latency increases from 42ms to 480ms on /api/v1/races/{id}/results.",
        "remediation_steps": "1. Run EXPLAIN QUERY PLAN. 2. Rebuild index `idx_result_race_driver`. 3. Verify p99 latency recovery.",
        "default_log": "[WARN] SlowQueryLog: GET /api/v1/races/2026-17/results took 512ms. Recommended index missing."
    }
]

class DrillService:
    """Manages synthetic incident drills for trackside IT operations testing."""

    @staticmethod
    def initialize_drills(db: Session):
        for scenario in DRILL_SCENARIOS:
            existing = db.query(IncidentDrill).filter(IncidentDrill.scenario_key == scenario["scenario_key"]).first()
            if not existing:
                drill = IncidentDrill(
                    scenario_key=scenario["scenario_key"],
                    name=scenario["name"],
                    category=scenario["category"],
                    description=scenario["description"],
                    status="IDLE",
                    remediation_steps=scenario["remediation_steps"],
                    logs_output=scenario["default_log"]
                )
                db.add(drill)
        db.commit()

    @staticmethod
    def list_drills(db: Session) -> List[Dict[str, Any]]:
        DrillService.initialize_drills(db)
        drills = db.query(IncidentDrill).order_by(IncidentDrill.id).all()
        return [
            {
                "id": d.id,
                "scenario_key": d.scenario_key,
                "name": d.name,
                "category": d.category,
                "description": d.description,
                "status": d.status,
                "injected_at": d.injected_at.isoformat() if d.injected_at else None,
                "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
                "remediation_steps": d.remediation_steps,
                "logs_output": d.logs_output
            } for d in drills
        ]

    @staticmethod
    def trigger_drill(db: Session, scenario_key: str) -> Dict[str, Any]:
        drill = db.query(IncidentDrill).filter(IncidentDrill.scenario_key == scenario_key).first()
        if not drill:
            return {"error": f"Drill {scenario_key} not found"}

        drill.status = "ACTIVE"
        now_dt = datetime.now(timezone.utc)
        drill.injected_at = now_dt
        drill.resolved_at = None
        drill.logs_output += f"\n[{now_dt.strftime('%H:%M:%S')}] [SIMULATION] Drill {scenario_key} injected by trackside engineer."

        db.add(AuditLog(
            user_email="trackside-ops",
            action="TRIGGER_INCIDENT_DRILL",
            resource=scenario_key,
            details_json=f"Injected synthetic fault scenario: {drill.name}"
        ))
        db.commit()
        return {"status": "ACTIVE", "scenario_key": scenario_key, "message": "Incident drill active"}

    @staticmethod
    def remediate_drill(db: Session, scenario_key: str) -> Dict[str, Any]:
        drill = db.query(IncidentDrill).filter(IncidentDrill.scenario_key == scenario_key).first()
        if not drill:
            return {"error": f"Drill {scenario_key} not found"}

        now_dt = datetime.now(timezone.utc)
        drill.status = "RESOLVED"
        drill.resolved_at = now_dt
        drill.logs_output += f"\n[{now_dt.strftime('%H:%M:%S')}] [REMEDIATION] Operator executed playbook: {drill.remediation_steps} -> Health checks verified. Status: GREEN."

        db.add(AuditLog(
            user_email="trackside-ops",
            action="RESOLVE_INCIDENT_DRILL",
            resource=scenario_key,
            details_json="Playbook verified and system returned to nominal operational state."
        ))
        db.commit()
        return {"status": "RESOLVED", "scenario_key": scenario_key, "message": "Remediation verified"}
