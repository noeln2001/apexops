# ApexOps — Data Provider Coverage & Provenance Audit

## 1. Provider Audit Matrix

| Provider | Base URL / Library | Historical Coverage | Live / Delayed / Historical | Auth Required | Rate Limits | Attribution & Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Jolpica F1 API** (Ergast Successor) | `https://api.jolpi.ca/ergast/f1/` | 1950 – Present (including 2026 calendar & standings) | Historical + Post-session published results | None (Public REST) | ~4 req/sec recommended | Open Database License (ODbL). Attributed to Jolpica Project & Ergast Archive. |
| **OpenF1** | `https://api.openf1.org/v1/` | 2023 – Present | Historical session data, 10s–30s delayed real-time feed | None (Public REST) | 3-5 req/sec burst limit | Community-driven Open Source project. Attributed to OpenF1. |
| **FastF1** | `fastf1` (Python client) | 2018 – Present (high-frequency telemetry) | Post-session telemetry (~30-60 min post session) | None (Local cache enabled) | Cached client-side to prevent upstream throttling | Attributed to FastF1 project and Formula 1 timing feed parser. |
| **FIA Official Documents & RSS** | `https://www.fia.com/` | Current Regulations, Stewards Decisions | Regulatory documents, press releases | None (Public HTML / Feeds) | Respectful scraping / RSS | Attributed directly to Fédération Internationale de l'Automobile. |
| **Motorsport News & Media** | RSS Feeds (Reuters, Autosport, F1.com) | Recent feeds (rolling 30-90 days) | Published articles | None | Respectful syndication | Source headline, URL link, and publication timestamp preserved without reproducing full copyrighted text. |

## 2. Data Reconciliation & Precedence Policy
When upstream data points conflict:
1. **Classifications & Penalties**: Official FIA Documents > Formula 1 Official > Jolpica > OpenF1.
2. **Session Timings & Intervals**: FastF1 / OpenF1 timing feeds > General reports.
3. **Calendar Adjustments**: Official FIA / F1 announcements take precedence over provisional calendar files.
4. **Discrepancy Reporting**: Any variance in lap times, penalty points, or classification status is flagged with `discrepancy_flag = TRUE` in the `session_results` or `driver_standings` table.

## 3. Reference Date & Calendar Validation (2026 Season)
- **Reference Date**: 20 October 2026
- **Completed Event**: Round 17, Singapore Grand Prix (Marina Bay Street Circuit) — 11 October 2026.
- **Next Upcoming Event**: Round 18, United States Grand Prix (Circuit of the Americas, Austin, TX) — 23–25 October 2026.
- **Standings Status**: Confirmed after Singapore GP (Round 17).
