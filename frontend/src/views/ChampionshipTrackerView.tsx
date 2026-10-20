import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  Sliders,
  ChevronRight,
  Flame,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  fetchChampionshipTracker,
  fetchTitleScenarios,
  simulateInteractiveScenario,
  runMonteCarloSimulation,
  fetchDriverComparison,
  fetchHistoricalChampionship
} from '../services/api';
import {
  ChampionshipTrackerData,
  ChampionshipDriver,
  TitleScenariosResponse,
  InteractiveSimulationResult,
  MonteCarloResponse,
  DriverComparisonData
} from '../types';

export const ChampionshipTrackerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'simulator' | 'probability' | 'comparison' | 'history'>('overview');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('max_verstappen');
  const [trackerData, setTrackerData] = useState<ChampionshipTrackerData | null>(null);
  const [scenariosData, setScenariosData] = useState<TitleScenariosResponse | null>(null);
  const [simulationResult, setSimulationResult] = useState<InteractiveSimulationResult | null>(null);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<DriverComparisonData | null>(null);
  const [comparisonRivalId, setComparisonRivalId] = useState<string>('antonelli');
  const [historicalSeason, setHistoricalSeason] = useState<number>(2025);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mcLoading, setMcLoading] = useState<boolean>(false);
  const [simPreset, setSimPreset] = useState<string>('max_wins_austin');

  // Load tracker and scenario data
  const loadTracker = (driverId: string = selectedDriverId) => {
    setLoading(true);
    Promise.all([
      fetchChampionshipTracker(driverId),
      fetchTitleScenarios(driverId),
      fetchDriverComparison(driverId, comparisonRivalId)
    ])
      .then(([tData, sData, cData]) => {
        setTrackerData(tData);
        setScenariosData(sData);
        setComparisonData(cData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load championship tracker:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTracker(selectedDriverId);
  }, [selectedDriverId]);

  // Load default simulation on mount
  useEffect(() => {
    simulateInteractiveScenario({ preset: 'max_wins_austin', target_driver_id: selectedDriverId })
      .then((res) => setSimulationResult(res))
      .catch((err) => console.error('Sim error:', err));
  }, [selectedDriverId]);

  // Load Monte Carlo when tab selected
  useEffect(() => {
    if (activeTab === 'probability' && !monteCarloResult) {
      handleRunMonteCarlo(1000);
    }
  }, [activeTab]);

  // Load historical when season changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoricalChampionship(historicalSeason)
        .then((res) => setHistoricalData(res))
        .catch((err) => console.error('History error:', err));
    }
  }, [activeTab, historicalSeason]);

  const handleRunMonteCarlo = (runs: number = 10000) => {
    setMcLoading(true);
    runMonteCarloSimulation({ iterations: runs, random_seed: 42 })
      .then((res) => {
        setMonteCarloResult(res);
        setMcLoading(false);
      })
      .catch(() => setMcLoading(false));
  };

  const handleRunPreset = (presetKey: string) => {
    setSimPreset(presetKey);
    simulateInteractiveScenario({ preset: presetKey, target_driver_id: selectedDriverId })
      .then((res) => setSimulationResult(res))
      .catch((err) => console.error('Sim preset error:', err));
  };

  const handleRivalChange = (rivalId: string) => {
    setComparisonRivalId(rivalId);
    fetchDriverComparison(selectedDriverId, rivalId)
      .then((res) => setComparisonData(res))
      .catch((err) => console.error('Comparison error:', err));
  };

  if (loading && !trackerData) {
    return (
      <div className="p-16 text-center text-xs text-[#64748b] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#e10600]" />
        <span>Calculating FIA World Championship Standings & Title Scenarios...</span>
      </div>
    );
  }

  const selectedDriver = trackerData?.selected_driver;
  const isMax = selectedDriver?.driver_id === 'max_verstappen';

  return (
    <div className="space-y-6">
      {/* Header & Driver Spotlight Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1f2530]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#e10600]/20 text-[#e10600] rounded border border-[#e10600]/40 uppercase tracking-wider">
              FIA 2026 TITLE BATTLE
            </span>
            <span className="text-xs text-[#94a3b8] font-mono">ROUND 17 COMPLETED / 6 REMAINING</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide mt-1 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-[#f59e0b]" />
            <span>F1 Championship Tracker &amp; Max Verstappen Title Scenarios</span>
          </h1>
          <p className="text-xs text-[#94a3b8]">
            Live mathematical eligibility, points swing boundaries, Monte Carlo probabilities, and tactical championship paths
          </p>
        </div>

        {/* Driver Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-[#64748b] font-semibold">TRACK DRIVER:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-[#151922] border border-[#2d3748] rounded px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:border-[#e10600] transition"
          >
            {trackerData?.standings.map((d) => (
              <option key={d.driver_id} value={d.driver_id}>
                {d.driver_id === 'max_verstappen' ? '★ ' : ''}P{d.position} - {d.name} ({d.team})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadTracker()}
            className="p-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-white transition cursor-pointer"
            title="Refresh Standings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Spotlight Card: Target Driver (Default Max Verstappen) */}
      {selectedDriver && (
        <div className={`p-5 rounded-xl border relative overflow-hidden shadow-lg ${
          isMax
            ? 'bg-gradient-to-r from-[#0c121e] via-[#10192a] to-[#1a120c] border-[#f59e0b]/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            : 'bg-[#12151b] border-[#1f2530]'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Driver Identity */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-full tracking-wider uppercase ${
                  selectedDriver.status === 'CONTENDER'
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : selectedDriver.status === 'CLINCHED'
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                }`}>
                  {selectedDriver.status === 'CONTENDER' ? '● TITLE CONTENDER' : selectedDriver.status === 'CLINCHED' ? '★ WORLD CHAMPION' : '✕ MATHEMATICALLY ELIMINATED'}
                </span>
                {isMax && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] rounded border border-[#f59e0b]/30">
                    RED BULL RACING #1 / #33
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                {selectedDriver.name} <span className="text-sm font-semibold text-[#94a3b8]">({selectedDriver.team})</span>
              </h2>
              <p className="text-xs text-[#94a3b8]">
                {selectedDriver.status === 'CONTENDER'
                  ? `Mathematically eligible to win the 2026 Drivers' World Championship. 180 points remaining across 6 Grands Prix and 3 Sprints.`
                  : selectedDriver.eliminated_at}
              </p>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-[#0b0e14]/70 border border-[#232b38] rounded-lg p-3">
                <div className="text-[10px] font-bold text-[#64748b] uppercase">Current Points</div>
                <div className="text-xl font-black font-mono text-white mt-0.5">{selectedDriver.current_points}</div>
                <div className="text-[10px] text-[#94a3b8] font-mono">Rank: P{selectedDriver.position} ({selectedDriver.wins} Wins)</div>
              </div>

              <div className="bg-[#0b0e14]/70 border border-[#232b38] rounded-lg p-3">
                <div className="text-[10px] font-bold text-[#64748b] uppercase">Gap to Leader</div>
                <div className={`text-xl font-black font-mono mt-0.5 ${selectedDriver.points_gap_to_leader === 0 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                  {selectedDriver.points_gap_to_leader === 0 ? 'LEADER' : `-${selectedDriver.points_gap_to_leader}`}
                </div>
                <div className="text-[10px] text-[#94a3b8] font-mono">Leader: {trackerData?.summary.leader?.name}</div>
              </div>

              <div className="bg-[#0b0e14]/70 border border-[#232b38] rounded-lg p-3">
                <div className="text-[10px] font-bold text-[#64748b] uppercase">Max Achievable</div>
                <div className="text-xl font-black font-mono text-[#38bdf8] mt-0.5">{selectedDriver.max_achievable_points}</div>
                <div className="text-[10px] text-[#94a3b8] font-mono">+180 pts possible</div>
              </div>

              <div className="bg-[#0b0e14]/70 border border-[#232b38] rounded-lg p-3">
                <div className="text-[10px] font-bold text-[#64748b] uppercase">Survival Buffer</div>
                <div className="text-xl font-black font-mono text-[#10b981] mt-0.5">
                  +{scenariosData?.survival_cushion_points || 61.0} pts
                </div>
                <div className="text-[10px] text-[#94a3b8] font-mono">Before elimination</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#1f2530] overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Championship Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'scenarios'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Max Verstappen Title Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Race-by-Race Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('probability')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'probability'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Title Probability (Monte Carlo)</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Driver Head-to-Head</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-bold rounded-t transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#1a2230] text-white border-b-2 border-[#e10600]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Championship History</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: CHAMPIONSHIP OVERVIEW & STANDINGS TABLE */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && trackerData && (
        <div className="space-y-6">
          {/* Summary Alert */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Official FIA 2026 Season Standing State</h4>
                <p className="text-[11px] text-[#94a3b8]">
                  {trackerData.summary.active_contenders_count} drivers remain mathematically in contention for the Drivers' World Championship.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-[#64748b] font-mono">
              Provenance: <strong className="text-white">{trackerData.data_provenance.source}</strong> (Round 17 Validated)
            </div>
          </div>

          {/* Standings Table */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
            <div className="p-4 border-b border-[#1f2530] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">2026 World Drivers' Championship Standings</h3>
                <p className="text-[11px] text-[#64748b]">Mathematical points ceiling, gaps, and elimination boundaries</p>
              </div>
              <span className="text-[10px] font-mono text-[#64748b]">6 RACES / 3 SPRINTS REMAINING</span>
            </div>

            <table className="w-full text-left text-xs table-f1">
              <thead>
                <tr>
                  <th>POS</th>
                  <th>DRIVER</th>
                  <th>TEAM</th>
                  <th className="text-right">PTS</th>
                  <th className="text-right">GAP TO LEAD</th>
                  <th className="text-right">AHEAD</th>
                  <th className="text-right">BEHIND</th>
                  <th className="text-center">WINS</th>
                  <th className="text-right">MAX POSSIBLE</th>
                  <th className="text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.standings.map((d) => {
                  const isHighlighted = d.driver_id === selectedDriverId;
                  const isVerstappen = d.driver_id === 'max_verstappen';
                  return (
                    <tr
                      key={d.driver_id}
                      onClick={() => setSelectedDriverId(d.driver_id)}
                      className={`cursor-pointer transition ${
                        isHighlighted
                          ? 'bg-[#1e293b]/70 border-l-4 border-l-[#f59e0b]'
                          : isVerstappen
                          ? 'bg-[#181a24] hover:bg-[#202735]'
                          : 'hover:bg-[#151922]'
                      }`}
                    >
                      <td className="font-mono font-bold text-white">
                        {d.position === 1 ? '🥇 1' : d.position === 2 ? '🥈 2' : d.position === 3 ? '🥉 3' : d.position}
                      </td>
                      <td className="font-semibold text-white">
                        <div className="flex items-center space-x-1.5">
                          <span>{d.name}</span>
                          {isVerstappen && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] rounded">
                              VER 33
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-[#94a3b8]">{d.team}</td>
                      <td className="text-right font-mono font-black text-white">{d.current_points}</td>
                      <td className="text-right font-mono text-[#f59e0b]">
                        {d.points_gap_to_leader === 0 ? '-' : `-${d.points_gap_to_leader}`}
                      </td>
                      <td className="text-right font-mono text-[#64748b]">
                        {d.points_gap_to_ahead === 0 ? '-' : `-${d.points_gap_to_ahead}`}
                      </td>
                      <td className="text-right font-mono text-[#64748b]">
                        {d.points_gap_to_behind === 0 ? '-' : `+${d.points_gap_to_behind}`}
                      </td>
                      <td className="text-center font-mono font-bold text-white">{d.wins}</td>
                      <td className="text-right font-mono font-bold text-[#38bdf8]">{d.max_achievable_points}</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          d.status === 'CONTENDER'
                            ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                            : d.status === 'CLINCHED'
                            ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                            : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remaining Calendar Matrix */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Remaining 2026 Championship Calendar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trackerData.remaining_calendar.map((r) => (
                <div key={r.round} className="p-3 bg-[#0d1016] border border-[#1f2530] rounded-lg">
                  <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono">
                    <span>ROUND {r.round}</span>
                    {r.has_sprint && (
                      <span className="px-1.5 py-0.2 bg-[#a855f7]/20 text-[#a855f7] rounded font-bold">
                        SPRINT WEEKEND (+8 PTS)
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{r.name}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">{r.circuit_name}</div>
                  <div className="text-[10px] text-[#38bdf8] font-mono mt-2">
                    Date: {r.date} | Max Points: {r.has_sprint ? '34 PTS' : '26 PTS'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: MAX VERSTAPPEN TITLE SCENARIOS */}
      {/* ==================================================================== */}
      {activeTab === 'scenarios' && scenariosData && (
        <div className="space-y-6">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#e10600]" />
                <span>Tactical Scenario Engine: Path to the 2026 World Championship</span>
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Evaluates every major race scenario, point swing, leader retirement, and elimination risk
              </p>
            </div>
            <div className="text-xs font-mono text-[#f59e0b] bg-[#1a202c] px-3 py-1.5 rounded border border-[#2d3748]">
              Current Deficit: <strong>{scenariosData.starting_deficit} PTS</strong> (180 Available)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenariosData.scenarios.map((scen) => (
              <div
                key={scen.id}
                className="bg-[#12151b] border border-[#1f2530] hover:border-[#2d3748] rounded-lg p-5 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      scen.category === 'BEST_CASE'
                        ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                        : scen.category === 'TACTICAL_SWING'
                        ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                        : scen.category === 'RIVAL_MISFORTUNE'
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                        : scen.category === 'ELIMINATION_RISK'
                        ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                        : 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
                    }`}>
                      {scen.category.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-mono font-bold ${scen.target_wins_championship ? 'text-[#10b981]' : 'text-white'}`}>
                      {scen.target_wins_championship ? '★ CHAMPIONSHIP WIN' : 'CONTENDER'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{scen.title}</h4>
                  <p className="text-xs text-[#94a3b8]">{scen.description}</p>
                </div>

                {/* Score Swing Bar */}
                <div className="bg-[#0b0e14] border border-[#1f2530] rounded p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Target Points Gain:</span>
                    <strong className="text-[#10b981]">+{scen.target_gained_points} pts ({scen.target_final_points} total)</strong>
                  </div>
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Leader Assumed Gain:</span>
                    <strong className="text-[#f59e0b]">+{scen.leader_assumed_gain} pts ({scen.leader_final_points} total)</strong>
                  </div>
                  <div className="flex justify-between border-t border-[#1f2530] pt-1">
                    <span className="text-white font-bold">New Points Margin:</span>
                    <strong className={scen.resulting_points_difference <= 0 ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
                      {scen.resulting_points_difference <= 0 ? `LEADS BY ${Math.abs(scen.resulting_points_difference)} PTS` : `TRAILS BY ${scen.resulting_points_difference} PTS`}
                    </strong>
                  </div>
                </div>

                {/* Plain-English Explanation */}
                <div className="p-3 bg-[#151922] border-l-2 border-l-[#e10600] rounded text-[11px] text-[#cbd5e1] leading-relaxed">
                  {scen.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: RACE-BY-RACE SIMULATOR */}
      {/* ==================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Quick Presets Bar */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Simulation Quick Actions</h3>
            <p className="text-xs text-[#94a3b8] mb-3">
              Apply realistic race outcomes to Austin, Mexico, Brazil, Las Vegas, Qatar, and Abu Dhabi
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleRunPreset('max_wins_austin')}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === 'max_wins_austin'
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                Max Wins Austin GP &amp; Sprint
              </button>

              <button
                onClick={() => handleRunPreset('max_wins_all')}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === 'max_wins_all'
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                Max Wins All 6 Remaining Races
              </button>

              <button
                onClick={() => handleRunPreset('max_wins_leader_dnf')}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === 'max_wins_leader_dnf'
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                Leader DNF in Austin (Max P1)
              </button>

              <button
                onClick={() => handleRunPreset('max_wins_leader_p5')}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === 'max_wins_leader_p5'
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                Max P1, Leader P5 (All Remaining)
              </button>

              <button
                onClick={() => handleRunPreset('max_p2')}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === 'max_p2'
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                Max Finishes P2 in All Sessions
              </button>
            </div>
          </div>

          {/* Projected Outcome Leaderboard */}
          {simulationResult && (
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
              <div className="p-4 border-b border-[#1f2530] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Projected Championship Standings</h3>
                  <p className="text-[11px] text-[#64748b]">Simulated outcomes factoring official points and countback tie-break</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded border border-[#10b981]/30">
                  PROJECTED CHAMPION: {simulationResult.champion.name} ({simulationResult.champion.projected_points} PTS)
                </div>
              </div>

              <table className="w-full text-left text-xs table-f1">
                <thead>
                  <tr>
                    <th>PROJ POS</th>
                    <th>DRIVER</th>
                    <th>TEAM</th>
                    <th className="text-right">START PTS</th>
                    <th className="text-right">PTS GAINED</th>
                    <th className="text-right">PROJECTED PTS</th>
                    <th className="text-center">PROJ WINS</th>
                    <th className="text-center">RANK SHIFT</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResult.projected_standings.map((p) => {
                    const isVer = p.driver_id === 'max_verstappen';
                    return (
                      <tr key={p.driver_id} className={isVer ? 'bg-[#1e293b]/70 font-semibold' : 'hover:bg-[#151922]'}>
                        <td className="font-mono font-bold text-white">P{p.projected_position}</td>
                        <td className="font-bold text-white">
                          {p.name} {isVer ? '★' : ''}
                        </td>
                        <td className="text-[#94a3b8]">{p.team}</td>
                        <td className="text-right font-mono text-[#64748b]">{p.starting_points}</td>
                        <td className="text-right font-mono text-[#10b981]">+{p.points_gained}</td>
                        <td className="text-right font-mono font-black text-white">{p.projected_points}</td>
                        <td className="text-center font-mono text-white">{p.projected_wins}</td>
                        <td className="text-center font-mono">
                          {p.position_change > 0 ? (
                            <span className="text-[#10b981] font-bold">▲ +{p.position_change}</span>
                          ) : p.position_change < 0 ? (
                            <span className="text-[#ef4444] font-bold">▼ {p.position_change}</span>
                          ) : (
                            <span className="text-[#64748b]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: TITLE PROBABILITY (MONTE CARLO) */}
      {/* ==================================================================== */}
      {activeTab === 'probability' && (
        <div className="space-y-6">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#a855f7]" />
                <span>Monte Carlo Title Probability Simulation</span>
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Stochastic modeling across remaining 6 Grands Prix and 3 Sprints incorporating pace weights and DNF hazard rates
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={mcLoading}
                onClick={() => handleRunMonteCarlo(1000)}
                className="px-3 py-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition cursor-pointer"
              >
                1,000 Runs
              </button>
              <button
                disabled={mcLoading}
                onClick={() => handleRunMonteCarlo(10000)}
                className="px-3 py-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition cursor-pointer"
              >
                10,000 Runs
              </button>
              <button
                disabled={mcLoading}
                onClick={() => handleRunMonteCarlo(50000)}
                className="px-3 py-1.5 bg-[#e10600] hover:bg-[#b50500] rounded text-xs font-bold text-white transition cursor-pointer"
              >
                50,000 Runs
              </button>
            </div>
          </div>

          {mcLoading ? (
            <div className="p-16 text-center text-xs text-[#64748b] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#a855f7]" />
              <span>Simulating thousands of season outcomes...</span>
            </div>
          ) : monteCarloResult ? (
            <div className="space-y-6">
              {/* Top Probabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {monteCarloResult.drivers.slice(0, 4).map((d) => (
                  <div key={d.driver_id} className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
                    <div className="flex items-center justify-between text-xs text-[#64748b]">
                      <span>{d.team}</span>
                      <span className="font-mono">P{d.expected_championship_position.toFixed(1)}</span>
                    </div>
                    <div className="text-lg font-bold text-white mt-1">{d.name}</div>
                    <div className="text-2xl font-black font-mono text-[#a855f7] mt-1">{d.championship_prob_pct}%</div>
                    <div className="text-[10px] text-[#94a3b8] mt-1 font-mono">
                      Top 3 Finish: {d.top3_prob_pct}% | Exp Points: {d.expected_final_points} (±{d.points_std_dev})
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulation Driver Probabilities Table */}
              <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
                <div className="p-4 border-b border-[#1f2530]">
                  <h3 className="text-sm font-bold text-white">Full Contender Probability Distribution</h3>
                  <p className="text-[11px] text-[#64748b]">
                    Executed {monteCarloResult.iterations.toLocaleString()} iterations in {monteCarloResult.execution_duration_sec}s
                  </p>
                </div>
                <table className="w-full text-left text-xs table-f1">
                  <thead>
                    <tr>
                      <th>DRIVER</th>
                      <th>TEAM</th>
                      <th className="text-right">CURRENT PTS</th>
                      <th className="text-right">TITLE WIN %</th>
                      <th className="text-right">TOP 3 FINISH %</th>
                      <th className="text-right">EXPECTED FINAL PTS</th>
                      <th className="text-center">EXP FINISH RANK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monteCarloResult.drivers.map((d) => (
                      <tr key={d.driver_id} className={d.driver_id === selectedDriverId ? 'bg-[#1e293b]/70 font-bold' : ''}>
                        <td className="text-white font-semibold">{d.name}</td>
                        <td className="text-[#94a3b8]">{d.team}</td>
                        <td className="text-right font-mono text-white">{d.current_points}</td>
                        <td className="text-right font-mono font-bold text-[#a855f7]">{d.championship_prob_pct}%</td>
                        <td className="text-right font-mono text-[#38bdf8]">{d.top3_prob_pct}%</td>
                        <td className="text-right font-mono text-white">{d.expected_final_points} pts</td>
                        <td className="text-center font-mono text-[#94a3b8]">P{d.expected_championship_position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Model Assumptions Card */}
              <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2">Documented Model Assumptions</h4>
                <ul className="list-disc list-inside space-y-1 text-[#94a3b8]">
                  {monteCarloResult.assumptions.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 5: DRIVER HEAD-TO-HEAD COMPARISON */}
      {/* ==================================================================== */}
      {activeTab === 'comparison' && comparisonData && (
        <div className="space-y-6">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#10b981]" />
                <span>Championship Head-to-Head &amp; Point Swing Analysis</span>
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Compare {comparisonData.driver_a.name} against any rival in the 2026 title fight
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-[#64748b] font-semibold">SELECT RIVAL:</label>
              <select
                value={comparisonRivalId}
                onChange={(e) => handleRivalChange(e.target.value)}
                className="bg-[#151922] border border-[#2d3748] rounded px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:border-[#10b981] transition"
              >
                {trackerData?.standings
                  .filter((d) => d.driver_id !== selectedDriverId)
                  .map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      P{d.position} - {d.name} ({d.team})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver A Card */}
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
              <div className="text-[10px] font-bold text-[#38bdf8] uppercase">Driver A</div>
              <h3 className="text-xl font-black text-white">{comparisonData.driver_a.name}</h3>
              <div className="text-xs text-[#94a3b8]">{comparisonData.driver_a.team}</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#1f2530]">
                <div>Points: <strong className="text-white">{comparisonData.driver_a.points}</strong></div>
                <div>Position: <strong className="text-white">P{comparisonData.driver_a.position}</strong></div>
                <div>Race Wins: <strong className="text-white">{comparisonData.driver_a.wins}</strong></div>
                <div>Podiums: <strong className="text-white">{comparisonData.driver_a.podiums}</strong></div>
              </div>
            </div>

            {/* Driver B Card */}
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
              <div className="text-[10px] font-bold text-[#f59e0b] uppercase">Driver B (Rival)</div>
              <h3 className="text-xl font-black text-white">{comparisonData.driver_b.name}</h3>
              <div className="text-xs text-[#94a3b8]">{comparisonData.driver_b.team}</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#1f2530]">
                <div>Points: <strong className="text-white">{comparisonData.driver_b.points}</strong></div>
                <div>Position: <strong className="text-white">P{comparisonData.driver_b.position}</strong></div>
                <div>Race Wins: <strong className="text-white">{comparisonData.driver_b.wins}</strong></div>
                <div>Podiums: <strong className="text-white">{comparisonData.driver_b.podiums}</strong></div>
              </div>
            </div>
          </div>

          {/* Tactical Swing Analysis Box */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Points Trajectory</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#0d1016] border border-[#1f2530] rounded">
                <div className="text-[#64748b]">Net Points Gap</div>
                <div className="text-xl font-black text-[#f59e0b] mt-1">{comparisonData.points_difference} pts</div>
              </div>
              <div className="p-3 bg-[#0d1016] border border-[#1f2530] rounded">
                <div className="text-[#64748b]">Required Swing / Race</div>
                <div className="text-xl font-black text-[#38bdf8] mt-1">{comparisonData.required_point_swing_per_round} pts</div>
              </div>
              <div className="p-3 bg-[#0d1016] border border-[#1f2530] rounded">
                <div className="text-[#64748b]">Races Needed (at P1 vs P3)</div>
                <div className="text-xl font-black text-[#10b981] mt-1">{comparisonData.races_needed_at_10pt_swing} races</div>
              </div>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed pt-2">
              {comparisonData.tactical_analysis}
            </p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 6: CHAMPIONSHIP HISTORY */}
      {/* ==================================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#64748b]" />
                <span>Historical World Championship Archives</span>
              </h3>
              <p className="text-xs text-[#94a3b8]">Official past championship standings and title winners (2021–2025)</p>
            </div>
            <div className="flex items-center space-x-2">
              {[2025, 2024, 2023].map((s) => (
                <button
                  key={s}
                  onClick={() => setHistoricalSeason(s)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    historicalSeason === s ? 'bg-[#e10600] text-white' : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {s} Season
                </button>
              ))}
            </div>
          </div>

          {historicalData && (
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
              <div className="p-4 border-b border-[#1f2530] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{historicalData.season} Final Standings</h3>
                  <p className="text-[11px] text-[#64748b]">Official season conclusion</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded border border-[#f59e0b]/30">
                  WORLD CHAMPION: {historicalData.champion.name} ({historicalData.champion.points} PTS)
                </div>
              </div>
              <table className="w-full text-left text-xs table-f1">
                <thead>
                  <tr>
                    <th>FINAL POS</th>
                    <th>DRIVER</th>
                    <th>TEAM</th>
                    <th className="text-right">POINTS</th>
                    <th className="text-center">WINS</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.standings.map((h: any) => (
                    <tr key={h.driver_id} className={h.driver_id === 'max_verstappen' ? 'bg-[#1e293b]/70 font-bold' : ''}>
                      <td className="font-mono font-bold text-white">P{h.position}</td>
                      <td className="text-white font-semibold">
                        {h.name} {h.driver_id === 'max_verstappen' ? '★' : ''}
                      </td>
                      <td className="text-[#94a3b8]">{h.team}</td>
                      <td className="text-right font-mono font-bold text-white">{h.points}</td>
                      <td className="text-center font-mono text-white">{h.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
