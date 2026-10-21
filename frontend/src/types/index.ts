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

export interface ChampionshipDriver {
  position: number;
  driver_id: string;
  name: string;
  code: string;
  team: string;
  current_points: number;
  wins: number;
  podiums: number;
  dnfs: number;
  points_gap_to_leader: number;
  points_gap_to_ahead: number;
  points_gap_to_behind: number;
  max_achievable_points: number;
  max_possible_position: number;
  min_points_needed_to_lead: number;
  status: 'CLINCHED' | 'CONTENDER' | 'ELIMINATED';
  is_clinched: boolean;
  is_eliminated: boolean;
  is_contender: boolean;
  eliminated_at?: string;
}

export interface ChampionshipSummary {
  season: number;
  reference_anchor: string;
  remaining_rounds: number;
  remaining_sprints: number;
  max_available_points_per_driver: number;
  total_drivers: number;
  active_contenders_count: number;
  eliminated_drivers_count: number;
  leader?: ChampionshipDriver;
  contenders_list: string[];
}

export interface ChampionshipRemainingRound {
  round: number;
  name: string;
  circuit_name: string;
  date: string;
  has_sprint: boolean;
  max_gp_points: number;
  max_sprint_points: number;
}

export interface ChampionshipTrackerData {
  season: number;
  reference_date: string;
  selected_driver: ChampionshipDriver;
  summary: ChampionshipSummary;
  remaining_calendar: ChampionshipRemainingRound[];
  standings: ChampionshipDriver[];
  data_provenance: {
    source: string;
    last_synced: string;
    is_stale: boolean;
    validation_status: string;
  };
}

export interface TitleScenario {
  id: string;
  title: string;
  category: 'BEST_CASE' | 'TACTICAL_SWING' | 'RIVAL_MISFORTUNE' | 'CONSISTENCY' | 'ELIMINATION_RISK' | 'CHAOS_EVENT' | 'MATHEMATICAL_BOUNDARY';
  description: string;
  target_starting_points: number;
  target_gained_points: number;
  target_final_points: number;
  leader_starting_points: number;
  leader_assumed_gain: number;
  leader_final_points: number;
  resulting_points_difference: number;
  target_wins_championship: boolean;
  remains_eligible: boolean;
  explanation: string;
}

export interface TitleScenariosResponse {
  target_driver: ChampionshipDriver;
  leader: ChampionshipDriver;
  starting_deficit: number;
  remaining_points_available: number;
  survival_cushion_points: number;
  scenarios_count: number;
  scenarios: TitleScenario[];
}

export interface ProjectedStanding {
  driver_id: string;
  name: string;
  code: string;
  team: string;
  starting_position: number;
  projected_position: number;
  position_change: number;
  starting_points: number;
  projected_points: number;
  points_gained: number;
  projected_wins: number;
}

export interface InteractiveSimulationResult {
  status: string;
  champion: ProjectedStanding;
  projected_standings: ProjectedStanding[];
  rounds_simulated: number;
}

export interface MonteCarloDriverResult {
  driver_id: string;
  name: string;
  code: string;
  team: string;
  current_points: number;
  championship_prob_pct: number;
  top3_prob_pct: number;
  expected_final_points: number;
  points_std_dev: number;
  expected_championship_position: number;
  sample_points_distribution: number[];
}

export interface MonteCarloResponse {
  iterations: number;
  random_seed?: number;
  execution_duration_sec: number;
  remaining_rounds: number;
  assumptions: string[];
  drivers: MonteCarloDriverResult[];
}

export interface DriverComparisonData {
  driver_a: {
    id: string;
    name: string;
    team: string;
    position: number;
    points: number;
    wins: number;
    podiums: number;
    max_achievable: number;
    status: string;
    avg_grid?: number;
    avg_finish?: number;
    positions_gained?: number;
    finishing_distribution?: Record<string, number>;
  };
  driver_b: {
    id: string;
    name: string;
    team: string;
    position: number;
    points: number;
    wins: number;
    podiums: number;
    max_achievable: number;
    status: string;
    avg_grid?: number;
    avg_finish?: number;
    positions_gained?: number;
    finishing_distribution?: Record<string, number>;
  };
  points_difference: number;
  ahead_driver_id: string;
  remaining_rounds: number;
  remaining_sprints: number;
  required_point_swing_per_round: number;
  races_needed_at_10pt_swing: number;
  tactical_analysis: string;
  season_points_progression?: Array<{
    round: number;
    race_id: string;
    driver_a_cumulative: number;
    driver_b_cumulative: number;
  }>;
  qualifying_vs_race_delta?: {
    driver_a: number;
    driver_b: number;
  };
}

