# ApexOps — OpenAPI REST Specification (v1)

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger Docs: `http://localhost:8000/api/v1/docs`

## Endpoints Summary

### System & Health
- `GET /health` / `GET /api/v1/health`
  - Returns backend health, current project reference date (`2026-10-20`), environment and version.

### Overview & Intelligence
- `GET /api/v1/overview?season={year}`
  - Aggregates upcoming Grand Prix countdown, IST session time, latest completed race classification, top 5 driver & constructor standings, recent curated news, and data provider latency.

### Standings & Historical Results
- `GET /api/v1/seasons`
  - Lists all available championship seasons.
- `GET /api/v1/seasons/{year}/standings/drivers`
  - Returns driver standings with positions, points, gaps to leader, gaps to previous, total wins, podiums, and team colors.
- `GET /api/v1/seasons/{year}/standings/constructors`
  - Returns constructor standings with positions, points, gaps, and team colors.

### Races & Calendar
- `GET /api/v1/races?season={year}`
  - Championship calendar with round number, date, circuit, status (`Completed`, `Confirmed`, `Scheduled`), and India Standard Time (IST) conversion.
- `GET /api/v1/races/{race_id}`
  - Weekend session timetable with UTC and IST broadcast windows.
- `GET /api/v1/races/{race_id}/results`
  - Verified Grand Prix classification with points, laps completed, and fastest lap times.

### Telemetry & Engineering Labs
- `GET /api/v1/telemetry?race_id={id}&driver_a={d1}&driver_b={d2}`
  - Synchronized distance-aligned vehicle traces (Speed, Throttle, Brake, Gear, RPM, DRS status, and time delta).
- `GET /api/v1/strategy?gap_sec={sec}&lead_compound={comp}&chase_compound={comp}`
  - Pirelli tyre compound degradation curves, stint lengths, and undercut window feasibility.
- `GET /api/v1/simulations/championship?season={year}`
  - 1,000-run Monte Carlo simulation forecasting title probabilities.
- `POST /api/v1/simulations/championship`
  - Custom deterministic hypothetical finishing order recalculation.

### Operations & Disaster Recovery
- `GET /api/v1/operations/status`
  - Host CPU, memory RSS, disk capacity, database ping latency, and provider health.
- `GET /api/v1/operations/drills`
  - Lists the 8 trackside synthetic incident drill scenarios.
- `POST /api/v1/operations/drills/{scenario_key}/trigger`
  - Injects fault condition.
- `POST /api/v1/operations/drills/{scenario_key}/remediate`
  - Executes verified remediation playbook.
- `GET /api/v1/operations/backups`
  - Lists hot database snapshots.
- `POST /api/v1/operations/backups`
  - Creates hot database snapshot.
- `POST /api/v1/operations/backups/{filename}/test-restore`
  - Executes isolated sandbox restore test without modifying production database.

### Exports
- `GET /api/v1/exports/{dataset}?season={year}&format={csv|json}`
  - Controlled dataset download for `standings` or `races`.
