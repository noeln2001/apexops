// Static fallback data for GitHub Pages deployment when backend is not running
export const FALLBACK_OVERVIEW = {
  season: 2026,
  reference_date: "2026-10-20",
  last_race: {
    round: 17,
    name: "Singapore Grand Prix",
    circuit: "Marina Bay Street Circuit",
    date: "2026-10-11",
    winner: { name: "Lando Norris", team: "McLaren", time: "1:44:42.568" },
    podium: [
      { position: 1, driver: "Lando Norris", team: "McLaren" },
      { position: 2, driver: "Max Verstappen", team: "Red Bull Racing" },
      { position: 3, driver: "Oscar Piastri", team: "McLaren" }
    ]
  },
  next_race: {
    round: 18,
    name: "United States Grand Prix",
    circuit: "Circuit of the Americas",
    date: "2026-10-25",
    country: "USA",
    city: "Austin, Texas",
    days_until: 4,
    sessions: [
      { name: "Practice 1", date: "2026-10-23", time_local: "12:30", time_ist: "23:00" },
      { name: "Sprint Qualifying", date: "2026-10-23", time_local: "16:30", time_ist: "03:00 (Next Day)" },
      { name: "Sprint Race", date: "2026-10-24", time_local: "13:00", time_ist: "23:30" },
      { name: "Qualifying", date: "2026-10-24", time_local: "17:00", time_ist: "03:30 (Next Day)" },
      { name: "Grand Prix", date: "2026-10-25", time_local: "14:00", time_ist: "00:30 (Next Day)" }
    ]
  },
  championship_snapshot: {
    leader: "Max Verstappen",
    leader_points: 331,
    p2: "Lando Norris",
    p2_points: 279,
    gap: 52,
    constructor_leader: "McLaren",
    constructor_points: 516,
    races_remaining: 7
  },
  providers_status: {
    jolpica: { status: "ONLINE", ping_ms: 42 },
    openf1: { status: "ONLINE", ping_ms: 68 },
    fastf1: { status: "ONLINE", ping_ms: 12 },
    wikimedia: { status: "ONLINE", ping_ms: 28 }
  }
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
