import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, TrendingUp, CheckCircle2, Award } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import {
  MonteCarloResponse,
  InteractiveSimulationResult,
  PredictionEvolutionData,
  PredictionCalibrationData
} from '../../types';
import { fetchPredictionEvolution, fetchPredictionCalibration } from '../../services/api';

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
  const [subTab, setSubTab] = useState<'current' | 'evolution' | 'calibration'>('current');
  const [evolutionData, setEvolutionData] = useState<PredictionEvolutionData | null>(null);
  const [calibrationData, setCalibrationData] = useState<PredictionCalibrationData | null>(null);
  const [loadingExtras, setLoadingExtras] = useState<boolean>(false);

  useEffect(() => {
    if (mode === 'probability') {
      setLoadingExtras(true);
      Promise.all([fetchPredictionEvolution(2026), fetchPredictionCalibration()])
        .then(([evo, cal]) => {
          setEvolutionData(evo);
          setCalibrationData(cal);
        })
        .finally(() => setLoadingExtras(false));
    }
  }, [mode]);

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
                          <span className="text-[#64748b] font-bold">-</span>
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

  // Evolution line chart config
  const evolutionOption = evolutionData
    ? {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc', fontSize: 12 },
          valueFormatter: (value: any) => `${value}%`
        },
        legend: {
          data: evolutionData.drivers.map((d) => d.name),
          textStyle: { color: '#94a3b8', fontSize: 11 },
          top: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: evolutionData.rounds.map((r) => `R${r}`),
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#1e293b' } }
        },
        series: evolutionData.drivers.map((d) => ({
          name: d.name,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: d.driver_id === 'max_verstappen' ? 3 : 2, color: d.color },
          itemStyle: { color: d.color },
          data: d.probabilities
        }))
      }
    : null;

  // Calibration curve chart config
  const calibrationOption = calibrationData
    ? {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc', fontSize: 12 }
        },
        legend: {
          data: ['Observed Win Rate', 'Ideal Reference (y=x)'],
          textStyle: { color: '#94a3b8', fontSize: 11 },
          top: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
        xAxis: {
          type: 'category',
          data: calibrationData.calibration_curve.map((b) => b.bin_label),
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#1e293b' } }
        },
        series: [
          {
            name: 'Observed Win Rate',
            type: 'bar',
            barWidth: '40%',
            itemStyle: { color: '#a855f7' },
            data: calibrationData.calibration_curve.map((b) => b.actual_frequency_pct)
          },
          {
            name: 'Ideal Reference (y=x)',
            type: 'line',
            lineStyle: { type: 'dashed', color: '#10b981', width: 2 },
            itemStyle: { color: '#10b981' },
            data: calibrationData.calibration_curve.map((b) => b.predicted_avg_pct)
          }
        ]
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Probability Mode Header & Sub-Navigation */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#a855f7]" />
            Monte Carlo Probabilities & Prediction Tracking
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            10,000 to 50,000 iterations factoring reliability hazard rates, sprint points, and multi-season calibration
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex bg-[#0b0e14] p-1 rounded-md border border-[#1f2530] text-xs">
            <button
              onClick={() => setSubTab('current')}
              className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                subTab === 'current' ? 'bg-[#a855f7] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Current Contenders
            </button>
            <button
              onClick={() => setSubTab('evolution')}
              className={`px-3 py-1 rounded font-semibold transition cursor-pointer flex items-center gap-1 ${
                subTab === 'evolution' ? 'bg-[#a855f7] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Round Evolution
            </button>
            <button
              onClick={() => setSubTab('calibration')}
              className={`px-3 py-1 rounded font-semibold transition cursor-pointer flex items-center gap-1 ${
                subTab === 'calibration' ? 'bg-[#a855f7] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Award className="w-3 h-3" />
              Outcome Calibration
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#273245] hidden sm:block"></div>

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

      {mcLoading || loadingExtras ? (
        <div className="p-16 text-center text-xs text-[#64748b] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#a855f7]" />
          <span>Simulating thousands of season outcomes...</span>
        </div>
      ) : subTab === 'evolution' && evolutionOption ? (
        /* Round-by-Round Evolution View */
        <div className="space-y-4">
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Championship Title Probability Evolution (Rounds 1–{evolutionData?.total_rounds_completed})</h4>
                <p className="text-xs text-[#64748b]">Monte Carlo projected title win probability after each completed round</p>
              </div>
              <div className="text-xs text-[#10b981] font-mono font-bold bg-[#10b981]/10 px-2.5 py-1 rounded border border-[#10b981]/20">
                Current Leader: {evolutionData?.current_leader.toUpperCase()}
              </div>
            </div>
            <ReactECharts option={evolutionOption} style={{ height: '360px', width: '100%' }} />
          </div>
        </div>
      ) : subTab === 'calibration' && calibrationData && calibrationOption ? (
        /* Calibration & Reliability View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <span className="text-xs text-[#64748b] uppercase tracking-wider">Brier Calibration Score</span>
              <div className="text-2xl font-black font-mono text-[#10b981] mt-1">{calibrationData.brier_score}</div>
              <p className="text-[11px] text-[#94a3b8] mt-1">Lower is better (0.0 = perfect accuracy, &lt;0.08 = elite)</p>
            </div>
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <span className="text-xs text-[#64748b] uppercase tracking-wider">Expected Calibration Error (ECE)</span>
              <div className="text-2xl font-black font-mono text-[#38bdf8] mt-1">{(calibrationData.expected_calibration_error * 100).toFixed(1)}%</div>
              <p className="text-[11px] text-[#94a3b8] mt-1">Weighted difference between confidence and win frequency</p>
            </div>
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <span className="text-xs text-[#64748b] uppercase tracking-wider">Reliability Assessment</span>
              <div className="text-base font-bold text-[#10b981] flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                {calibrationData.reliability_verdict}
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-1">Validated across 2021–2025 completed seasons</p>
            </div>
          </div>

          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-1">Empirical Reliability Diagram (Calibration Curve)</h4>
            <p className="text-xs text-[#64748b] mb-4">Comparing predicted win probabilities against observed championships won ({calibrationData.total_predictions} evaluations)</p>
            <ReactECharts option={calibrationOption} style={{ height: '320px', width: '100%' }} />
          </div>

          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs table-f1">
              <thead>
                <tr>
                  <th>PROBABILITY BIN</th>
                  <th className="text-right">PREDICTED AVG</th>
                  <th className="text-right">ACTUAL WIN FREQUENCY</th>
                  <th className="text-right">EVALUATION COUNT</th>
                  <th className="text-right">CALIBRATION GAP</th>
                </tr>
              </thead>
              <tbody>
                {calibrationData.calibration_curve.map((bin) => (
                  <tr key={bin.bin_label}>
                    <td className="font-bold text-white">{bin.bin_label}</td>
                    <td className="text-right font-mono text-[#94a3b8]">{bin.predicted_avg_pct}%</td>
                    <td className="text-right font-mono font-bold text-[#a855f7]">{bin.actual_frequency_pct}%</td>
                    <td className="text-right font-mono text-white">{bin.sample_size}</td>
                    <td className="text-right font-mono text-[#10b981]">{bin.calibration_gap}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : monteCarloResult ? (
        /* Current Contenders Grid & Table */
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
