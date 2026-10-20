import {
  OverviewData,
  DriverStandingItem,
  ConstructorStandingItem,
  RaceItem,
  CircuitItem,
  IncidentDrillItem,
  TelemetryData,
  SystemMetrics
} from '../types';

const API_BASE = '/api/v1';

export async function fetchOverview(season: number = 2026): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/overview?season=${season}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDriverStandings(season: number = 2026): Promise<DriverStandingItem[]> {
  const res = await fetch(`${API_BASE}/seasons/${season}/standings/drivers`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchConstructorStandings(season: number = 2026): Promise<ConstructorStandingItem[]> {
  const res = await fetch(`${API_BASE}/seasons/${season}/standings/constructors`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRaces(season: number = 2026): Promise<RaceItem[]> {
  const res = await fetch(`${API_BASE}/races?season=${season}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRaceDetails(raceId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/races/${raceId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRaceResults(raceId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/races/${raceId}/results`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchCircuits(): Promise<CircuitItem[]> {
  const res = await fetch(`${API_BASE}/circuits`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDrivers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/drivers`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDriverProfile(driverId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchConstructors(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/constructors`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchTelemetry(raceId: string, driverA: string, driverB: string): Promise<TelemetryData> {
  const res = await fetch(`${API_BASE}/telemetry?race_id=${raceId}&driver_a=${driverA}&driver_b=${driverB}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchStrategy(gapSec: number = 2.1, leadComp: string = "MEDIUM", chaseComp: string = "HARD"): Promise<any> {
  const res = await fetch(`${API_BASE}/strategy?gap_sec=${gapSec}&lead_compound=${leadComp}&chase_compound=${chaseComp}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchChampionshipSimulation(season: number = 2026): Promise<any> {
  const res = await fetch(`${API_BASE}/simulations/championship?season=${season}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function runCustomSimulation(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/simulations/championship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchNews(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/news`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${API_BASE}/operations/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDrills(): Promise<IncidentDrillItem[]> {
  const res = await fetch(`${API_BASE}/operations/drills`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function triggerDrill(key: string): Promise<any> {
  const res = await fetch(`${API_BASE}/operations/drills/${key}/trigger`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function remediateDrill(key: string): Promise<any> {
  const res = await fetch(`${API_BASE}/operations/drills/${key}/remediate`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchBackups(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/operations/backups`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createBackup(): Promise<any> {
  const res = await fetch(`${API_BASE}/operations/backups`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function testIsolatedRestore(filename: string): Promise<any> {
  const res = await fetch(`${API_BASE}/operations/backups/${filename}/test-restore`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Championship Tracker & Max Verstappen Scenarios API Client
export async function fetchChampionshipTracker(driverId: string = 'max_verstappen', season: number = 2026): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/tracker?driver_id=${driverId}&season=${season}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchTitleScenarios(driverId: string = 'max_verstappen'): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/scenarios?driver_id=${driverId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function simulateInteractiveScenario(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function runMonteCarloSimulation(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/monte-carlo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDriverComparison(driverA: string = 'max_verstappen', driverB: string = 'antonelli'): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/comparison?driver_a=${driverA}&driver_b=${driverB}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchHistoricalChampionship(season: number): Promise<any> {
  const res = await fetch(`${API_BASE}/championship/history/${season}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

