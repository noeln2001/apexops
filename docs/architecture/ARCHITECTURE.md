# ApexOps — Architecture & Engineering Specification

## 1. System Overview
**ApexOps — Motorsport Technology & Intelligence Platform** is an enterprise-grade Formula 1 engineering, telemetry, championship intelligence, and operations platform. It bridges trackside systems support, platform engineering, data engineering, and motorsport analytics.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 + TypeScript + Vite + Tailwind CSS + Apache ECharts + Motorsport Engine |
+-----------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON REST API
                                       v
+-----------------------------------------------------------------------------------+
|                              APEXOPS BACKEND (FastAPI)                            |
|  - Auth & RBAC (JWT, bcrypt)          - Telemetry & Analytics Services             |
|  - REST Endpoints (/api/v1/*)         - Championship Simulator (Monte Carlo Engine)|
|  - Rate Limiting & Audit Logging      - Operations & Incident Drill Subsystem     |
|  - Health & Metric Exporters          - Data Ingestion & Reconcile Engine         |
+-----------------------------------------------------------------------------------+
                  |                                     |
                  v                                     v
+------------------------------------+  +-------------------------------------------+
|          DATABASE TIER             |  |        DATA ENGINE & PROVIDER ADAPTERS    |
|  PostgreSQL / SQLite Storage Engine|  |  - Jolpica F1 API (Historical & Standings)|
|  - 30+ Normalized Relational Tables|  |  - OpenF1 API (Live/Session Timing/Cars)  |
|  - Constraints & Compound Indexes  |  |  - FastF1 (High-freq Lap Telemetry & Tyres)|
|  - Automated Backups & Test Restore|  |  - FIA / F1 Official RSS & Press Adapter  |
+------------------------------------+  +-------------------------------------------+
```

## 2. Core Subsystems

### A. Data Engine & Provider Adapters
- **Common Domain Model**: Decouples external API payloads from internal database entities.
- **Provider Adapters**:
  - `JolpicaAdapter`: Standardized historical Ergast replacement (`https://api.jolpi.ca/ergast/f1/`) with exponential backoff and caching.
  - `OpenF1Adapter`: Session meetings, car intervals, lap times, and sector metrics (`https://api.openf1.org/v1/`).
  - `FastF1Adapter`: High-frequency synchronized vehicle telemetry channels (Speed, Throttle, Brake, Gear, RPM, DRS) and tyre compound stint histories.
  - `NewsAdapter`: Curated motorsport feeds (Reuters, FIA announcements, Formula1 official) with source attribution, confirmation status, and topic classification.
- **Idempotency & Reconciliation**: Checkpoint-based ingestion runs, deduplication keys (`season-round-driver`), and classification reconciliation against official FIA results.

### B. Analytical Engine
- **Telemetry Lab**: Synchronized distance-base alignment, delta-time calculation, throttle/brake overlay, corner apex speed differentials.
- **Tyre & Strategy Lab**: Compound stint length distribution, degradation slope estimation, pit-window undercut/overcut simulation.
- **Championship Simulator**: Exact season-specific points rules (including Sprint formats and fastest lap points), tie-breaking logic (countback system), remaining maximum achievable points, and 1,000-run Monte Carlo probability forecasting.

### C. Operational & Reliability Architecture
- **Observability**: Structured JSON logging, Correlation IDs (`X-Correlation-ID`), latency percentiles, error budget tracking.
- **Trackside Operations Mode**: Real-time service health, provider ping metrics, database query latencies, worker task states.
- **Synthetic Incident Drills**: 8 interactive operational drills with simulated faults, diagnostics logs, and verified remediation playbooks:
  1. External provider outage & circuit breaking
  2. Database connection pool exhaustion & failover
  3. Stale telemetry ingestion lag
  4. Interrupted historical import recovery
  5. Disk threshold saturation
  6. Malformed upstream telemetry payload rejection
  7. Backup corruption detection & isolated restore test
  8. API response latency degradation & index optimization
- **Automated Backup & Isolation Verification**: Hot SQLite/PostgreSQL backups with standalone verification restore scripts.

## 3. Database Schema (Normalized)
- Core Entities: `seasons`, `circuits`, `circuit_layouts`, `constructors`, `drivers`, `driver_team_assignments`, `races`, `sessions`, `session_results`, `qualifying_results`, `sprint_results`, `driver_standings`, `constructor_standings`.
- High-Resolution Data: `lap_times`, `lap_sectors`, `pit_stops`, `tyre_stints`, `telemetry_samples`, `weather_samples`.
- Governance & News: `news_articles`, `news_topics`, `regulations`, `penalties`, `race_control_events`.
- Operations & Auditing: `data_sources`, `ingestion_runs`, `data_quality_issues`, `audit_logs`, `users`, `incident_drills`.
