# ApexOps — Engineering Case Study: Bridging Motorsport Telemetry & Enterprise Platform Operations

## Executive Summary
**ApexOps** is a production-quality Formula 1 data, analytics, race intelligence, and IT operations platform designed to demonstrate real-world skills across platform engineering, data engineering, trackside systems reliability, and software architecture.

Unlike generic analytics dashboards or mockups, ApexOps solves core mission-critical challenges inherent to motorsport engineering environments:
1. **Unforgiving Latency Windows:** Trackside timing and race strategy decisions operate on second-by-second margins where data freshness dictates undercut and overcut windows.
2. **Provider Volatility & Upstream Outages:** External sports data APIs experience frequent rate limiting, payload changes, and downtime during live sessions.
3. **Catastrophic Data Loss Prevention:** Mission-critical race weekend states must guarantee Recovery Point Objectives (RPO) under 15 minutes and Recovery Time Objectives (RTO) under 60 seconds with non-destructive verification.

---

## 1. Architectural Architecture & Decisions

### Decoupled Ingestion via Resilient Provider Adapters
Upstream sources are segregated behind the `BaseProviderAdapter` interface:
- **Jolpica F1 Adapter:** Ergast successor handling normalized historical results, driver standings, and constructor standings with exponential backoff.
- **OpenF1 Adapter:** Live and delayed session timing, car telemetry, weather, and interval gaps.
- **FastF1 Adapter:** High-frequency vehicle sensor channels (Speed, Throttle, Brake, Gear, RPM, DRS) with local persistent caching.
- **News & FIA Regulations Adapter:** Syndicated RSS feeds with source reliability scoring and confirmation status classification.

### Idempotency & Relational Normalization
Every session result, lap time, and standing is anchored on unique compound constraints (`season_round_driver`). If an import is interrupted by a network fault, the engine resumes from the last known round checkpoint without creating orphaned or duplicate records.

---

## 2. Trackside Incident Drill Subsystem
ApexOps includes an interactive operational drill environment demonstrating 8 synthetic failure scenarios with automated diagnostics and verified remediation:
1. **DRILL-01 (Provider Outage / Circuit Breaker):** Detects consecutive 503 errors and engages a half-open circuit breaker.
2. **DRILL-02 (Database Pool Saturation):** Detects connection pool limits and frees idle sessions.
3. **DRILL-03 (Stale Telemetry Lag):** Flags packet gaps > 45s and triggers buffer resynchronization.
4. **DRILL-04 (Interrupted ETL Recovery):** Resumes interrupted historical backfills from disk checkpoints.
5. **DRILL-05 (Storage Saturation Alert):** Automates log rotation when disk free space falls below 15%.
6. **DRILL-06 (Malformed Sensor Payload Quarantining):** Intercepts physically impossible readings (e.g. Speed > 380 km/h) into a dead-letter quarantine table.
7. **DRILL-07 (Isolated Restore Sandbox Verification):** Validates database page checksums and table counts in a temporary sandbox without modifying production tables.
8. **DRILL-08 (API Latency & Query Plan Optimization):** Analyzes query plans and restores compound indexes under simulated load.

---

## 3. Measured Performance & Benchmarks
Tested on Windows 11 with 30 sequential requests per endpoint:
- **Health Check (`/health`):** 251.5 RPS, 3.77ms median latency, 0.0% error rate
- **Overview Dashboard (`/api/v1/overview`):** 42.6 RPS, 19.71ms median latency, 0.0% error rate
- **Driver Standings (`/api/v1/seasons/2026/standings/drivers`):** 35.7 RPS, 26.99ms median latency, 0.0% error rate
- **Championship Calendar (`/api/v1/races`):** 74.0 RPS, 13.35ms median latency, 0.0% error rate
- **Circuit Directory (`/api/v1/circuits`):** 117.1 RPS, 8.49ms median latency, 0.0% error rate
- **Telemetry Overlay (`/api/v1/telemetry`):** 93.3 RPS, 10.47ms median latency, 0.0% error rate
- **Strategy & Tyre Lab (`/api/v1/strategy`):** 173.6 RPS, 5.71ms median latency, 0.0% error rate
- **Observability Metrics (`/api/v1/operations/status`):** 125.6 RPS, 7.89ms median latency, 0.0% error rate

---

## 4. Automated Testing Matrix
- **Unit Tests:** Formula 1 points allocation, Sprint scoring rules, tie-break countbacks, telemetry distance interpolation, undercut window calculation, Monte Carlo bounds (100% PASS).
- **Integration Tests:** Full REST API contract, circuit coordinates, race status validation, disaster recovery isolated restore guarantee (100% PASS).
- **Overall Coverage:** 15 passing test suites in 16.07 seconds.
