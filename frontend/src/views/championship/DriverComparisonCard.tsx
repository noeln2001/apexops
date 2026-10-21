import React from 'react';
import { Target } from 'lucide-react';
import { DriverComparisonData, ChampionshipTrackerData } from '../../types';

interface DriverComparisonCardProps {
  comparisonData: DriverComparisonData;
  comparisonRivalId: string;
  onRivalChange: (id: string) => void;
  trackerData: ChampionshipTrackerData | null;
  selectedDriverId: string;
}

export const DriverComparisonCard: React.FC<DriverComparisonCardProps> = ({
  comparisonData,
  comparisonRivalId,
  onRivalChange,
  trackerData,
  selectedDriverId
}) => {
  return (
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
            onChange={(e) => onRivalChange(e.target.value)}
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
  );
};
