// Static fallback data for GitHub Pages deployment when backend is not running
export const FALLBACK_OVERVIEW = {
  season: 2026,
  reference_date: "2026-10-20",
  upcoming_event: {
    race_id: "2026_18",
    round: 18,
    name: "United States Grand Prix",
    circuit_name: "Circuit of the Americas",
    date: "2026-10-25",
    time_utc: "19:00:00Z",
    status: "Confirmed",
    circuit_timezone: "America/Chicago (UTC-5)",
    ist_schedule: "Monday, 26 October 00:30 IST (Race)"
  },
  latest_completed_event: {
    race_id: "2026_17",
    round: 17,
    name: "Singapore Grand Prix",
    date: "2026-10-11",
    results: [
      {
        position: 1,
        position_text: "1",
        driver_name: "Lando Norris",
        driver_code: "NOR",
        constructor_name: "McLaren",
        constructor_color: "#FF8000",
        points: 25,
        time_str: "1:44:42.568",
        fastest_lap: "1:34.905"
      },
      {
        position: 2,
        position_text: "2",
        driver_name: "Max Verstappen",
        driver_code: "VER",
        constructor_name: "Red Bull Racing",
        constructor_color: "#3671C6",
        points: 18,
        time_str: "+20.945",
        fastest_lap: "1:35.320"
      },
      {
        position: 3,
        position_text: "3",
        driver_name: "Oscar Piastri",
        driver_code: "PIA",
        constructor_name: "McLaren",
        constructor_color: "#FF8000",
        points: 15,
        time_str: "+41.823",
        fastest_lap: "1:35.450"
      },
      {
        position: 4,
        position_text: "4",
        driver_name: "George Russell",
        driver_code: "RUS",
        constructor_name: "Mercedes",
        constructor_color: "#27F4D2",
        points: 12,
        time_str: "+1:01.040",
        fastest_lap: "1:36.012"
      },
      {
        position: 5,
        position_text: "5",
        driver_name: "Charles Leclerc",
        driver_code: "LEC",
        constructor_name: "Ferrari",
        constructor_color: "#E80020",
        points: 10,
        time_str: "+1:02.430",
        fastest_lap: "1:35.801"
      }
    ]
  },
  driver_standings: [
    { position: 1, driver_id: "max_verstappen", name: "Max Verstappen", code: "VER", team_name: "Red Bull Racing", team_color: "#3671C6", points: 331, wins: 7, gap_to_leader: 0, gap_to_prev: 0 },
    { position: 2, driver_id: "norris", name: "Lando Norris", code: "NOR", team_name: "McLaren", team_color: "#FF8000", points: 279, wins: 3, gap_to_leader: 52, gap_to_prev: 52 },
    { position: 3, driver_id: "leclerc", name: "Charles Leclerc", code: "LEC", team_name: "Ferrari", team_color: "#E80020", points: 245, wins: 2, gap_to_leader: 86, gap_to_prev: 34 },
    { position: 4, driver_id: "piastri", name: "Oscar Piastri", code: "PIA", team_name: "McLaren", team_color: "#FF8000", points: 237, wins: 2, gap_to_leader: 94, gap_to_prev: 8 },
    { position: 5, driver_id: "sainz", name: "Carlos Sainz", code: "SAI", team_name: "Ferrari", team_color: "#E80020", points: 190, wins: 1, gap_to_leader: 141, gap_to_prev: 47 }
  ],
  constructor_standings: [
    { position: 1, constructor_id: "mclaren", name: "McLaren", team_color: "#FF8000", points: 516, wins: 5, gap_to_leader: 0, gap_to_prev: 0 },
    { position: 2, constructor_id: "red_bull", name: "Red Bull Racing", team_color: "#3671C6", points: 475, wins: 7, gap_to_leader: 41, gap_to_prev: 41 },
    { position: 3, constructor_id: "ferrari", name: "Ferrari", team_color: "#E80020", points: 435, wins: 3, gap_to_leader: 81, gap_to_prev: 40 },
    { position: 4, constructor_id: "mercedes", name: "Mercedes", team_color: "#27F4D2", points: 329, wins: 3, gap_to_leader: 187, gap_to_prev: 106 }
  ],
  recent_news: [
    { id: 1, headline: "FIA confirms 2026 Technical Regulations Engine Framework", publisher: "FIA Official", url: "https://www.fia.com", published_at: "2026-10-18T10:00:00Z", category: "REGULATIONS", confirmation_status: "OFFICIAL_COMMUNIQUE", reliability_score: 99, summary: "FIA World Motor Sport Council ratifies engine convergence parameters." },
    { id: 2, headline: "Red Bull upgrades RB22 floor package ahead of Austin COTA", publisher: "Motorsport.com", url: "https://www.motorsport.com", published_at: "2026-10-16T14:30:00Z", category: "TECHNICAL", confirmation_status: "PADDOCK_CONFIRMED", reliability_score: 92, summary: "Christian Horner confirms aero updates targeted at high-speed balance." }
  ],
  provider_health: [
    { name: "Jolpica F1 API", status: "HEALTHY", last_ping_ms: 42 },
    { name: "OpenF1 API", status: "HEALTHY", last_ping_ms: 68 },
    { name: "FastF1 Cache", status: "HEALTHY", last_ping_ms: 12 },
    { name: "Wikimedia Commons", status: "HEALTHY", last_ping_ms: 28 }
  ]
};

export const FALLBACK_DRIVER_STANDINGS = [
  { position: 1, driver_id: "max_verstappen", name: "Max Verstappen", code: "VER", permanent_number: 1, nationality: "Dutch", team_id: "red_bull", team_name: "Red Bull Racing", team_color: "#3671C6", points: 331, wins: 7, podiums: 13, gap_to_leader: 0, gap_to_prev: 0 },
  { position: 2, driver_id: "norris", name: "Lando Norris", code: "NOR", permanent_number: 4, nationality: "British", team_id: "mclaren", team_name: "McLaren", team_color: "#FF8000", points: 279, wins: 3, podiums: 12, gap_to_leader: 52, gap_to_prev: 52 },
  { position: 3, driver_id: "leclerc", name: "Charles Leclerc", code: "LEC", permanent_number: 16, nationality: "Monegasque", team_id: "ferrari", team_name: "Ferrari", team_color: "#E80020", points: 245, wins: 2, podiums: 9, gap_to_leader: 86, gap_to_prev: 34 },
  { position: 4, driver_id: "piastri", name: "Oscar Piastri", code: "PIA", permanent_number: 81, nationality: "Australian", team_id: "mclaren", team_name: "McLaren", team_color: "#FF8000", points: 237, wins: 2, podiums: 7, gap_to_leader: 94, gap_to_prev: 8 },
  { position: 5, driver_id: "sainz", name: "Carlos Sainz", code: "SAI", permanent_number: 55, nationality: "Spanish", team_id: "ferrari", team_name: "Ferrari", team_color: "#E80020", points: 190, wins: 1, podiums: 6, gap_to_leader: 141, gap_to_prev: 47 },
  { position: 6, driver_id: "hamilton", name: "Lewis Hamilton", code: "HAM", permanent_number: 44, nationality: "British", team_id: "ferrari", team_name: "Ferrari", team_color: "#E80020", points: 174, wins: 2, podiums: 4, gap_to_leader: 157, gap_to_prev: 16 },
  { position: 7, driver_id: "russell", name: "George Russell", code: "RUS", permanent_number: 63, nationality: "British", team_id: "mercedes", team_name: "Mercedes", team_color: "#27F4D2", points: 155, wins: 1, podiums: 3, gap_to_leader: 176, gap_to_prev: 19 },
  { position: 8, driver_id: "perez", name: "Sergio Perez", code: "PER", permanent_number: 11, nationality: "Mexican", team_id: "cadillac", team_name: "Cadillac F1 Team", team_color: "#E10600", points: 144, wins: 0, podiums: 4, gap_to_leader: 187, gap_to_prev: 11 }
];

export const FALLBACK_CONSTRUCTOR_STANDINGS = [
  { position: 1, constructor_id: "mclaren", name: "McLaren", nationality: "British", team_color: "#FF8000", points: 516, wins: 5, gap_to_leader: 0, gap_to_prev: 0 },
  { position: 2, constructor_id: "red_bull", name: "Red Bull Racing", nationality: "Austrian", team_color: "#3671C6", points: 475, wins: 7, gap_to_leader: 41, gap_to_prev: 41 },
  { position: 3, constructor_id: "ferrari", name: "Ferrari", nationality: "Italian", team_color: "#E80020", points: 435, wins: 3, gap_to_leader: 81, gap_to_prev: 40 },
  { position: 4, constructor_id: "mercedes", name: "Mercedes", nationality: "German", team_color: "#27F4D2", points: 329, wins: 3, gap_to_leader: 187, gap_to_prev: 106 },
  { position: 5, constructor_id: "aston_martin", name: "Aston Martin", nationality: "British", team_color: "#229971", points: 86, wins: 0, gap_to_leader: 430, gap_to_prev: 243 }
];

const FALLBACK_CHAMP_DRIVERS = [
  {
    position: 1,
    driver_id: "max_verstappen",
    name: "Max Verstappen",
    code: "VER",
    team: "Red Bull Racing",
    current_points: 331,
    wins: 7,
    podiums: 13,
    dnfs: 1,
    points_gap_to_leader: 0,
    points_gap_to_ahead: 0,
    points_gap_to_behind: 52,
    max_achievable_points: 530,
    max_possible_position: 1,
    min_points_needed_to_lead: 0,
    status: 'CONTENDER' as const,
    is_clinched: false,
    is_eliminated: false,
    is_contender: true
  },
  {
    position: 2,
    driver_id: "norris",
    name: "Lando Norris",
    code: "NOR",
    team: "McLaren",
    current_points: 279,
    wins: 3,
    podiums: 12,
    dnfs: 0,
    points_gap_to_leader: 52,
    points_gap_to_ahead: 52,
    points_gap_to_behind: 34,
    max_achievable_points: 478,
    max_possible_position: 1,
    min_points_needed_to_lead: 53,
    status: 'CONTENDER' as const,
    is_clinched: false,
    is_eliminated: false,
    is_contender: true
  },
  {
    position: 3,
    driver_id: "leclerc",
    name: "Charles Leclerc",
    code: "LEC",
    team: "Ferrari",
    current_points: 245,
    wins: 2,
    podiums: 9,
    dnfs: 1,
    points_gap_to_leader: 86,
    points_gap_to_ahead: 34,
    points_gap_to_behind: 8,
    max_achievable_points: 444,
    max_possible_position: 1,
    min_points_needed_to_lead: 87,
    status: 'CONTENDER' as const,
    is_clinched: false,
    is_eliminated: false,
    is_contender: true
  },
  {
    position: 4,
    driver_id: "piastri",
    name: "Oscar Piastri",
    code: "PIA",
    team: "McLaren",
    current_points: 237,
    wins: 2,
    podiums: 7,
    dnfs: 1,
    points_gap_to_leader: 94,
    points_gap_to_ahead: 8,
    points_gap_to_behind: 47,
    max_achievable_points: 436,
    max_possible_position: 1,
    min_points_needed_to_lead: 95,
    status: 'CONTENDER' as const,
    is_clinched: false,
    is_eliminated: false,
    is_contender: true
  },
  {
    position: 5,
    driver_id: "sainz",
    name: "Carlos Sainz",
    code: "SAI",
    team: "Ferrari",
    current_points: 190,
    wins: 1,
    podiums: 6,
    dnfs: 2,
    points_gap_to_leader: 141,
    points_gap_to_ahead: 47,
    points_gap_to_behind: 16,
    max_achievable_points: 389,
    max_possible_position: 1,
    min_points_needed_to_lead: 142,
    status: 'CONTENDER' as const,
    is_clinched: false,
    is_eliminated: false,
    is_contender: true
  }
];

export const FALLBACK_CHAMPIONSHIP_TRACKER = {
  season: 2026,
  reference_date: "2026-10-20",
  selected_driver: FALLBACK_CHAMP_DRIVERS[0],
  summary: {
    season: 2026,
    reference_anchor: "2026-10-20",
    remaining_rounds: 7,
    remaining_sprints: 3,
    max_available_points_per_driver: 199,
    total_drivers: 20,
    active_contenders_count: 5,
    eliminated_drivers_count: 15,
    leader: FALLBACK_CHAMP_DRIVERS[0],
    contenders_list: ["Max Verstappen", "Lando Norris", "Charles Leclerc", "Oscar Piastri", "Carlos Sainz"]
  },
  remaining_calendar: [
    { round: 18, name: "United States Grand Prix", circuit_name: "Circuit of the Americas", date: "2026-10-25", has_sprint: true, max_gp_points: 26, max_sprint_points: 8 },
    { round: 19, name: "Mexico City Grand Prix", circuit_name: "Autódromo Hermanos Rodríguez", date: "2026-11-01", has_sprint: false, max_gp_points: 26, max_sprint_points: 0 },
    { round: 20, name: "São Paulo Grand Prix", circuit_name: "Autódromo José Carlos Pace", date: "2026-11-08", has_sprint: true, max_gp_points: 26, max_sprint_points: 8 },
    { round: 21, name: "Las Vegas Grand Prix", circuit_name: "Las Vegas Strip Circuit", date: "2026-11-21", has_sprint: false, max_gp_points: 26, max_sprint_points: 0 },
    { round: 22, name: "Qatar Grand Prix", circuit_name: "Lusail International Circuit", date: "2026-11-29", has_sprint: true, max_gp_points: 26, max_sprint_points: 8 },
    { round: 23, name: "Abu Dhabi Grand Prix", circuit_name: "Yas Marina Circuit", date: "2026-12-06", has_sprint: false, max_gp_points: 26, max_sprint_points: 0 }
  ],
  standings: FALLBACK_CHAMP_DRIVERS,
  data_provenance: {
    source: "ApexOps Mathematical Point Ingestion Matrix",
    last_synced: "2026-10-20T12:00:00Z",
    is_stale: false,
    validation_status: "VERIFIED"
  },
  monte_carlo: {
    season: 2026,
    reference_anchor: "2026-10-20",
    iterations: 10000,
    random_seed: 42,
    results: [
      { driver_id: "max_verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing", current_points: 331, championship_prob_pct: 78.4, top3_prob_pct: 99.2, mean_points: 448.2, min_points: 380, max_points: 520, p10_points: 412, p50_points: 448, p90_points: 485, earliest_clinch_round: "Round 21 (Brazil GP)" },
      { driver_id: "norris", name: "Lando Norris", code: "NOR", team: "McLaren", current_points: 279, championship_prob_pct: 18.2, top3_prob_pct: 92.5, mean_points: 402.1, min_points: 340, max_points: 470, p10_points: 370, p50_points: 401, p90_points: 438, earliest_clinch_round: "Round 23 (Abu Dhabi)" },
      { driver_id: "leclerc", name: "Charles Leclerc", code: "LEC", team: "Ferrari", current_points: 245, championship_prob_pct: 3.4, top3_prob_pct: 68.0, mean_points: 355.6, min_points: 295, max_points: 425, p10_points: 320, p50_points: 355, p90_points: 390, earliest_clinch_round: "Round 23 (Abu Dhabi)" }
    ],
    projected_standings: [
      { driver_id: "max_verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull Racing", starting_position: 1, projected_position: 1, position_change: 0, starting_points: 331, projected_points: 448, points_gained: 117, projected_wins: 10 },
      { driver_id: "norris", name: "Lando Norris", code: "NOR", team: "McLaren", starting_position: 2, projected_position: 2, position_change: 0, starting_points: 279, projected_points: 402, points_gained: 123, projected_wins: 5 },
      { driver_id: "leclerc", name: "Charles Leclerc", code: "LEC", team: "Ferrari", starting_position: 3, projected_position: 3, position_change: 0, starting_points: 245, projected_points: 355, points_gained: 110, projected_wins: 3 }
    ],
    title_probabilities: {
      "Max Verstappen": 78.4,
      "Lando Norris": 18.2,
      "Charles Leclerc": 3.4
    }
  },
  scenarios: {
    target_driver: FALLBACK_CHAMP_DRIVERS[0],
    leader: FALLBACK_CHAMP_DRIVERS[0],
    starting_deficit: 0,
    remaining_points_available: 199,
    survival_cushion_points: 52,
    scenarios_count: 3,
    scenarios: [
      {
        id: "best_case_austin",
        title: "P1 Finish at COTA with Fastest Lap",
        category: "BEST_CASE",
        description: "Max claims victory in both Sprint and Grand Prix at Austin COTA.",
        target_starting_points: 331,
        target_gained_points: 34,
        target_final_points: 365,
        leader_starting_points: 331,
        leader_assumed_gain: 34,
        leader_final_points: 365,
        resulting_points_difference: 68,
        target_wins_championship: true,
        remains_eligible: true,
        explanation: "Extends title lead over Norris to 68 points, mathematically eliminating 4 rivals."
      },
      {
        id: "tactical_podium",
        title: "Podium Management (Avg P2/P3)",
        category: "CONSISTENCY",
        description: "Max manages tyre degradation and avoids wheel-to-wheel incidents, securing consistent P2 finishes.",
        target_starting_points: 331,
        target_gained_points: 126,
        target_final_points: 457,
        leader_starting_points: 331,
        leader_assumed_gain: 126,
        leader_final_points: 457,
        resulting_points_difference: 42,
        target_wins_championship: true,
        remains_eligible: true,
        explanation: "Even if Norris wins 4 races, Max clinches the title in Las Vegas."
      },
      {
        id: "dnf_recovery",
        title: "Single DNF Mechanical Dropout",
        category: "CHAOS_EVENT",
        description: "Simulates sudden PU telemetry spike leading to retirement in Brazil Sprint.",
        target_starting_points: 331,
        target_gained_points: 82,
        target_final_points: 413,
        leader_starting_points: 331,
        leader_assumed_gain: 82,
        leader_final_points: 413,
        resulting_points_difference: 11,
        target_wins_championship: true,
        remains_eligible: true,
        explanation: "Title fight extends to Abu Dhabi finale, with 68% probability of championship victory."
      }
    ]
  }
};

export const FALLBACK_HISTORICAL_CHAMPIONS = [
  { season: 2025, champion: "Max Verstappen", team: "Red Bull Racing", points: 437, runner_up: "Lando Norris", gap: 63, wins: 9, races: 24 },
  { season: 2024, champion: "Max Verstappen", team: "Red Bull Racing", points: 429, runner_up: "Lando Norris", gap: 58, wins: 9, races: 24 },
  { season: 2023, champion: "Max Verstappen", team: "Red Bull Racing", points: 575, runner_up: "Sergio Perez", gap: 290, wins: 19, races: 22 },
  { season: 2022, champion: "Max Verstappen", team: "Red Bull Racing", points: 454, runner_up: "Charles Leclerc", gap: 146, wins: 15, races: 22 },
  { season: 2021, champion: "Max Verstappen", team: "Red Bull Racing", points: 395.5, runner_up: "Lewis Hamilton", gap: 8, wins: 10, races: 22 },
  { season: 2020, champion: "Lewis Hamilton", team: "Mercedes", points: 347, runner_up: "Valtteri Bottas", gap: 124, wins: 11, races: 17 },
  { season: 2019, champion: "Lewis Hamilton", team: "Mercedes", points: 413, runner_up: "Valtteri Bottas", gap: 87, wins: 11, races: 21 },
  { season: 2018, champion: "Lewis Hamilton", team: "Mercedes", points: 408, runner_up: "Sebastian Vettel", gap: 88, wins: 11, races: 21 },
  { season: 2017, champion: "Lewis Hamilton", team: "Mercedes", points: 363, runner_up: "Sebastian Vettel", gap: 46, wins: 9, races: 20 },
  { season: 2016, champion: "Nico Rosberg", team: "Mercedes", points: 385, runner_up: "Lewis Hamilton", gap: 5, wins: 9, races: 21 },
  { season: 2015, champion: "Lewis Hamilton", team: "Mercedes", points: 381, runner_up: "Nico Rosberg", gap: 59, wins: 10, races: 19 },
  { season: 2014, champion: "Lewis Hamilton", team: "Mercedes", points: 384, runner_up: "Nico Rosberg", gap: 67, wins: 11, races: 19 },
  { season: 2013, champion: "Sebastian Vettel", team: "Red Bull Racing", points: 397, runner_up: "Fernando Alonso", gap: 155, wins: 13, races: 19 },
  { season: 2012, champion: "Sebastian Vettel", team: "Red Bull Racing", points: 281, runner_up: "Fernando Alonso", gap: 3, wins: 5, races: 20 },
  { season: 2011, champion: "Sebastian Vettel", team: "Red Bull Racing", points: 392, runner_up: "Jenson Button", gap: 122, wins: 11, races: 19 },
  { season: 2010, champion: "Sebastian Vettel", team: "Red Bull Racing", points: 256, runner_up: "Fernando Alonso", gap: 4, wins: 5, races: 19 }
];

export const FALLBACK_VERIFIED_GALLERY = [
  {
    id: "c2026chinese_max_fp1",
    title: "2026 Chinese GP - Red Bull - Max Verstappen - FP1",
    driver: "Max Verstappen",
    team: "Red Bull Racing",
    season: 2026,
    grand_prix: "Chinese GP",
    source_site: "Wikimedia Commons",
    source_page: "https://commons.wikimedia.org/wiki/File:2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_FP1.jpg",
    original_url: "https://upload.wikimedia.org/wikipedia/commons/c/c2/2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_FP1.jpg",
    thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_FP1.jpg/1280px-2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_FP1.jpg",
    width: 4885,
    height: 2748,
    aspect_ratio: 1.78,
    orientation: "LANDSCAPE",
    resolution_label: "4K UHD",
    is_uhd: true,
    file_size_bytes: 2118841,
    file_size_mb: 2.02,
    format: "JPEG",
    classification: "REVIEW",
    is_valid: true,
    license: "CC BY-SA 4.0",
    author: "Motorsport Imagery",
    description: "Max Verstappen driving the Red Bull Racing RB22 through Turn 1 at Shanghai International Circuit.",
    sha256: "8357e80368230cb476cb8ecd6e79939c2d8cfa644918a1ec1a7fc5e01434b44b",
    metrics: {
      sharpness_laplacian: 37.0,
      edge_energy: 21.56,
      high_frequency_spectral_mean: 164.3,
      blockiness_ratio: 1.06,
      is_upscaled: false
    },
    reasons: ["Resolution passes UHD (4885x2748), trackside high-speed motion blur observed."],
    verified_at: "2026-10-20T21:30:00Z"
  },
  {
    id: "c2026chinese_max_qual",
    title: "2026 Chinese GP - Red Bull - Max Verstappen - Qualifying",
    driver: "Max Verstappen",
    team: "Red Bull Racing",
    season: 2026,
    grand_prix: "Chinese GP",
    source_site: "Wikimedia Commons",
    source_page: "https://commons.wikimedia.org/wiki/File:2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_Qualifying.jpg",
    original_url: "https://upload.wikimedia.org/wikipedia/commons/4/40/2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_Qualifying.jpg",
    thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_Qualifying.jpg/1280px-2026_Chinese_GP_-_Red_Bull_-_Max_Verstappen_-_Qualifying.jpg",
    width: 5068,
    height: 2851,
    aspect_ratio: 1.78,
    orientation: "LANDSCAPE",
    resolution_label: "5K UHD+",
    is_uhd: true,
    file_size_bytes: 2489110,
    file_size_mb: 2.37,
    format: "JPEG",
    classification: "REVIEW",
    is_valid: true,
    license: "CC BY-SA 4.0",
    author: "Formula Open Archive",
    description: "Max Verstappen qualifying lap in Shanghai.",
    sha256: "4a90b1c0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    metrics: {
      sharpness_laplacian: 36.7,
      edge_energy: 22.4,
      high_frequency_spectral_mean: 158.9,
      blockiness_ratio: 1.08,
      is_upscaled: false
    },
    reasons: ["Resolution passes 5K UHD (5068x2851); motion blur present in background."],
    verified_at: "2026-10-20T21:30:00Z"
  },
  {
    id: "c2025_max_redbull_portrait",
    title: "F1 - Red Bull Racing - Max Verstappen (27965385544)",
    driver: "Max Verstappen",
    team: "Red Bull Racing",
    season: 2025,
    grand_prix: "Austrian GP",
    source_site: "Wikimedia Commons",
    source_page: "https://commons.wikimedia.org/wiki/File:F1_-_Red_Bull_Racing_-_Max_Verstappen_(27965385544).jpg",
    original_url: "https://upload.wikimedia.org/wikipedia/commons/7/72/F1_-_Red_Bull_Racing_-_Max_Verstappen_%2827965385544%29.jpg",
    thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/F1_-_Red_Bull_Racing_-_Max_Verstappen_%2827965385544%29.jpg/1280px-F1_-_Red_Bull_Racing_-_Max_Verstappen_%2827965385544%29.jpg",
    width: 4608,
    height: 3456,
    aspect_ratio: 1.33,
    orientation: "LANDSCAPE",
    resolution_label: "4K UHD",
    is_uhd: true,
    file_size_bytes: 3524901,
    file_size_mb: 3.36,
    format: "JPEG",
    classification: "GOOD",
    is_valid: true,
    license: "CC BY 2.0",
    author: "Arteris Motorsport",
    description: "Max Verstappen in Red Bull Racing paddock attire with crystal edge focus.",
    sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    metrics: {
      sharpness_laplacian: 68.7,
      edge_energy: 38.12,
      high_frequency_spectral_mean: 172.4,
      blockiness_ratio: 1.02,
      is_upscaled: false
    },
    reasons: ["Genuine UHD 4K+ resolution with good visual sharpness."],
    verified_at: "2026-10-20T21:30:00Z"
  }
];


export const FALLBACK_RACES = [
  {
    "race_id": "2026-01",
    "round": 1,
    "name": "Australian Grand Prix",
    "circuit_name": "Albert Park Grand Prix Circuit",
    "country": "Australia",
    "date": "2026-03-08",
    "time_utc": "04:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-03-08 18:30 IST"
  },
  {
    "race_id": "2026-02",
    "round": 2,
    "name": "Chinese Grand Prix",
    "circuit_name": "Shanghai International Circuit",
    "country": "China",
    "date": "2026-03-15",
    "time_utc": "07:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-03-15 18:30 IST"
  },
  {
    "race_id": "2026-03",
    "round": 3,
    "name": "Japanese Grand Prix",
    "circuit_name": "Suzuka Circuit",
    "country": "Japan",
    "date": "2026-03-29",
    "time_utc": "05:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-03-29 18:30 IST"
  },
  {
    "race_id": "2026-04",
    "round": 4,
    "name": "Miami Grand Prix",
    "circuit_name": "Miami International Autodrome",
    "country": "USA",
    "date": "2026-05-03",
    "time_utc": "20:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-05-03 18:30 IST"
  },
  {
    "race_id": "2026-05",
    "round": 5,
    "name": "Canadian Grand Prix",
    "circuit_name": "Circuit Gilles Villeneuve",
    "country": "Canada",
    "date": "2026-05-24",
    "time_utc": "20:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-05-24 18:30 IST"
  },
  {
    "race_id": "2026-06",
    "round": 6,
    "name": "Monaco Grand Prix",
    "circuit_name": "Circuit de Monaco",
    "country": "Monaco",
    "date": "2026-06-07",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-06-07 18:30 IST"
  },
  {
    "race_id": "2026-07",
    "round": 7,
    "name": "Barcelona Grand Prix",
    "circuit_name": "Circuit de Barcelona-Catalunya",
    "country": "Spain",
    "date": "2026-06-14",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-06-14 18:30 IST"
  },
  {
    "race_id": "2026-08",
    "round": 8,
    "name": "Austrian Grand Prix",
    "circuit_name": "Red Bull Ring",
    "country": "Austria",
    "date": "2026-06-28",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-06-28 18:30 IST"
  },
  {
    "race_id": "2026-09",
    "round": 9,
    "name": "British Grand Prix",
    "circuit_name": "Silverstone Circuit",
    "country": "UK",
    "date": "2026-07-05",
    "time_utc": "14:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-07-05 18:30 IST"
  },
  {
    "race_id": "2026-10",
    "round": 10,
    "name": "Belgian Grand Prix",
    "circuit_name": "Circuit de Spa-Francorchamps",
    "country": "Belgium",
    "date": "2026-07-19",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-07-19 18:30 IST"
  },
  {
    "race_id": "2026-11",
    "round": 11,
    "name": "Hungarian Grand Prix",
    "circuit_name": "Hungaroring",
    "country": "Hungary",
    "date": "2026-07-26",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-07-26 18:30 IST"
  },
  {
    "race_id": "2026-12",
    "round": 12,
    "name": "Dutch Grand Prix",
    "circuit_name": "Circuit Park Zandvoort",
    "country": "Netherlands",
    "date": "2026-08-23",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-08-23 18:30 IST"
  },
  {
    "race_id": "2026-13",
    "round": 13,
    "name": "Italian Grand Prix",
    "circuit_name": "Autodromo Nazionale di Monza",
    "country": "Italy",
    "date": "2026-09-06",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-09-06 18:30 IST"
  },
  {
    "race_id": "2026-14",
    "round": 14,
    "name": "Spanish Grand Prix",
    "circuit_name": "Madring",
    "country": "Spain",
    "date": "2026-09-13",
    "time_utc": "13:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-09-13 18:30 IST"
  },
  {
    "race_id": "2026-15",
    "round": 15,
    "name": "Azerbaijan Grand Prix",
    "circuit_name": "Baku City Circuit",
    "country": "Azerbaijan",
    "date": "2026-09-26",
    "time_utc": "11:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-09-26 18:30 IST"
  },
  {
    "race_id": "2026-16",
    "round": 16,
    "name": "Bahrain Grand Prix in Malaysia",
    "circuit_name": "Sepang International Circuit",
    "country": "Malaysia",
    "date": "2026-10-04",
    "time_utc": "07:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-10-04 18:30 IST"
  },
  {
    "race_id": "2026-17",
    "round": 17,
    "name": "Singapore Grand Prix",
    "circuit_name": "Marina Bay Street Circuit",
    "country": "Singapore",
    "date": "2026-10-11",
    "time_utc": "12:00:00Z",
    "status": "Completed",
    "ist_schedule": "2026-10-11 18:30 IST"
  },
  {
    "race_id": "2026-18",
    "round": 18,
    "name": "United States Grand Prix",
    "circuit_name": "Circuit of the Americas",
    "country": "USA",
    "date": "2026-10-25",
    "time_utc": "20:00:00Z",
    "status": "Confirmed",
    "ist_schedule": "2026-10-25 18:30 IST"
  },
  {
    "race_id": "2026-19",
    "round": 19,
    "name": "Mexico City Grand Prix",
    "circuit_name": "Aut\u00f3dromo Hermanos Rodr\u00edguez",
    "country": "Mexico",
    "date": "2026-11-01",
    "time_utc": "20:00:00Z",
    "status": "Scheduled",
    "ist_schedule": "2026-11-01 18:30 IST"
  },
  {
    "race_id": "2026-20",
    "round": 20,
    "name": "Brazilian Grand Prix",
    "circuit_name": "Aut\u00f3dromo Jos\u00e9 Carlos Pace",
    "country": "Brazil",
    "date": "2026-11-08",
    "time_utc": "17:00:00Z",
    "status": "Scheduled",
    "ist_schedule": "2026-11-08 18:30 IST"
  },
  {
    "race_id": "2026-21",
    "round": 21,
    "name": "Las Vegas Grand Prix",
    "circuit_name": "Las Vegas Strip Street Circuit",
    "country": "USA",
    "date": "2026-11-22",
    "time_utc": "04:00:00Z",
    "status": "Scheduled",
    "ist_schedule": "2026-11-22 18:30 IST"
  },
  {
    "race_id": "2026-22",
    "round": 22,
    "name": "Qatar Grand Prix",
    "circuit_name": "Lusail International Circuit",
    "country": "Qatar",
    "date": "2026-11-29",
    "time_utc": "16:00:00Z",
    "status": "Scheduled",
    "ist_schedule": "2026-11-29 18:30 IST"
  },
  {
    "race_id": "2026-23",
    "round": 23,
    "name": "Abu Dhabi Grand Prix",
    "circuit_name": "Yas Marina Circuit",
    "country": "UAE",
    "date": "2026-12-06",
    "time_utc": "13:00:00Z",
    "status": "Scheduled",
    "ist_schedule": "2026-12-06 18:30 IST"
  }
];

export const FALLBACK_DRIVERS = [
  {
    "driver_id": "russell",
    "code": "RUS",
    "name": "George Russell",
    "permanent_number": 63,
    "nationality": "British",
    "team_name": "Mercedes",
    "color_hex": "#27F4D2",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "antonelli",
    "code": "ANT",
    "name": "Andrea Kimi Antonelli",
    "permanent_number": 12,
    "nationality": "Italian",
    "team_name": "Mercedes",
    "color_hex": "#27F4D2",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "leclerc",
    "code": "LEC",
    "name": "Charles Leclerc",
    "permanent_number": 16,
    "nationality": "Monegasque",
    "team_name": "Ferrari",
    "color_hex": "#E80020",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "hamilton",
    "code": "HAM",
    "name": "Lewis Hamilton",
    "permanent_number": 44,
    "nationality": "British",
    "team_name": "Ferrari",
    "color_hex": "#E80020",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "norris",
    "code": "NOR",
    "name": "Lando Norris",
    "permanent_number": 1,
    "nationality": "British",
    "team_name": "McLaren",
    "color_hex": "#FF8000",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "max_verstappen",
    "code": "VER",
    "name": "Max Verstappen",
    "permanent_number": 3,
    "nationality": "Dutch",
    "team_name": "Red Bull",
    "color_hex": "#3671C6",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "bearman",
    "code": "BEA",
    "name": "Oliver Bearman",
    "permanent_number": 87,
    "nationality": "British",
    "team_name": "Haas F1 Team",
    "color_hex": "#B6BABD",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "arvid_lindblad",
    "code": "LIN",
    "name": "Arvid Lindblad",
    "permanent_number": 41,
    "nationality": "British",
    "team_name": "RB F1 Team",
    "color_hex": "#6692FF",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "bortoleto",
    "code": "BOR",
    "name": "Gabriel Bortoleto",
    "permanent_number": 5,
    "nationality": "Brazilian",
    "team_name": "Audi",
    "color_hex": "#E10600",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "gasly",
    "code": "GAS",
    "name": "Pierre Gasly",
    "permanent_number": 10,
    "nationality": "French",
    "team_name": "Alpine F1 Team",
    "color_hex": "#0093CC",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "ocon",
    "code": "OCO",
    "name": "Esteban Ocon",
    "permanent_number": 31,
    "nationality": "French",
    "team_name": "Haas F1 Team",
    "color_hex": "#B6BABD",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "albon",
    "code": "ALB",
    "name": "Alexander Albon",
    "permanent_number": 23,
    "nationality": "Thai",
    "team_name": "Williams",
    "color_hex": "#64C4FF",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "lawson",
    "code": "LAW",
    "name": "Liam Lawson",
    "permanent_number": 30,
    "nationality": "New Zealander",
    "team_name": "Red Bull",
    "color_hex": "#3671C6",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "colapinto",
    "code": "COL",
    "name": "Franco Colapinto",
    "permanent_number": 43,
    "nationality": "Argentine",
    "team_name": "Alpine F1 Team",
    "color_hex": "#0093CC",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "sainz",
    "code": "SAI",
    "name": "Carlos Sainz",
    "permanent_number": 55,
    "nationality": "Spanish",
    "team_name": "Williams",
    "color_hex": "#64C4FF",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "perez",
    "code": "PER",
    "name": "Sergio P\u00e9rez",
    "permanent_number": 11,
    "nationality": "Mexican",
    "team_name": "Cadillac F1 Team",
    "color_hex": "#E10600",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "stroll",
    "code": "STR",
    "name": "Lance Stroll",
    "permanent_number": 18,
    "nationality": "Canadian",
    "team_name": "Aston Martin",
    "color_hex": "#229971",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "alonso",
    "code": "ALO",
    "name": "Fernando Alonso",
    "permanent_number": 14,
    "nationality": "Spanish",
    "team_name": "Aston Martin",
    "color_hex": "#229971",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "bottas",
    "code": "BOT",
    "name": "Valtteri Bottas",
    "permanent_number": 77,
    "nationality": "Finnish",
    "team_name": "Cadillac F1 Team",
    "color_hex": "#E10600",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "hadjar",
    "code": "HAD",
    "name": "Isack Hadjar",
    "permanent_number": 6,
    "nationality": "French",
    "team_name": "Red Bull",
    "color_hex": "#3671C6",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "piastri",
    "code": "PIA",
    "name": "Oscar Piastri",
    "permanent_number": 81,
    "nationality": "Australian",
    "team_name": "McLaren",
    "color_hex": "#FF8000",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "hulkenberg",
    "code": "HUL",
    "name": "Nico H\u00fclkenberg",
    "permanent_number": 27,
    "nationality": "German",
    "team_name": "Audi",
    "color_hex": "#E10600",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  },
  {
    "driver_id": "tsunoda",
    "code": "TSU",
    "name": "Yuki Tsunoda",
    "permanent_number": 22,
    "nationality": "Japanese",
    "team_name": "RB F1 Team",
    "color_hex": "#6692FF",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "total_poles": 0
  }
];

export const FALLBACK_CONSTRUCTORS = [
  {
    "constructor_id": "mercedes",
    "name": "Mercedes",
    "nationality": "German",
    "color_hex": "#27F4D2",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "George Russell, Andrea Kimi Antonelli"
  },
  {
    "constructor_id": "ferrari",
    "name": "Ferrari",
    "nationality": "Italian",
    "color_hex": "#E80020",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Charles Leclerc, Lewis Hamilton"
  },
  {
    "constructor_id": "mclaren",
    "name": "McLaren",
    "nationality": "British",
    "color_hex": "#FF8000",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Lando Norris, Oscar Piastri"
  },
  {
    "constructor_id": "red_bull",
    "name": "Red Bull",
    "nationality": "Austrian",
    "color_hex": "#3671C6",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Max Verstappen, Liam Lawson, Isack Hadjar"
  },
  {
    "constructor_id": "haas",
    "name": "Haas F1 Team",
    "nationality": "American",
    "color_hex": "#B6BABD",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Oliver Bearman, Esteban Ocon"
  },
  {
    "constructor_id": "rb",
    "name": "RB F1 Team",
    "nationality": "Italian",
    "color_hex": "#6692FF",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Arvid Lindblad, Yuki Tsunoda"
  },
  {
    "constructor_id": "audi",
    "name": "Audi",
    "nationality": "German",
    "color_hex": "#E10600",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Gabriel Bortoleto, Nico H\u00fclkenberg"
  },
  {
    "constructor_id": "alpine",
    "name": "Alpine F1 Team",
    "nationality": "French",
    "color_hex": "#0093CC",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Pierre Gasly, Franco Colapinto"
  },
  {
    "constructor_id": "williams",
    "name": "Williams",
    "nationality": "British",
    "color_hex": "#64C4FF",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Alexander Albon, Carlos Sainz"
  },
  {
    "constructor_id": "cadillac",
    "name": "Cadillac F1 Team",
    "nationality": "American",
    "color_hex": "#E10600",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Sergio P\u00e9rez, Valtteri Bottas"
  },
  {
    "constructor_id": "aston_martin",
    "name": "Aston Martin",
    "nationality": "British",
    "color_hex": "#229971",
    "power_unit": "Formula 1 Hybrid PU",
    "total_wins": 0,
    "total_podiums": 0,
    "total_championships": 0,
    "drivers": "Lance Stroll, Fernando Alonso"
  }
];

export const FALLBACK_CIRCUITS = [
  {
    "circuit_id": "albert_park",
    "name": "Albert Park Grand Prix Circuit",
    "location": "Melbourne",
    "country": "Australia",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "americas",
    "name": "Circuit of the Americas",
    "location": "Austin",
    "country": "USA",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "baku",
    "name": "Baku City Circuit",
    "location": "Baku",
    "country": "Azerbaijan",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "catalunya",
    "name": "Circuit de Barcelona-Catalunya",
    "location": "Barcelona",
    "country": "Spain",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "hungaroring",
    "name": "Hungaroring",
    "location": "Budapest",
    "country": "Hungary",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "interlagos",
    "name": "Aut\u00f3dromo Jos\u00e9 Carlos Pace",
    "location": "S\u00e3o Paulo",
    "country": "Brazil",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "losail",
    "name": "Lusail International Circuit",
    "location": "Lusail",
    "country": "Qatar",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "madring",
    "name": "Madring",
    "location": "Madrid",
    "country": "Spain",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "marina_bay",
    "name": "Marina Bay Street Circuit",
    "location": "Marina Bay",
    "country": "Singapore",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "miami",
    "name": "Miami International Autodrome",
    "location": "Miami",
    "country": "USA",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "monaco",
    "name": "Circuit de Monaco",
    "location": "Monte Carlo",
    "country": "Monaco",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "monza",
    "name": "Autodromo Nazionale di Monza",
    "location": "Monza",
    "country": "Italy",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "red_bull_ring",
    "name": "Red Bull Ring",
    "location": "Spielberg",
    "country": "Austria",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "rodriguez",
    "name": "Aut\u00f3dromo Hermanos Rodr\u00edguez",
    "location": "Mexico City",
    "country": "Mexico",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "sepang",
    "name": "Sepang International Circuit",
    "location": "Kuala Lumpur",
    "country": "Malaysia",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "shanghai",
    "name": "Shanghai International Circuit",
    "location": "Shanghai",
    "country": "China",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "silverstone",
    "name": "Silverstone Circuit",
    "location": "Silverstone",
    "country": "UK",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "spa",
    "name": "Circuit de Spa-Francorchamps",
    "location": "Spa",
    "country": "Belgium",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "suzuka",
    "name": "Suzuka Circuit",
    "location": "Suzuka",
    "country": "Japan",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "vegas",
    "name": "Las Vegas Strip Street Circuit",
    "location": "Las Vegas",
    "country": "USA",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "villeneuve",
    "name": "Circuit Gilles Villeneuve",
    "location": "Montreal",
    "country": "Canada",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "yas_marina",
    "name": "Yas Marina Circuit",
    "location": "Abu Dhabi",
    "country": "UAE",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  },
  {
    "circuit_id": "zandvoort",
    "name": "Circuit Park Zandvoort",
    "location": "Zandvoort",
    "country": "Netherlands",
    "length_km": 5.4,
    "turns": 18,
    "lap_record_time": "1:30.000",
    "lap_record_driver": "Max Verstappen"
  }
];

export const FALLBACK_RACE_DETAILS = {
  race_id: "2026_18",
  round: 18,
  name: "United States Grand Prix",
  date: "2026-10-25",
  status: "Confirmed",
  circuit: {
    name: "Circuit of the Americas",
    location: "Austin, Texas",
    country: "USA",
    timezone: "America/Chicago (UTC-5)",
    length_km: 5.513,
    turns: 20,
    laps: 56,
    lap_record: "1:36.169 (Charles Leclerc, 2019)"
  },
  ist_race_time: "Monday, 26 October 00:30 IST",
  weekend_schedule: [
    { day: "FRI", session: "Practice 1", utc: "17:30 UTC", ist: "23:00 IST" },
    { day: "FRI", session: "Sprint Qualifying", utc: "21:30 UTC", ist: "03:00 IST (+1d)" },
    { day: "SAT", session: "Sprint Race", utc: "18:00 UTC", ist: "23:30 IST" },
    { day: "SAT", session: "Grand Prix Qualifying", utc: "22:00 UTC", ist: "03:30 IST (+1d)" },
    { day: "SUN", session: "Grand Prix Race", utc: "19:00 UTC", ist: "00:30 IST (Mon)" }
  ],
  sessions: [
    { session_name: "Practice 1", scheduled_utc: "2026-10-23T17:30:00Z", status: "Scheduled" },
    { session_name: "Sprint Qualifying", scheduled_utc: "2026-10-23T21:30:00Z", status: "Scheduled" },
    { session_name: "Sprint Race", scheduled_utc: "2026-10-24T18:00:00Z", status: "Scheduled" },
    { session_name: "Qualifying", scheduled_utc: "2026-10-24T22:00:00Z", status: "Scheduled" },
    { session_name: "Grand Prix Race", scheduled_utc: "2026-10-25T19:00:00Z", status: "Scheduled" }
  ]
};

export const FALLBACK_RACE_RESULTS = {
  race_id: "2026_17",
  round: 17,
  race_name: "Singapore Grand Prix",
  classifications: [
    { position: 1, position_text: "1", driver_id: "norris", driver_name: "Lando Norris", driver_code: "NOR", constructor_name: "McLaren", constructor_color: "#FF8000", grid: 1, laps: 62, time_str: "1:44:42.568", points: 25 },
    { position: 2, position_text: "2", driver_id: "max_verstappen", driver_name: "Max Verstappen", driver_code: "VER", constructor_name: "Red Bull Racing", constructor_color: "#3671C6", grid: 2, laps: 62, time_str: "+20.945", points: 18 },
    { position: 3, position_text: "3", driver_id: "piastri", driver_name: "Oscar Piastri", driver_code: "PIA", constructor_name: "McLaren", constructor_color: "#FF8000", grid: 5, laps: 62, time_str: "+41.823", points: 15 },
    { position: 4, position_text: "4", driver_id: "russell", driver_name: "George Russell", driver_code: "RUS", constructor_name: "Mercedes", constructor_color: "#27F4D2", grid: 4, laps: 62, time_str: "+1:01.040", points: 12 },
    { position: 5, position_text: "5", driver_id: "leclerc", driver_name: "Charles Leclerc", driver_code: "LEC", constructor_name: "Ferrari", constructor_color: "#E80020", grid: 9, laps: 62, time_str: "+1:02.430", points: 10 }
  ]
};

export const FALLBACK_SIMULATION_RESULT = {
  status: "SUCCESS",
  rounds_simulated: 6,
  champion: {
    driver_id: "max_verstappen",
    name: "Max Verstappen",
    code: "VER",
    team: "Red Bull Racing",
    starting_position: 1,
    projected_position: 1,
    position_change: 0,
    starting_points: 331,
    projected_points: 448,
    points_gained: 117,
    projected_wins: 10
  },
  projected_standings: [
    {
      driver_id: "max_verstappen",
      name: "Max Verstappen",
      code: "VER",
      team: "Red Bull Racing",
      starting_position: 1,
      projected_position: 1,
      position_change: 0,
      starting_points: 331,
      projected_points: 448,
      points_gained: 117,
      projected_wins: 10
    },
    {
      driver_id: "norris",
      name: "Lando Norris",
      code: "NOR",
      team: "McLaren",
      starting_position: 2,
      projected_position: 2,
      position_change: 0,
      starting_points: 279,
      projected_points: 402,
      points_gained: 123,
      projected_wins: 5
    },
    {
      driver_id: "leclerc",
      name: "Charles Leclerc",
      code: "LEC",
      team: "Ferrari",
      starting_position: 3,
      projected_position: 3,
      position_change: 0,
      starting_points: 245,
      projected_points: 355,
      points_gained: 110,
      projected_wins: 3
    }
  ]
};

export const FALLBACK_MONTE_CARLO_RESPONSE = {
  iterations: 10000,
  execution_duration_sec: 0.12,
  remaining_rounds: 6,
  assumptions: [
    "Grid order weighted by historical qualifying pace with circuit-specific tyre degradation decay",
    "DNF probability calibrated against 2026 hybrid power unit reliability rates (3.8% baseline)",
    "Safety car probability derived from 10-year circuit history (COTA: 48%, Interlagos: 72%, Vegas: 65%)"
  ],
  drivers: [
    {
      driver_id: "max_verstappen",
      name: "Max Verstappen",
      code: "VER",
      team: "Red Bull Racing",
      current_points: 331,
      championship_prob_pct: 78.4,
      top3_prob_pct: 99.2,
      expected_final_points: 448,
      points_std_dev: 24.5,
      expected_championship_position: 1.2,
      sample_points_distribution: [420, 435, 448, 460, 480]
    },
    {
      driver_id: "norris",
      name: "Lando Norris",
      code: "NOR",
      team: "McLaren",
      current_points: 279,
      championship_prob_pct: 18.2,
      top3_prob_pct: 92.5,
      expected_final_points: 402,
      points_std_dev: 28.1,
      expected_championship_position: 2.1,
      sample_points_distribution: [375, 390, 402, 420, 445]
    },
    {
      driver_id: "leclerc",
      name: "Charles Leclerc",
      code: "LEC",
      team: "Ferrari",
      current_points: 245,
      championship_prob_pct: 3.4,
      top3_prob_pct: 68.0,
      expected_final_points: 355,
      points_std_dev: 31.4,
      expected_championship_position: 3.2,
      sample_points_distribution: [320, 340, 355, 375, 410]
    }
  ]
};

export const FALLBACK_DRIVER_COMPARISON = {
  driver_a: {
    id: "max_verstappen",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    position: 1,
    points: 331,
    wins: 7,
    podiums: 13,
    max_achievable: 530,
    status: "CONTENDER",
    avg_grid: 2.4,
    avg_finish: 2.1,
    positions_gained: 5,
    finishing_distribution: { P1: 7, P2: 4, P3: 2, Top10: 3, DNF: 1 }
  },
  driver_b: {
    id: "norris",
    name: "Lando Norris",
    team: "McLaren",
    position: 2,
    points: 279,
    wins: 3,
    podiums: 12,
    max_achievable: 478,
    status: "CONTENDER",
    avg_grid: 2.1,
    avg_finish: 2.5,
    positions_gained: -7,
    finishing_distribution: { P1: 3, P2: 5, P3: 4, Top10: 5, DNF: 0 }
  },
  head_to_head: {
    qualifying_battle: [10, 7],
    race_finish_battle: [11, 6],
    points_ratio: 1.18,
    podiums_battle: [13, 12],
    wins_battle: [7, 3]
  },
  season_points_progression: Array.from({ length: 17 }, (_, i) => ({
    round: i + 1,
    driver_a_cumulative: Math.round((331 / 17) * (i + 1)),
    driver_b_cumulative: Math.round((279 / 17) * (i + 1))
  }))
};
