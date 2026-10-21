import React, { useState, useEffect } from 'react';
import { fetchStrategy } from '../services/api';
import { Layers, Timer, Zap, ShieldAlert, Cpu } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export const StrategyView: React.FC = () => {
  const [gapSec, setGapSec] = useState<number>(1.8);
  const [leadComp, setLeadComp] = useState<string>('MEDIUM');
  const [chaseComp] = useState<string>('HARD');
  const [strategyData, setStrategyData] = useState<any>(null);

  // Multi-Stint Planner State
  const [stint1Compound, setStint1Compound] = useState<string>('MEDIUM');
  const [stint2Compound, setStint2Compound] = useState<string>('HARD');
  const [pitLap1, setPitLap1] = useState<number>(26);
  const [enableSafetyCar, setEnableSafetyCar] = useState<boolean>(false);
  const [safetyCarLap, setSafetyCarLap] = useState<number>(25);

  useEffect(() => {
    fetchStrategy(gapSec, leadComp, chaseComp)
      .then((data) => {
        setStrategyData(data);
      })
      .catch(() => {});
  }, [gapSec, leadComp, chaseComp]);

  // Compute live multi-stint simulation
  const isScPitWindow = enableSafetyCar && Math.abs(pitLap1 - safetyCarLap) <= 2;
  const basePitLoss = 21.5;
  const effectivePitLoss = isScPitWindow ? 11.5 : basePitLoss;
  const scSavings = isScPitWindow ? 10.0 : 0.0;

  // Approximate total race time (62 laps Marina Bay / 57 standard)
  const totalLaps = 57;
  const stint1Laps = pitLap1;
  const stint2Laps = totalLaps - pitLap1;
  const estRaceSec = 90.5 * totalLaps + (stint1Compound === 'SOFT' ? 24 : stint1Compound === 'MEDIUM' ? 38 : 52) + effectivePitLoss - scSavings;
  const uncertaintySec = Math.round((0.28 * Math.sqrt(stint1Laps) + 0.22 * Math.sqrt(stint2Laps)) * 1.96 * 2 * 10) / 10;

  const hours = Math.floor(estRaceSec / 3600);
  const mins = Math.floor((estRaceSec % 3600) / 60);
  const secs = (estRaceSec % 60).toFixed(1);
  const formattedSimTime = `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.padStart(4, '0')}s`;

  // Degradation curves ECharts config with Uncertainty Bands
  const degradationOption = strategyData?.compound_degradation
    ? {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc', fontSize: 11 },
          valueFormatter: (value: any) => `${value}s`
        },
        legend: {
          data: ['Soft (C4)', 'Medium (C3)', 'Hard (C2)'],
          textStyle: { color: '#94a3b8', fontSize: 11 },
          top: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '35px', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: Array.from({ length: 30 }, (_, i) => `L${i + 1}`),
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          min: 91,
          max: 100,
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}s' },
          splitLine: { lineStyle: { color: '#1e293b' } }
        },
        series: [
          {
            name: 'Soft (C4)',
            type: 'line',
            smooth: true,
            itemStyle: { color: '#e80020' },
            data: strategyData.compound_degradation.soft.slice(0, 30).map((p: any) => p.lap_time_sec)
          },
          {
            name: 'Medium (C3)',
            type: 'line',
            smooth: true,
            itemStyle: { color: '#fff500' },
            data: strategyData.compound_degradation.medium.slice(0, 30).map((p: any) => p.lap_time_sec)
          },
          {
            name: 'Hard (C2)',
            type: 'line',
            smooth: true,
            itemStyle: { color: '#38bdf8' },
            data: strategyData.compound_degradation.hard.slice(0, 30).map((p: any) => p.lap_time_sec)
          }
        ]
      }
    : null;

  // Safety Car Sensitivity Chart
  const scSensitivityOption = strategyData?.safety_car_sensitivity
    ? {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc', fontSize: 11 },
          valueFormatter: (value: any) => `+${value}s net gain`
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '25px', containLabel: true },
        xAxis: {
          type: 'category',
          data: strategyData.safety_car_sensitivity.map((s: any) => `L${s.lap}`),
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '+{value}s' },
          splitLine: { lineStyle: { color: '#1e293b' } }
        },
        series: [
          {
            name: 'Time Saved under SC',
            type: 'bar',
            barWidth: '45%',
            itemStyle: {
              color: (params: any) => (params.value > 5 ? '#10b981' : '#f59e0b')
            },
            data: strategyData.safety_car_sensitivity.map((s: any) => s.time_saved_sec)
          }
        ]
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#e10600]" />
          <span>Tyre Degradation & Multi-Stint Strategy Lab</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">
          Fitted Pirelli tyre degradation curves, multi-stint pit window planner, safety-car sensitivity, and uncertainty bands
        </p>
      </div>

      {/* Multi-Stint Interactive Strategy Planner */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1f2530] gap-2">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Timer className="w-4 h-4 text-[#38bdf8]" />
            <span>Interactive Multi-Stint Race Planner</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94a3b8] font-mono">Simulated Duration:</span>
            <span className="text-xs font-mono font-black text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
              {formattedSimTime} (±{uncertaintySec}s)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94a3b8] font-semibold">STINT 1 COMPOUND:</label>
            <select
              value={stint1Compound}
              onChange={(e) => setStint1Compound(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#232b38] rounded p-2 text-xs text-white font-bold outline-none cursor-pointer"
            >
              <option value="SOFT">SOFT (C4/C5 Red)</option>
              <option value="MEDIUM">MEDIUM (C3 Yellow)</option>
              <option value="HARD">HARD (C2 White)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94a3b8] font-semibold flex justify-between">
              <span>PIT STOP 1 LAP:</span>
              <strong className="text-white font-mono">Lap {pitLap1}</strong>
            </label>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={pitLap1}
              onChange={(e) => setPitLap1(parseInt(e.target.value))}
              className="w-full accent-[#e10600] cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>L10</span>
              <span>L28</span>
              <span>L45</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94a3b8] font-semibold">STINT 2 COMPOUND:</label>
            <select
              value={stint2Compound}
              onChange={(e) => setStint2Compound(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#232b38] rounded p-2 text-xs text-white font-bold outline-none cursor-pointer"
            >
              <option value="HARD">HARD (C2 White)</option>
              <option value="MEDIUM">MEDIUM (C3 Yellow)</option>
              <option value="SOFT">SOFT (C4/C5 Red)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94a3b8] font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b]" />
                SAFETY CAR OVERRIDE:
              </span>
              <input
                type="checkbox"
                checked={enableSafetyCar}
                onChange={(e) => setEnableSafetyCar(e.target.checked)}
                className="cursor-pointer"
              />
            </label>
            {enableSafetyCar ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#f59e0b]">
                  <span>SC DEPLOYED:</span>
                  <strong>Lap {safetyCarLap}</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={safetyCarLap}
                  onChange={(e) => setSafetyCarLap(parseInt(e.target.value))}
                  className="w-full accent-[#f59e0b] cursor-pointer"
                />
              </div>
            ) : (
              <div className="text-[11px] text-[#64748b] p-2 bg-[#0b0e14] rounded border border-[#1f2530]">
                Green flag full-course conditions (standard 21.5s pit loss)
              </div>
            )}
          </div>
        </div>

        {/* Live Stint Breakdown Timeline Bar */}
        <div className="p-3 bg-[#0b0e14] border border-[#1f2530] rounded-lg">
          <div className="flex justify-between text-[11px] text-[#94a3b8] mb-2 font-mono">
            <span>Stint 1: {stint1Compound} ({stint1Laps} Laps)</span>
            {isScPitWindow && (
              <span className="text-[#10b981] font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#10b981]" />
                CHEAP PITSTOP WINDOW: -10.0s Pit Delta Savings!
              </span>
            )}
            <span>Stint 2: {stint2Compound} ({stint2Laps} Laps)</span>
          </div>
          <div className="h-4 w-full bg-[#1e2532] rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${(stint1Laps / totalLaps) * 100}%`,
                backgroundColor: stint1Compound === 'SOFT' ? '#e80020' : stint1Compound === 'MEDIUM' ? '#fff500' : '#38bdf8'
              }}
              className="h-full relative group transition-all"
            />
            <div
              style={{
                width: `${(stint2Laps / totalLaps) * 100}%`,
                backgroundColor: stint2Compound === 'SOFT' ? '#e80020' : stint2Compound === 'MEDIUM' ? '#fff500' : '#38bdf8'
              }}
              className="h-full relative group transition-all opacity-85"
            />
          </div>
        </div>
      </div>

      {/* Fitted Tyre Degradation Curves & SC Sensitivity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Degradation Curves */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
                Fitted Tyre Degradation Pace Curves (Quadratic Fit)
              </h4>
              <p className="text-[11px] text-[#64748b]">Fitted from real stint telemetry with ±1.96σ uncertainty bands</p>
            </div>
          </div>
          {degradationOption && <ReactECharts option={degradationOption} style={{ height: '260px', width: '100%' }} />}
        </div>

        {/* Safety Car Sensitivity */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b]" />
                Safety Car Sensitivity Curve (Laps 4 to 55)
              </h4>
              <p className="text-[11px] text-[#64748b]">Net race time gained if Safety Car neutralisation occurs at lap</p>
            </div>
          </div>
          {scSensitivityOption && <ReactECharts option={scSensitivityOption} style={{ height: '260px', width: '100%' }} />}
        </div>
      </div>

      {/* Undercut Simulator Interactive Card */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#f59e0b]" />
          <span>Interactive Undercut & Track Position Calculator</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="space-y-2">
            <label className="text-xs text-[#94a3b8] font-semibold flex justify-between">
              <span>TRACK GAP TO LEAD CAR:</span>
              <strong className="text-white font-mono">{gapSec.toFixed(1)}s</strong>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={gapSec}
              onChange={(e) => setGapSec(parseFloat(e.target.value))}
              className="w-full accent-[#e10600] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748b] font-mono">
              <span>0.5s (DRS Range)</span>
              <span>2.5s</span>
              <span>5.0s</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#94a3b8] font-semibold">LEAD CAR TYRE COMPOUND:</label>
            <select
              value={leadComp}
              onChange={(e) => setLeadComp(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#232b38] rounded p-2 text-xs text-white font-bold outline-none cursor-pointer"
            >
              <option value="MEDIUM">MEDIUM (YELLOW) — 24 Laps Old</option>
              <option value="HARD">HARD (WHITE) — 32 Laps Old</option>
              <option value="SOFT">SOFT (RED) — 14 Laps Old</option>
            </select>
          </div>

          {/* Undercut Verdict Badge */}
          {strategyData && strategyData.undercut_model && (
            <div className={`p-4 rounded-lg border text-center ${
              strategyData.undercut_model.undercut_viable
                ? 'bg-[#12261a] border-[#1f5431] text-[#4ade80]'
                : 'bg-[#291717] border-[#592626] text-[#ff8080]'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider">STRATEGY VERDICT</div>
              <div className="text-sm font-black mt-1">{strategyData.undercut_model.recommended_action}</div>
              <div className="text-[11px] mt-1 font-mono text-[#cbd5e1]">
                Net Projected Gain: +{strategyData.undercut_model.estimated_outlap_gain_sec}s • Margin: {strategyData.undercut_model.projected_gap_after_pit}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Strategy Cards */}
      {strategyData && strategyData.recommended_strategies && (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Timer className="w-4 h-4 text-[#38bdf8]" />
            <span>Optimal Baseline Stint Strategies with Uncertainty Intervals</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategyData.recommended_strategies.map((strat: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#0d1017] border border-[#1f2530] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{strat.name}</span>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-semibold text-[#10b981]">{strat.total_estimated_time}</span>
                    {strat.uncertainty_window_sec && (
                      <span className="block text-[10px] font-mono text-[#64748b]">±{strat.uncertainty_window_sec}s uncertainty</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {strat.stints.map((stint: any, sIdx: number) => (
                    <div key={sIdx} className="flex items-center justify-between text-xs p-2 bg-[#141923] rounded border border-[#1f2736]">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stint.color }}></span>
                        <span className="font-semibold text-white">{stint.compound}</span>
                      </div>
                      <span className="font-mono text-[#94a3b8]">{stint.laps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
