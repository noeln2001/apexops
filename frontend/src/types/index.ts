export interface DriverStandingItem {
  position: number;
  driver_id: string;
  code?: string;
  name: string;
  nationality?: string;
  team_id?: string;
  team_name: string;
  team_color: string;
  points: number;
  wins: number;
  podiums?: number;
  gap_to_leader: number;
  gap_to_prev: number;
}

export interface ConstructorStandingItem {
  position: number;
  constructor_id: string;
  name: string;
  nationality?: string;
  team_color: string;
  points: number;
  wins: number;
  gap_to_leader: number;
  gap_to_prev: number;
}

export interface UpcomingEvent {
  race_id?: string;
  round?: number;
  name: string;
  circuit_name: string;
  date: string;
  time_utc?: string;
  status: string;
  circuit_timezone: string;
  ist_schedule: string;
}

export interface CompletedEvent {
  race_id?: string;
  round?: number;
  name: string;
  date: string;
  results: Array<{
    position: number;
    position_text: string;
    driver_name: string;
    driver_code?: string;
    constructor_name: string;
    constructor_color: string;
    points: number;
    time_str: string;
    fastest_lap?: string;
  }>;
}

export interface OverviewData {
  season: number;
  reference_date: string;
  upcoming_event: UpcomingEvent;
  latest_completed_event: CompletedEvent;
  driver_standings: DriverStandingItem[];
  constructor_standings: ConstructorStandingItem[];
  recent_news: Array<{
    id: number;
    headline: string;
    publisher: string;
    url: string;
    published_at: string;
    category: string;
    confirmation_status: string;
    reliability_score: number;
    summary: string;
  }>;
  provider_health: Array<{
    name: string;
    status: string;
    last_ping_ms: number;
  }>;
}

export interface RaceItem {
  race_id: string;
  season: number;
  round: number;
  name: string;
  circuit_id: string;
  circuit_name: string;
  country: string;
  date: string;
  time_utc: string;
  status: string;
  ist_schedule: string;
}

export interface CircuitItem {
  circuit_id: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  length_km: number;
  turns: number;
  drs_zones: number;
  lap_record_time: string;
}

export interface IncidentDrillItem {
  id: number;
  scenario_key: string;
  name: string;
  category: string;
  description: string;
  status: string;
  injected_at?: string;
  resolved_at?: string;
  remediation_steps: string;
  logs_output: string;
}

export interface TelemetryData {
  race_id: string;
  circuit_name: string;
  driver_a: string;
  driver_b: string;
  lap_a_number: string | number;
  lap_b_number: string | number;
  telemetry: {
    distance: number[];
    lap_a: {
      speed: number[];
      throttle: number[];
      brake: number[];
    };
    lap_b: {
      speed: number[];
      throttle: number[];
      brake: number[];
    };
    speed_delta: number[];
    time_delta: number[];
    max_distance_m: number;
  };
  channels: string[];
  sampling_rate: string;
}

export interface SystemMetrics {
  platform: string;
  environment: string;
  reference_date: string;
  status: string;
  timestamp: string;
  uptime_seconds: number;
  backend: {
    health: string;
    cpu_percent: number;
    memory_rss_mb: number;
    disk_free_gb: number;
    disk_total_gb: number;
  };
  database: {
    healthy: boolean;
    ping_latency_ms: number;
    size_mb: number;
    engine: string;
  };
  providers: Array<{
    name: string;
    type: string;
    status: string;
    last_ping_ms: number;
    last_success_at: string;
  }>;
  ingestion: {
    recent_runs: Array<{
      id: number;
      dataset: string;
      status: string;
      records: number;
      duration_sec: number;
      started_at: string;
    }>;
    open_quality_issues: number;
  };
}
