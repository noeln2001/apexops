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
  { position: 1, driver: "Max Verstappen", code: "VER", number: 1, team: "Red Bull Racing", points: 331, wins: 7, podiums: 13, gap: 0 },
  { position: 2, driver: "Lando Norris", code: "NOR", number: 4, team: "McLaren", points: 279, wins: 3, podiums: 12, gap: -52 },
  { position: 3, driver: "Charles Leclerc", code: "LEC", number: 16, team: "Ferrari", points: 245, wins: 2, podiums: 9, gap: -86 },
  { position: 4, driver: "Oscar Piastri", code: "PIA", number: 81, team: "McLaren", points: 237, wins: 2, podiums: 7, gap: -94 },
  { position: 5, driver: "Carlos Sainz", code: "SAI", number: 55, team: "Ferrari", points: 190, wins: 1, podiums: 6, gap: -141 },
  { position: 6, driver: "Lewis Hamilton", code: "HAM", number: 44, team: "Mercedes", points: 174, wins: 2, podiums: 4, gap: -157 },
  { position: 7, driver: "George Russell", code: "RUS", number: 63, team: "Mercedes", points: 155, wins: 1, podiums: 3, gap: -176 },
  { position: 8, driver: "Sergio Perez", code: "PER", number: 11, team: "Red Bull Racing", points: 144, wins: 0, podiums: 4, gap: -187 }
];

export const FALLBACK_CONSTRUCTOR_STANDINGS = [
  { position: 1, team: "McLaren", points: 516, wins: 5, podiums: 19, gap: 0 },
  { position: 2, team: "Red Bull Racing", points: 475, wins: 7, podiums: 17, gap: -41 },
  { position: 3, team: "Ferrari", points: 435, wins: 3, podiums: 15, gap: -81 },
  { position: 4, team: "Mercedes", points: 329, wins: 3, podiums: 7, gap: -187 },
  { position: 5, team: "Aston Martin", points: 86, wins: 0, podiums: 0, gap: -430 }
];

export const FALLBACK_CHAMPIONSHIP_TRACKER = {
  driver: {
    id: "max_verstappen",
    name: "Max Verstappen",
    code: "VER",
    number: 1,
    team: "Red Bull Racing",
    points: 331,
    wins: 7,
    podiums: 13,
    position: 1
  },
  title_rivals: [
    { id: "norris", name: "Lando Norris", team: "McLaren", points: 279, gap_to_max: -52, position: 2 },
    { id: "leclerc", name: "Charles Leclerc", team: "Ferrari", points: 245, gap_to_max: -86, position: 3 },
    { id: "piastri", name: "Oscar Piastri", team: "McLaren", points: 237, gap_to_max: -94, position: 4 }
  ],
  remaining_math: {
    total_races_left: 7,
    sprint_races_left: 3,
    max_available_points: 199,
    max_verstappen_clinch_number: 148,
    elimination_threshold: 199
  },
  monte_carlo: {
    iterations: 10000,
    max_title_probability: 88.4,
    norris_title_probability: 9.8,
    leclerc_title_probability: 1.8,
    mean_projected_points: 442.6,
    earliest_clinch_round: "Round 21 (Brazil GP)"
  },
  scenarios: [
    { condition: "Max finishes P1 in all remaining races", outcome: "Clinched at Round 21 (Brazil GP) with 3 races to spare" },
    { condition: "Max finishes on podium (avg P2) and Norris wins 3 races", outcome: "Clinched at Round 22 (Las Vegas GP)" },
    { condition: "Max suffers 1 DNF and averages P3 thereafter", outcome: "Decided at Round 24 (Abu Dhabi GP) - 67% probability" }
  ]
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
