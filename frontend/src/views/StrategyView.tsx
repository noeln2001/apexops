import React, { useState, useEffect } from 'react';
import { fetchStrategy } from '../services/api';
import { Layers, Timer, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export const StrategyView: React.FC = () => {
  const [gapSec, setGapSec] = useState<number>(1.8);
  const [leadComp, setLeadComp] = useState<string>('MEDIUM');
  const [chaseComp, setChaseComp] = useState<string>('HARD');
  const [strategyData, setStrategyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStrategy(gapSec, leadComp, chaseComp)
      .then((data) => {
        setStrategyData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gapSec, leadComp, chaseComp]);

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#e10600]" />
          <span>Tyre Degradation & Pit-Stop Strategy Lab</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Pirelli compound performance profiles, stint degradation slopes, and real-time undercut / overcut viability modelling</p>
      </div>

      {/* Undercut Simulator Interactive Card */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#f59e0b]" />
          <span>Interactive Undercut & Pit Window Calculator</span>
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

      {/* Compound Degradation Characteristics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2530]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#e80020]"></span>
              <span className="font-bold text-white text-xs">C4 / C5 SOFT COMPOUND</span>
            </div>
            <span className="text-[10px] text-[#ff6b6b] font-mono">High Degradation</span>
          </div>
          <div className="text-xs text-[#94a3b8] space-y-1">
            <div className="flex justify-between"><span>Base Pace Delta:</span> <strong className="text-white">0.00s (Baseline)</strong></div>
            <div className="flex justify-between"><span>Degradation Rate:</span> <strong className="text-white">0.12s / lap</strong></div>
            <div className="flex justify-between"><span>Optimal Window:</span> <strong className="text-white">14 – 18 Laps</strong></div>
            <div className="flex justify-between"><span>Performance Cliff:</span> <strong className="text-[#ff6b6b]">Lap 20</strong></div>
          </div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2530]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#fff500]"></span>
              <span className="font-bold text-white text-xs">C3 MEDIUM COMPOUND</span>
            </div>
            <span className="text-[10px] text-[#f59e0b] font-mono">Balanced Life</span>
          </div>
          <div className="text-xs text-[#94a3b8] space-y-1">
            <div className="flex justify-between"><span>Base Pace Delta:</span> <strong className="text-white">+0.45s</strong></div>
            <div className="flex justify-between"><span>Degradation Rate:</span> <strong className="text-white">0.07s / lap</strong></div>
            <div className="flex justify-between"><span>Optimal Window:</span> <strong className="text-white">24 – 28 Laps</strong></div>
            <div className="flex justify-between"><span>Performance Cliff:</span> <strong className="text-[#f59e0b]">Lap 30</strong></div>
          </div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2530]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ffffff]"></span>
              <span className="font-bold text-white text-xs">C2 HARD COMPOUND</span>
            </div>
            <span className="text-[10px] text-[#10b981] font-mono">Maximum Durability</span>
          </div>
          <div className="text-xs text-[#94a3b8] space-y-1">
            <div className="flex justify-between"><span>Base Pace Delta:</span> <strong className="text-white">+0.95s</strong></div>
            <div className="flex justify-between"><span>Degradation Rate:</span> <strong className="text-white">0.04s / lap</strong></div>
            <div className="flex justify-between"><span>Optimal Window:</span> <strong className="text-white">35 – 42 Laps</strong></div>
            <div className="flex justify-between"><span>Performance Cliff:</span> <strong className="text-[#10b981]">Lap 45</strong></div>
          </div>
        </div>
      </div>

      {/* Recommended Strategy Cards */}
      {strategyData && strategyData.recommended_strategies && (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Timer className="w-4 h-4 text-[#38bdf8]" />
            <span>Optimal Race Stint Strategies for Upcoming Event</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategyData.recommended_strategies.map((strat: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#0d1017] border border-[#1f2530] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{strat.name}</span>
                  <span className="text-[11px] font-mono font-semibold text-[#10b981]">{strat.total_estimated_time}</span>
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
