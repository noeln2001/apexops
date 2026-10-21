import React from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import { MonteCarloResponse, InteractiveSimulationResult } from '../../types';

interface SimulatorProps {
  simPreset: string;
  onRunPreset: (preset: string) => void;
  simulationResult: InteractiveSimulationResult | null;
  mcLoading: boolean;
  monteCarloResult: MonteCarloResponse | null;
  onRunMonteCarlo: (runs: number) => void;
  selectedDriverId: string;
  mode: 'simulator' | 'probability';
}

export const MonteCarloSimulator: React.FC<SimulatorProps> = ({
  simPreset,
  onRunPreset,
  simulationResult,
  mcLoading,
  monteCarloResult,
  onRunMonteCarlo,
  selectedDriverId,
  mode
}) => {
  if (mode === 'simulator') {
    return (
      <div className="space-y-6">
        {/* Quick Presets Bar */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Simulation Quick Actions</h3>
          <p className="text-xs text-[#94a3b8] mb-3">
            Apply realistic race outcomes to Austin, Mexico, Brazil, Las Vegas, Qatar, and Abu Dhabi
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'max_wins_austin', label: 'Max Wins Austin GP & Sprint' },
              { id: 'max_wins_all', label: 'Max Wins All 6 Remaining Races' },
              { id: 'max_wins_leader_dnf', label: 'Leader DNF in Austin (Max P1)' },
              { id: 'max_wins_leader_p5', label: 'Max P1, Leader P5 (All Remaining)' },
              { id: 'max_p2', label: 'Max Finishes P2 in All Sessions' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onRunPreset(p.id)}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  simPreset === p.id
                    ? 'bg-[#e10600] text-white'
                    : 'bg-[#1a2230] text-[#94a3b8] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
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
    );
  }

  return (
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
            onClick={() => onRunMonteCarlo(1000)}
            className="px-3 py-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition cursor-pointer"
          >
            1,000 Runs
          </button>
          <button
            disabled={mcLoading}
            onClick={() => onRunMonteCarlo(10000)}
            className="px-3 py-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition cursor-pointer"
          >
            10,000 Runs
          </button>
          <button
            disabled={mcLoading}
            onClick={() => onRunMonteCarlo(50000)}
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
  );
};
