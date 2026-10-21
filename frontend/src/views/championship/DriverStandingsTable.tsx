import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ChampionshipTrackerData } from '../../types';

interface DriverStandingsTableProps {
  trackerData: ChampionshipTrackerData;
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
}

export const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({
  trackerData,
  selectedDriverId,
  onSelectDriver
}) => {
  return (
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
            {(trackerData?.standings || []).map((d) => {
              const isHighlighted = d.driver_id === selectedDriverId;
              const isVerstappen = d.driver_id === 'max_verstappen';
              return (
                <tr
                  key={d.driver_id}
                  onClick={() => onSelectDriver(d.driver_id)}
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
          {(trackerData?.remaining_calendar || []).map((r) => (
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
  );
};
