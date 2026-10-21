import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Zap,
  Cpu,
  Calendar,
  RefreshCw,
  Sliders,
  Target
} from 'lucide-react';
import {
  fetchChampionshipTracker,
  fetchTitleScenarios,
  simulateInteractiveScenario,
  runMonteCarloSimulation,
  fetchDriverComparison,
  fetchHistoricalChampionship,
  fetchHistoricalChampionsSummary
} from '../services/api';
import {
  ChampionshipTrackerData,
  TitleScenariosResponse,
  InteractiveSimulationResult,
  MonteCarloResponse,
  DriverComparisonData
} from '../types';
import {
  DriverStandingsTable,
  TitleScenariosCard,
  MonteCarloSimulator,
  DriverComparisonCard,
  HistoricalChampionsView
} from './championship';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

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
  const [championsList, setChampionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mcLoading, setMcLoading] = useState<boolean>(false);
  const [simPreset, setSimPreset] = useState<string>('max_wins_austin');

  const loadTracker = useCallback((driverId: string, rivalId: string) => {
    setLoading(true);
    Promise.all([
      fetchChampionshipTracker(driverId),
      fetchTitleScenarios(driverId),
      fetchDriverComparison(driverId, rivalId)
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
  }, []);

  useEffect(() => {
    loadTracker(selectedDriverId, comparisonRivalId);
  }, [selectedDriverId, loadTracker, comparisonRivalId]);

  useEffect(() => {
    simulateInteractiveScenario({ preset: 'max_wins_austin', target_driver_id: selectedDriverId })
      .then((res) => setSimulationResult(res))
      .catch((err) => console.error('Sim error:', err));
  }, [selectedDriverId]);

  const handleRunMonteCarlo = useCallback((runs: number = 10000) => {
    setMcLoading(true);
    runMonteCarloSimulation({ iterations: runs, random_seed: 42 })
      .then((res) => {
        setMonteCarloResult(res);
        setMcLoading(false);
      })
      .catch(() => setMcLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'probability' && !monteCarloResult) {
      handleRunMonteCarlo(1000);
    }
  }, [activeTab, monteCarloResult, handleRunMonteCarlo]);

  useEffect(() => {
    if (activeTab === 'history') {
      if (championsList.length === 0) {
        fetchHistoricalChampionsSummary()
          .then((res) => setChampionsList(res))
          .catch((err) => console.error('Champions list error:', err));
      }
      fetchHistoricalChampionship(historicalSeason)
        .then((res) => setHistoricalData(res))
        .catch((err) => console.error('History error:', err));
    }
  }, [activeTab, historicalSeason, championsList.length]);

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
      <div className="space-y-4">
        <LoadingSkeleton lines={8} />
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
            Official FIA mathematical points tracker, live elimination thresholds, and title clinch permutations
          </p>
        </div>

        {/* Driver Selector */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-[#64748b]">Focus Driver</div>
            <div className="text-xs font-semibold text-white">Select title candidate</div>
          </div>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-[#12151b] border border-[#2d3748] rounded-lg px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer hover:border-[#f59e0b] transition shadow-sm"
          >
            {(trackerData?.standings || []).map((d) => (
              <option key={d.driver_id} value={d.driver_id}>
                P{d.position} - {d.name} ({d.team})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadTracker(selectedDriverId, comparisonRivalId)}
            className="p-2 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded-lg text-white transition cursor-pointer"
            title="Refresh Championship Calculator"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#f59e0b]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Driver Spotlight Banner */}
      {selectedDriver && (
        <div className={`p-6 rounded-xl border relative overflow-hidden transition-all ${
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

      {/* Active Tab Views */}
      {activeTab === 'overview' && trackerData && (
        <DriverStandingsTable
          trackerData={trackerData}
          selectedDriverId={selectedDriverId}
          onSelectDriver={(id) => setSelectedDriverId(id)}
        />
      )}

      {activeTab === 'scenarios' && scenariosData && (
        <TitleScenariosCard scenariosData={scenariosData} />
      )}

      {activeTab === 'simulator' && (
        <MonteCarloSimulator
          mode="simulator"
          simPreset={simPreset}
          onRunPreset={handleRunPreset}
          simulationResult={simulationResult}
          mcLoading={mcLoading}
          monteCarloResult={monteCarloResult}
          onRunMonteCarlo={handleRunMonteCarlo}
          selectedDriverId={selectedDriverId}
        />
      )}

      {activeTab === 'probability' && (
        <MonteCarloSimulator
          mode="probability"
          simPreset={simPreset}
          onRunPreset={handleRunPreset}
          simulationResult={simulationResult}
          mcLoading={mcLoading}
          monteCarloResult={monteCarloResult}
          onRunMonteCarlo={handleRunMonteCarlo}
          selectedDriverId={selectedDriverId}
        />
      )}

      {activeTab === 'comparison' && comparisonData && (
        <DriverComparisonCard
          comparisonData={comparisonData}
          comparisonRivalId={comparisonRivalId}
          onRivalChange={handleRivalChange}
          trackerData={trackerData}
          selectedDriverId={selectedDriverId}
        />
      )}

      {activeTab === 'history' && (
        <HistoricalChampionsView
          historicalSeason={historicalSeason}
          setHistoricalSeason={setHistoricalSeason}
          historicalData={historicalData}
          championsList={championsList}
        />
      )}
    </div>
  );
};
