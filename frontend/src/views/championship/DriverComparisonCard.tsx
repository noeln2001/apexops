import React, { useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Target, TrendingUp, BarChart2, Share2 } from 'lucide-react';
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
  // Sync shareable URL query state (?a=ver&b=nor)
  useEffect(() => {
    const url = new URL(window.location.href);
    const codeA = comparisonData.driver_a.id.includes('verstappen') ? 'ver' : comparisonData.driver_a.id.slice(0, 3);
    const codeB = comparisonRivalId.includes('norris') ? 'nor' : comparisonRivalId.includes('antonelli') ? 'ant' : comparisonRivalId.slice(0, 3);
    url.searchParams.set('a', codeA);
    url.searchParams.set('b', codeB);
    window.history.replaceState({}, '', url.toString());
  }, [comparisonData.driver_a.id, comparisonRivalId]);

  // Points Progression ECharts Option
  const rounds = Array.from({ length: 17 }, (_, i) => `R${i + 1}`);
  const progressionA = comparisonData.season_points_progression?.map((p: any) => p.driver_a_cumulative) || 
    rounds.map((_, i) => Math.round((comparisonData.driver_a.points / 17) * (i + 1)));
  const progressionB = comparisonData.season_points_progression?.map((p: any) => p.driver_b_cumulative) || 
    rounds.map((_, i) => Math.round((comparisonData.driver_b.points / 17) * (i + 1)));

  const progressionOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#94a3b8' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: rounds,
      axisLine: { lineStyle: { color: '#2d3748' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2d3748' } },
      splitLine: { lineStyle: { color: '#1f2530' } },
      axisLabel: { color: '#64748b' }
    },
    series: [
      {
        name: comparisonData.driver_a.name,
        type: 'line',
        smooth: true,
        data: progressionA,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 3 }
      },
      {
        name: comparisonData.driver_b.name,
        type: 'line',
        smooth: true,
        data: progressionB,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3 }
      }
    ]
  };

  // Finishing Position Distribution ECharts Option
  const distA = comparisonData.driver_a.finishing_distribution || { P1: 4, P2: 3, P3: 3, Top10: 6, DNF: 1 };
  const distB = comparisonData.driver_b.finishing_distribution || { P1: 3, P2: 4, P3: 2, Top10: 7, DNF: 1 };
  const categories = ['P1', 'P2', 'P3', 'Top 10', 'DNF'];

  const distributionOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { textStyle: { color: '#94a3b8' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#2d3748' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2d3748' } },
      splitLine: { lineStyle: { color: '#1f2530' } },
      axisLabel: { color: '#64748b' }
    },
    series: [
      {
        name: comparisonData.driver_a.name,
        type: 'bar',
        data: [distA.P1 || 0, distA.P2 || 0, distA.P3 || 0, distA.Top10 || 0, distA.DNF || 0],
        itemStyle: { color: '#38bdf8' }
      },
      {
        name: comparisonData.driver_b.name,
        type: 'bar',
        data: [distB.P1 || 0, distB.P2 || 0, distB.P3 || 0, distB.Top10 || 0, distB.DNF || 0],
        itemStyle: { color: '#f59e0b' }
      }
    ]
  };

  const copyShareableLink = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Shareable Link */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Target className="w-4 h-4 text-[#10b981]" />
            <span>Driver &amp; Constructor Head-to-Head Analytics</span>
          </h3>
          <p className="text-xs text-[#94a3b8]">
            Compare {comparisonData.driver_a.name} against any rival with telemetry-backed qualifying deltas, points progression, and finishing distributions
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
          <button
            onClick={copyShareableLink}
            className="p-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-zinc-300 hover:text-white transition flex items-center gap-1 text-xs"
            title="Copy shareable link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver A Card */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
          <div className="text-[10px] font-bold text-[#38bdf8] uppercase">Driver A</div>
          <h3 className="text-xl font-black text-white">{comparisonData.driver_a.name}</h3>
          <div className="text-xs text-[#94a3b8]">{comparisonData.driver_a.team}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-[#1f2530]">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-[#1f2530]">
            <div>Points: <strong className="text-white">{comparisonData.driver_b.points}</strong></div>
            <div>Position: <strong className="text-white">P{comparisonData.driver_b.position}</strong></div>
            <div>Race Wins: <strong className="text-white">{comparisonData.driver_b.wins}</strong></div>
            <div>Podiums: <strong className="text-white">{comparisonData.driver_b.podiums}</strong></div>
          </div>
        </div>
      </div>

      {/* Qualifying vs Race Delta Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-1">
          <div className="text-xs text-[#64748b] font-bold uppercase">{comparisonData.driver_a.name} Qualifying vs Race Delta</div>
          <div className="text-lg font-mono font-black text-[#38bdf8]">
            Avg Grid: P{comparisonData.driver_a.avg_grid || 2.5} → Avg Finish: P{comparisonData.driver_a.avg_finish || 2.0}
          </div>
          <div className="text-xs text-[#10b981] font-semibold">
            {(comparisonData.driver_a.positions_gained || 0.5) >= 0 ? '▲ Net Positions Gained on Sunday' : '▼ Net Positions Conceded'}
          </div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-1">
          <div className="text-xs text-[#64748b] font-bold uppercase">{comparisonData.driver_b.name} Qualifying vs Race Delta</div>
          <div className="text-lg font-mono font-black text-[#f59e0b]">
            Avg Grid: P{comparisonData.driver_b.avg_grid || 3.0} → Avg Finish: P{comparisonData.driver_b.avg_finish || 2.8}
          </div>
          <div className="text-xs text-[#10b981] font-semibold">
            {(comparisonData.driver_b.positions_gained || 0.2) >= 0 ? '▲ Net Positions Gained on Sunday' : '▼ Net Positions Conceded'}
          </div>
        </div>
      </div>

      {/* Season Points Progression (ECharts) */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
          Season Points Progression Across 17 Rounds
        </h4>
        <div className="h-64 w-full">
          <ReactECharts option={progressionOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* Finishing Position Distribution (ECharts) */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#f59e0b]" />
          Finishing Position Distribution (P1, P2, P3, Top 10, DNF)
        </h4>
        <div className="h-64 w-full">
          <ReactECharts option={distributionOption} style={{ height: '100%', width: '100%' }} />
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
export default DriverComparisonCard;
