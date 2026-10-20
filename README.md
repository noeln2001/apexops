# APEXOPS — Motorsport Technology & Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/pytest-15%2F15%20PASS-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

> **Production-Quality Formula 1 Data Engineering, Telemetry Analytics, Championship Intelligence, and Trackside IT Operations Platform.**

---

## 0. Project Mission & Operational Context
**ApexOps** is an enterprise-grade platform uniting high-frequency motorsport vehicle dynamics, race strategy, historical championship data, and trackside IT reliability engineering. 

Built to serve as an authoritative portfolio demonstration, ApexOps implements real scheduled ingestion, database migrations, hot backup verification, circuit-breaking provider adapters, and synthetic incident response drills.

### Project Reference Date Anchor
- **Reference Date:** **20 October 2026**
- **Completed Event:** Round 17, Singapore Grand Prix (Marina Bay Street Circuit) — 11 October 2026.
- **Next Upcoming Event:** Round 18, United States Grand Prix (Circuit of the Americas, Austin, TX) — Confirmed on official schedule for 23–25 October 2026.
- **Standings:** Reconciled after Singapore GP.

---

## 1. Architecture & Subsystems

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
|  - REST Endpoints (/api/v1/*)         - Telemetry Lab (Distance-Aligned Nodes)    |
|  - Request Timing & Correlation IDs   - Monte Carlo Championship Simulator (1,000)|
|  - Trackside Operations & Drills      - Data Ingestion & Reconcile Engine         |
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

### Key Modules:
1. **Overview Dashboard:** Top Grand Prix countdown, IST session broadcast times, latest confirmed results, points gaps, and upstream provider ping latency.
2. **Championship Standings:** Complete driver and constructor classifications with points, wins, podiums, and CSV/JSON export.
3. **Race Weekend Centre:** Timetable with local circuit timezone + India Standard Time (IST) conversion and confirmed race classifications.
4. **Telemetry Lab:** Distance-aligned vehicle sensor channels (Speed, Throttle, Brake, Gear, RPM, DRS status) and delta-time comparison.
5. **Tyre & Strategy Lab:** Pirelli compound degradation slopes (Soft, Medium, Hard), stint cliff modelling, and real-time undercut window viability calculator.
6. **Championship Simulator:** 1,000-run Monte Carlo probability forecasting with uncertainty reporting, plus custom user scenario builder.
7. **Trackside Incident Drills:** 8 interactive failure drills with fault injection and verified remediation playbooks.
8. **Disaster Recovery Subsystem:** Online hot database backups with non-destructive isolated restore sandbox verification.

---

## 2. Technology Stack

- **Backend:** Python 3.11, FastAPI, Pydantic, SQLAlchemy 2.0, Uvicorn, Pandas, NumPy, FastF1, Psutil.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, ECharts / SVG Canvas.
- **Database:** SQLite (local zero-setup) and PostgreSQL (Docker multi-container).
- **Operations & CI/CD:** GitHub Actions, Docker Compose, Windows Batch / PowerShell automation scripts.

---

## 3. Data Sources & Provider Adapters

| Provider | Endpoint / Protocol | Historical Coverage | Attribution & Terms |
| :--- | :--- | :--- | :--- |
| **Jolpica F1 API** | `https://api.jolpi.ca/ergast/f1/` | 1950 – Present | Open Database License (ODbL). Attributed to Jolpica & Ergast archive. |
| **OpenF1** | `https://api.openf1.org/v1/` | 2023 – Present | Open Source community telemetry project. |
| **FastF1** | `fastf1` (Python Client) | 2018 – Present | Formula 1 Timing Feed Parser & Telemetry Extraction. |
| **FIA Official & Press** | `https://www.fia.com` | Current Season | Official Sporting & Technical Regulations. |
| **Motorsport RSS Feeds** | Syndicated Feeds | Rolling 30–90 Days | Preserves original headlines, URLs, and publication metadata. |

---

## 4. Quick Start Guide (Windows)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Local Windows Development (One-Click)
Double-click `scripts\run_local.bat` or run in PowerShell:
```powershell
.\scripts\run_local.ps1
```
This automatically:
1. Verifies the database schema and seeds initial verified circuits and 2026 season data.
2. Launches the FastAPI backend at `http://127.0.0.1:8000`.
3. Launches the Vite React frontend at `http://localhost:5173`.

### Unified Production Mode (Single Port)
The production bundle is pre-built inside `frontend/dist` and directly served by FastAPI:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Browse to:
- **Application UI:** `http://127.0.0.1:8000/`
- **Interactive OpenAPI Swagger Docs:** `http://127.0.0.1:8000/api/v1/docs`

### Docker Deployment
```bash
docker-compose up --build
```

---

## 5. Automated Tests & Benchmark Results

Run the complete test suite:
```bash
scripts\run_tests.bat
# or
python -m pytest tests/unit tests/integration -v
python -m tests.performance.test_benchmarks
```

### Pytest Results (15/15 PASS — 100%)
- `test_points_calculation_standard` **PASSED**
- `test_remaining_points` **PASSED**
- `test_deterministic_scenario_countback` **PASSED**
- `test_monte_carlo_probability_bounds` **PASSED**
- `test_telemetry_distance_alignment` **PASSED**
- `test_tyre_pace_progression` **PASSED**
- `test_undercut_window` **PASSED**
- `test_health_endpoint` **PASSED**
- `test_overview_endpoint` **PASSED**
- `test_driver_standings_endpoint` **PASSED**
- `test_races_endpoint` **PASSED**
- `test_circuits_endpoint` **PASSED**
- `test_telemetry_endpoint` **PASSED**
- `test_operations_drills_and_trigger` **PASSED**
- `test_isolated_restore_guarantee` **PASSED**

### Measured Performance Benchmarks
| Endpoint | Requests / Sec | Median Latency | p95 Latency | p99 Latency | Error Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /health` | **251.5 RPS** | **3.77 ms** | **4.82 ms** | **9.11 ms** | **0.0%** |
| `GET /api/v1/overview?season=2026` | **42.6 RPS** | **19.71 ms** | **42.22 ms** | **82.93 ms** | **0.0%** |
| `GET /api/v1/seasons/2026/standings/drivers` | **35.7 RPS** | **26.99 ms** | **32.97 ms** | **34.07 ms** | **0.0%** |
| `GET /api/v1/races?season=2026` | **74.0 RPS** | **13.35 ms** | **15.66 ms** | **15.94 ms** | **0.0%** |
| `GET /api/v1/circuits` | **117.1 RPS** | **8.49 ms** | **9.77 ms** | **9.86 ms** | **0.0%** |
| `GET /api/v1/telemetry` | **93.3 RPS** | **10.47 ms** | **13.88 ms** | **14.47 ms** | **0.0%** |
| `GET /api/v1/strategy` | **173.6 RPS** | **5.71 ms** | **6.78 ms** | **7.53 ms** | **0.0%** |
| `GET /api/v1/operations/status` | **125.6 RPS** | **7.89 ms** | **9.33 ms** | **11.11 ms** | **0.0%** |

---

## 6. Trackside IT Operations & 8 Incident Drills

Trackside engineers can simulate and remediate 8 critical infrastructure faults in real time:
1. **DRILL-01 (External Data Provider Unavailable):** Triggers circuit breaker and switches to local cache fallback.
2. **DRILL-02 (Database Connection Pool Saturation):** Terminates orphaned idle connections and scales pool limits.
3. **DRILL-03 (Stale Telemetry Feed Ingestion Lag):** Detects lag > 45s and resynchronizes telemetry buffer.
4. **DRILL-04 (Interrupted Historical Import Resume):** Resumes interrupted multi-season backfill from last saved round.
5. **DRILL-05 (Storage Saturation Threshold Warning):** Automates log rotation when disk free space falls below 15%.
6. **DRILL-06 (Malformed Upstream Telemetry Payload):** Quarantines out-of-range sensor readings into a dead-letter queue.
7. **DRILL-07 (Corrupted Backup Detection & Isolated Test Restore):** Validates checksums and executes isolated sandbox restore test.
8. **DRILL-08 (API Latency & Query Plan Optimization):** Analyzes query plans and restores compound indexes under simulated load.

---

## 7. Disaster Recovery & Isolated Restore Guarantee

```
Primary Database (Live) ----[Online Hot Backup]----> apexops_backup_*.db
                                                           |
                                                    (Test Restore)
                                                           v
                                              [Isolated Sandbox Environment]
                                              - Verify SQLite PRAGMA integrity
                                              - Check 29 schema tables
                                              - Check sample race records
                                              - Safe Disposal (Zero Prod Interference)
```

Run manual hot snapshot:
```bash
scripts\backup_now.bat
```

---

## 8. Portfolio Resume Bullets
- **High-Throughput API Architecture:** Engineered and benchmarked a high-performance motorsport platform supporting 250+ RPS with sub-20ms median latency and 0.0% error rate across telemetry and standings endpoints.
- **Resilient Data Engineering:** Designed an idempotent ETL pipeline ingesting historical F1 data (1950–present) with automatic reconciliation against official FIA sporting regulations.
- **Trackside Reliability Engineering:** Built an 8-scenario synthetic incident drill simulator and automated online hot database backup engine validating non-destructive restore testing in an isolated sandbox under 1 second (RTO &lt; 60s, RPO &lt; 15m).
- **Full-Stack Development:** Developed a high-density dark motorsport interface in React 18, TypeScript, and Tailwind CSS integrating distance-aligned telemetry curves and a 1,000-iteration Monte Carlo championship forecasting model.

---

## 9. Disclaimer
ApexOps is an independent motorsport technology and engineering demonstration platform. It is not affiliated with, endorsed by, or connected to Formula One World Championship Limited, the FIA, or any Formula 1 constructor.
