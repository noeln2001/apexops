import React, { useState, useEffect } from 'react';
import { fetchChampionshipSimulation, runCustomSimulation } from '../services/api';
import { Cpu, RefreshCw, Play, Sliders } from 'lucide-react';

interface SimulatorViewProps {
  season: number;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ season }) => {
  const [data, setData] = useState<any>(null);
  const [iterations] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom user deterministic pick for Austin GP
  const [austinWinner, setAustinWinner] = useState<string>('norris');
  const [mexicoWinner, setMexicoWinner] = useState<string>('verstappen');

  const runSimulation = (_iters = iterations) => {
    setLoading(true);
    fetchChampionshipSimulation(season)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    runSimulation();
  }, [season]);

  const handleRunDeterministic = async () => {
    setLoading(true);
    try {
      const payload = {
        season,
        mode: 'deterministic',
        scenarios: [
          { round: 18, finishing_order: [austinWinner, austinWinner === 'norris' ? 'verstappen' : 'norris', 'leclerc'] },
          { round: 19, finishing_order: [mexicoWinner, mexicoWinner === 'norris' ? 'verstappen' : 'norris', 'piastri'] }
        ]
      };
      const res = await runCustomSimulation(payload);
      setData(res);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#e10600]" />
            <span>Championship Simulator & Monte Carlo Forecasts</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Probabilistic 1,000-run Monte Carlo forecasts incorporating retirement rates, countback tie-breaks and deterministic scenario modeling</p>
        </div>

        <button
          onClick={() => runSimulation()}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#e10600] hover:bg-[#b80500] text-white rounded text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Rerun 1,000 Iterations</span>
        </button>
      </div>

      {/* Simulator Metrics Banner */}
      {data && data.results && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
            <div className="text-[10px] uppercase font-semibold text-[#64748b]">REMAINING RACES</div>
            <div className="text-xl font-bold font-mono text-white">6 Grands Prix</div>
            <div className="text-[10px] text-[#38bdf8]">Austin, Mexico, Brazil, Vegas, Qatar, Abu Dhabi</div>
          </div>

          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
            <div className="text-[10px] uppercase font-semibold text-[#64748b]">MAX ACHIEVABLE POINTS</div>
            <div className="text-xl font-bold font-mono text-[#f59e0b]">
              {data.results.max_achievable_points || 166} PTS
            </div>
            <div className="text-[10px] text-[#64748b]">Includes remaining Sprint weekends</div>
          </div>

          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
            <div className="text-[10px] uppercase font-semibold text-[#64748b]">MONTE CARLO ITERATIONS</div>
            <div className="text-xl font-bold font-mono text-[#10b981]">
              {data.results.iterations || 1000} RUNS
            </div>
            <div className="text-[10px] text-[#64748b]">Calibrated to 6% mechanical DNF rate</div>
          </div>

          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
            <div className="text-[10px] uppercase font-semibold text-[#64748b]">PROJECTED CHAMPION</div>
            <div className="text-xl font-bold font-mono text-[#e10600]">
              {data.results.probabilities?.[0]?.name || 'Lando Norris'}
            </div>
            <div className="text-[10px] text-[#10b981] font-semibold">
              {data.results.probabilities?.[0]?.championship_prob_pct}% Win Probability
            </div>
          </div>
        </div>
      )}

      {/* Probability Distribution Table */}
      {data && data.results && data.results.probabilities && (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
          <div className="p-4 border-b border-[#1f2530] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Championship Win Probability Distribution</h3>
              <p className="text-[11px] text-[#64748b]">Derived from current points density, car reliability factors, and remaining rounds</p>
            </div>
            <span className="text-[11px] font-mono text-[#64748b]">Updated: 20 Oct 2026</span>
          </div>

          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th className="w-12 text-center">RANK</th>
                <th>CONTENDER</th>
                <th>TEAM</th>
                <th className="text-right">CURRENT PTS</th>
                <th className="w-64">PROBABILITY PROGRESSION</th>
                <th className="text-right">TITLE PROBABILITY</th>
              </tr>
            </thead>
            <tbody>
              {data.results.probabilities.map((p: any, idx: number) => (
                <tr key={p.driver_id} className="hover:bg-[#161a22] transition">
                  <td className="text-center font-mono font-bold text-white">{idx + 1}</td>
                  <td className="font-bold text-white text-sm">{p.name}</td>
                  <td className="text-[#94a3b8]">{p.team}</td>
                  <td className="text-right font-mono font-bold text-white">{p.current_points}</td>
                  <td>
                    <div className="w-full bg-[#1e2533] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#e10600] to-[#f59e0b] h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, p.championship_prob_pct)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="text-right font-mono font-bold text-sm text-[#38bdf8]">
                    {p.championship_prob_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Scenario Deterministic Builder */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#38bdf8]" />
            <span>Hypothetical Finishing Order Scenario Builder</span>
          </h3>
          <p className="text-xs text-[#94a3b8]">Select custom hypothetical winners for upcoming rounds and project exact championship standings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-lg space-y-2">
            <label className="text-xs text-[#94a3b8] font-semibold">ROUND 18 (UNITED STATES GP - AUSTIN) WINNER:</label>
            <select
              value={austinWinner}
              onChange={(e) => setAustinWinner(e.target.value)}
              className="w-full bg-[#151922] border border-[#232b38] rounded p-2 text-xs text-white font-bold outline-none cursor-pointer"
            >
              <option value="norris">Lando Norris (McLaren) — 25 PTS</option>
              <option value="verstappen">Max Verstappen (Red Bull) — 25 PTS</option>
              <option value="leclerc">Charles Leclerc (Ferrari) — 25 PTS</option>
              <option value="hamilton">Lewis Hamilton (Mercedes) — 25 PTS</option>
            </select>
          </div>

          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-lg space-y-2">
            <label className="text-xs text-[#94a3b8] font-semibold">ROUND 19 (MEXICO CITY GP) WINNER:</label>
            <select
              value={mexicoWinner}
              onChange={(e) => setMexicoWinner(e.target.value)}
              className="w-full bg-[#151922] border border-[#232b38] rounded p-2 text-xs text-white font-bold outline-none cursor-pointer"
            >
              <option value="verstappen">Max Verstappen (Red Bull) — 25 PTS</option>
              <option value="norris">Lando Norris (McLaren) — 25 PTS</option>
              <option value="leclerc">Charles Leclerc (Ferrari) — 25 PTS</option>
              <option value="piastri">Oscar Piastri (McLaren) — 25 PTS</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunDeterministic}
          disabled={loading}
          className="px-4 py-2 bg-[#1a2333] hover:bg-[#25324a] border border-[#2b3952] text-white rounded text-xs font-bold flex items-center space-x-2 transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Apply Custom Scenario & Recalculate Standings</span>
        </button>

        {/* Deterministic Output Table */}
        {data && data.scenario_results && (
          <div className="mt-4 pt-4 border-t border-[#1f2530]">
            <h4 className="text-xs font-bold text-white mb-2">Projected Standings After Selected Scenario:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.scenario_results.slice(0, 4).map((d: any) => (
                <div key={d.driver_id} className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[#64748b]">P{d.projected_position}</span>
                    <span className="text-[#10b981] font-mono font-bold">+{d.points_gain} pts</span>
                  </div>
                  <div className="font-bold text-white text-sm">{d.name}</div>
                  <div className="text-xs text-[#94a3b8] font-mono mt-1">{d.projected_points} Points Total</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
