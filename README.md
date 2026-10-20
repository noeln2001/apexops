# APEXOPS — Motorsport Technology & Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.13-5C3EE8.svg?logo=opencv)](https://opencv.org)
[![Pytest](https://img.shields.io/badge/pytest-39%2F39%20PASS-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![GitHub Repo](https://img.shields.io/badge/GitHub-noeln2001%2Fapexops-181717.svg?logo=github)](https://github.com/noeln2001/apexops)

> **Production-Grade Formula 1 Data Engineering, Championship Title Intelligence, Distance-Aligned Telemetry Analytics, Web-Wide UHD Image Discovery with Computer Vision Quality Verification, and Trackside IT Operations.**

---

## 🏎️ Platform Mission & Operational Context

**ApexOps** is an enterprise-grade motorsport technology and intelligence platform engineered to simulate real Formula 1 operations. It unites high-frequency vehicle dynamics, race strategy, championship math, historical statistics (2010–Present), automated computer vision media pipelines, and trackside IT reliability engineering.

### Current Championship Operational State
- **Reference Season:** **2026 Season** (with full historical archive 2010–2026)
- **Completed Event:** Round 17, Singapore Grand Prix (Marina Bay Street Circuit)
- **Next Upcoming Event:** Round 18, United States Grand Prix (Circuit of the Americas, Austin, TX)
- **Championship Focus:** Max Verstappen (#33 / #1) Title Clinch Scenarios Engine

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 + TypeScript + Vite + Tailwind CSS 4 + Apache ECharts + Motorsport UI   |
+-----------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON REST API
                                       v
+-----------------------------------------------------------------------------------+
|                              APEXOPS BACKEND (FastAPI)                            |
|  - REST Endpoints (/api/v1/*)         - Telemetry Lab (Distance-Aligned Nodes)    |
|  - Championship Tracker & Max Scenarios- Monte Carlo Simulation Engine (10,000 run)|
|  - UHD Image Discovery & CV Engine    - Historical Archive Service (2010-Present) |
|  - Trackside Operations & Drills      - Hot Backups & Sandboxed Integrity Restore |
+-----------------------------------------------------------------------------------+
         |                                |                                   |
         v                                v                                   v
+------------------+    +----------------------------------+    +--------------------+
|   DATABASE TIER  |    |  COMPUTER VISION & MEDIA ENGINE  |    | PROVIDER ADAPTERS  |
|  SQLite / Postgres|   |  - Pillow + OpenCV 4.13 Decoder  |    | - Jolpica F1 API   |
|  - 30+ Relational |   |  - Laplacian Variance Sharpness  |    | - OpenF1 API       |
|    Tables        |    |  - 2D FFT Spectral Density (Anti-|    | - FastF1 Client    |
|  - Strict Schema  |   |    Upscaling / Fake 4K Detection)|    | - Wikimedia Commons|
|    Integrity     |    |  - 8x8 DCT JPEG Boundary Metric  |    | - FOM/FIA Press    |
+------------------+    +----------------------------------+    +--------------------+
```

---

## 🌟 Key Capabilities & Modules

### 1. 🏆 F1 Championship Tracker & Max Verstappen Title Scenarios
- **Live Championship Mathematics:**
  - Real-time standings tracking for Max Verstappen and title rivals.
  - Mathematical points gap analysis, maximum points remaining calculation ($25 \times \text{GPs} + 8 \times \text{Sprints} + 1 \times \text{FL}$).
- **10,000-Run Monte Carlo Simulation Engine:**
  - Dynamic race-pace simulation incorporating circuit characteristics, qualifying probabilities, reliability risks, and weather factors.
  - Provides empirical title win probability percentages and confidence distributions.
- **Interactive "What-If" Title Clinch Scenario Matrix:**
  - Exact finishing position combinations Max Verstappen needs in upcoming rounds to secure the Drivers' World Championship.
- **Roll of Honor (2010 – Present):**
  - Interactive historical champions browser covering Sebastian Vettel (2010–2013), Lewis Hamilton (2014–2020), and Max Verstappen (2021–Present).

### 2. 📸 Web-Wide F1 Image Discovery & UHD Quality Verification
- **Permitted Web Source Discovery:**
  - Dynamic querying across permitted sources (Wikimedia Commons API, official team media downloads) by driver, constructor, season, and Grand Prix.
  - Full author attribution, source URLs, and Creative Commons / editorial license provenance tracking.
- **Backend Computer Vision UHD Verification:**
  - Real byte decoding on the backend using Pillow and OpenCV; never accepts arbitrary "4K" labels in filenames or URLs.
  - Enforces true UHD standards: **Width $\ge 3840$ px, Height $\ge 2160$ px** (Landscape) and **Width $\ge 2160$ px, Height $\ge 3840$ px** (Portrait).
- **Automated Clarity & Sharpness Inspection:**
  - **Laplacian Variance ($\sigma^2_{\Delta}$):** Quantifies edge focus and sharpness.
  - **2D Fast Fourier Transform (FFT) Spectral Density:** Analyzes high-frequency radial energy ($\mu_{\text{HF}}$) to detect fake upscaled or stretched thumbnails.
  - **8×8 DCT Boundary Analysis:** Detects overcompression and severe blocking artifacts.
- **Quality Classifications:**
  - `EXCELLENT`: Genuine 4K/5K UHD, sharp focus ($\ge 110$), clean compression.
  - `GOOD`: High resolution (FHD/QHD), usable clarity ($\ge 55$).
  - `REVIEW`: Meets resolution, but has motion blur or compression flags.
  - `REJECTED`: Sub-HD ($< 1920 \times 1080$), corrupt bytes, or fake upscaled.
- **Local Gallery Save (File System Access API & ZIP Fallback):**
  - Uses `window.showDirectoryPicker()` to save verified originals directly to the user's local disk organized by `/<Team>/<Driver>/<file>`.
  - Confirms browser file write before reporting success.
  - Server-side structured ZIP export with `manifest.json` as fallback.
- **Security & Compliance:**
  - Full SSRF protection against private IPv4/IPv6 networks and loopbacks.
  - SHA-256 content deduplication.
  - Honest disclosure of restricted sources (e.g. Red Bull Content Pool requiring authenticated accreditation).

### 3. 🔬 Telemetry Lab & Strategy Engineering
- **Distance-Aligned Telemetry:** Synchronized GPS distance plots comparing Speed, Throttle, Brake, Gear, Engine RPM, and DRS status between drivers.
- **Tyre & Strategy Lab:** Pirelli compound degradation modeling (Soft, Medium, Hard), stint cliff analysis, and real-time undercut window viability calculator.

### 4. 🛡️ Trackside IT Operations & Disaster Recovery
- **8 Interactive Failure Scenarios:** Telemetry ingest dropouts, database failovers, upstream latency spikes, and automated runbook remediations.
- **Hot Database Backups & Non-Destructive Restore:** Point-in-time SQLite/PostgreSQL backups verified in an isolated memory sandbox to guarantee recovery targets (RPO < 15 min, RTO < 60s).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/noeln2001/apexops.git
cd apexops
```

### 2. Backend Setup & Startup
```powershell
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI backend server (Runs on http://localhost:8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Interactive API documentation is available at: `http://localhost:8000/docs`

### 3. Frontend Setup & Startup
```powershell
# Open a new terminal in the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

### 4. Run the Full Test Suite
```powershell
# Run all unit and integration tests (39 test cases)
python -m pytest
```

---

## 📖 Complete Documentation & User Guide

A complete, publication-grade PDF user manual is available in the repository root:
📄 **[`ApexOps_Platform_User_Guide.pdf`](./ApexOps_Platform_User_Guide.pdf)**

The PDF guide includes:
- System overview and design methodology.
- Championship mathematical formulas and simulation parameters.
- Computer vision sharpness formulas and frequency-domain upscaling algorithms.
- Complete UI walkthrough with screenshots and step-by-step instructions.
- API endpoints reference and security architecture.

---

## 🛠️ API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/championship/tracker` | `GET` | Max Verstappen title scenarios, points gap, and remaining schedule |
| `/api/v1/championship/simulate` | `POST` | Execute 10,000-run Monte Carlo simulation with custom finishing scenarios |
| `/api/v1/championship/history/champions` | `GET` | Roll of Honor: Historical World Champions from 2010 to present |
| `/api/v1/gallery/images` | `GET` | List verified UHD F1 images with CV metrics, filters, and licensing |
| `/api/v1/gallery/discover` | `POST` | Trigger web-wide discovery and backend computer vision verification |
| `/api/v1/gallery/verify-url` | `POST` | Inspect any external image URL on backend for UHD resolution & clarity |
| `/api/v1/gallery/sources` | `GET` | Honest source compliance and licensing audit catalog |
| `/api/v1/gallery/export-zip` | `POST` | Export selected verified originals as a structured ZIP with `manifest.json` |
| `/api/v1/gallery/manifest` | `GET` | Download JSON manifest of all verified media assets |
| `/api/v1/telemetry/compare` | `GET` | Distance-aligned multi-driver telemetry channels |
| `/api/v1/strategy/undercut` | `POST` | Real-time pit-stop undercut viability calculation |
| `/api/v1/operations/health` | `GET` | Trackside system health, latency, and database integrity |

---

## 📜 License & Compliance

- **Code License:** [MIT License](LICENSE)
- **Data Attribution:** Ergast / Jolpica F1 database under Open Database License (ODbL); OpenF1 community API; FastF1 parser.
- **Media Compliance:** All discovered imagery is retrieved exclusively from open-access repositories with documented Creative Commons (CC-BY, CC-BY-SA) or Public Domain licenses. Web terms, robots.txt, and rate limits are respected with zero bypass of logins or paywalls.

---
*Created by **noeln2001** &bull; ApexOps Engineering Portfolio Project*
