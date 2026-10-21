import React from 'react';
import { Calendar } from 'lucide-react';

interface HistoricalChampionsViewProps {
  historicalSeason: number;
  setHistoricalSeason: (s: number) => void;
  historicalData: any;
  championsList: any[];
}

const roundNumber = (val: number): number => Math.round(val * 10) / 10;

export const HistoricalChampionsView: React.FC<HistoricalChampionsViewProps> = ({
  historicalSeason,
  setHistoricalSeason,
  historicalData,
  championsList
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#38bdf8]/20 text-[#38bdf8] rounded border border-[#38bdf8]/40 uppercase tracking-wider">
              HISTORICAL ARCHIVES (2010–2026)
            </span>
            <span className="text-xs text-[#94a3b8] font-mono">17 SEASONS DOCUMENTED</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center space-x-2 mt-1">
            <Calendar className="w-5 h-5 text-[#f59e0b]" />
            <span>Formula 1 World Championship Statistics: 2010 to Present</span>
          </h3>
          <p className="text-xs text-[#94a3b8]">
            Verified official title winners, margin of victory, regulation eras, and Max Verstappen championship records
          </p>
        </div>
        <div className="text-xs font-mono text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded border border-[#10b981]/30">
          OFFICIAL FIA / ERGAST JOLPICA RECONCILED
        </div>
      </div>

      {/* Historical Era KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-[#64748b] uppercase">Max Verstappen Titles</div>
          <div className="text-2xl font-black font-mono text-[#f59e0b] mt-0.5">5 Titles</div>
          <div className="text-[10px] text-[#94a3b8] font-mono">2021, 2022, 2023, 2024, 2025</div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-[#64748b] uppercase">Red Bull Racing Era</div>
          <div className="text-2xl font-black font-mono text-[#38bdf8] mt-0.5">9 Titles</div>
          <div className="text-[10px] text-[#94a3b8] font-mono">Vettel (4) &amp; Verstappen (5)</div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-[#64748b] uppercase">Mercedes Dominance</div>
          <div className="text-2xl font-black font-mono text-[#10b981] mt-0.5">7 Titles</div>
          <div className="text-[10px] text-[#94a3b8] font-mono">Hamilton (6) &amp; Rosberg (1)</div>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3.5">
          <div className="text-[10px] font-bold text-[#64748b] uppercase">Closest Championship</div>
          <div className="text-2xl font-black font-mono text-[#ef4444] mt-0.5">3.0 PTS</div>
          <div className="text-[10px] text-[#94a3b8] font-mono">2012 (Vettel vs Alonso)</div>
        </div>
      </div>

      {/* Season Selector Bar (2026 down to 2010) */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>SELECT SEASON ARCHIVE (2010–2026):</span>
          <span className="text-[11px] text-[#38bdf8] font-mono">ACTIVE SELECTION: {historicalSeason} SEASON</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map((s) => (
            <button
              key={s}
              onClick={() => setHistoricalSeason(s)}
              className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                historicalSeason === s
                  ? 'bg-[#e10600] text-white shadow-md'
                  : s === 2026
                  ? 'bg-[#152e24] text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/30'
                  : 'bg-[#151922] text-[#94a3b8] hover:text-white hover:bg-[#1e2533]'
              }`}
            >
              {s} {s === 2026 ? '(Active)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Season Detail Card & Full Standings */}
      {historicalData && (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
          <div className="p-4 border-b border-[#1f2530] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1a202c] text-[#94a3b8] rounded border border-[#2d3748]">
                  {historicalData.status === 'COMPLETED' ? 'OFFICIAL SEASON CONCLUSION' : 'ACTIVE CHAMPIONSHIP'}
                </span>
                {historicalData.metadata?.era && (
                  <span className="text-xs text-[#38bdf8] font-mono">{historicalData.metadata.era}</span>
                )}
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {historicalData.season} Formula 1 Drivers' World Championship
              </h3>
              <p className="text-xs text-[#94a3b8]">
                {historicalData.metadata?.deciding_round ? `Title Decided: ${historicalData.metadata.deciding_round}` : 'Season in progress'}
              </p>
            </div>

            {historicalData.champion && (
              <div className="bg-[#10141d] border border-[#2d3748] rounded-lg p-3 text-right">
                <div className="text-[10px] font-bold text-[#f59e0b] uppercase">
                  {historicalData.season === 2026 ? 'CURRENT LEADER' : 'WORLD CHAMPION'}
                </div>
                <div className="text-base font-black text-white">{historicalData.champion.name}</div>
                <div className="text-xs font-mono text-[#94a3b8]">
                  {historicalData.champion.team} | <strong className="text-white">{historicalData.champion.points} PTS</strong> ({historicalData.champion.wins} Wins)
                </div>
              </div>
            )}
          </div>

          {/* Standings Table */}
          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th>POS</th>
                <th>DRIVER</th>
                <th>NATIONALITY</th>
                <th>TEAM</th>
                <th className="text-right">POINTS</th>
                <th className="text-center">WINS</th>
                <th className="text-right">GAP TO LEAD</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.standings?.map((h: any, idx: number) => {
                const isVer = h.driver_id === 'max_verstappen' || h.name?.toLowerCase().includes('verstappen');
                const leadPts = historicalData.standings[0]?.points || 0;
                const gap = roundNumber(leadPts - (h.points || 0));
                return (
                  <tr key={h.driver_id || idx} className={isVer ? 'bg-[#1e293b]/80 font-bold border-l-4 border-l-[#f59e0b]' : 'hover:bg-[#151922]'}>
                    <td className="font-mono font-bold text-white">
                      {h.position === 1 ? '🥇 1' : h.position === 2 ? '🥈 2' : h.position === 3 ? '🥉 3' : `P${h.position}`}
                    </td>
                    <td className="text-white font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <span>{h.name}</span>
                        {isVer && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] rounded">
                            VER 33
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-[#94a3b8]">{h.nationality || 'F1 International'}</td>
                    <td className="text-[#94a3b8]">{h.team}</td>
                    <td className="text-right font-mono font-bold text-white">{h.points}</td>
                    <td className="text-center font-mono text-white">{h.wins}</td>
                    <td className="text-right font-mono text-[#f59e0b]">
                      {gap === 0 ? '-' : `-${gap}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Roll of Honor Table: All Champions 2010 to 2026 */}
      {championsList.length > 0 && (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
          <div className="p-4 border-b border-[#1f2530]">
            <h3 className="text-sm font-bold text-white">FIA Formula 1 World Champions Roll of Honor (2010–2026)</h3>
            <p className="text-[11px] text-[#64748b]">Complete historical chronicle of title winners, winning margins, and Verstappen milestones</p>
          </div>

          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th>YEAR</th>
                <th>WORLD CHAMPION</th>
                <th>CONSTRUCTOR</th>
                <th className="text-right">POINTS</th>
                <th className="text-center">WINS</th>
                <th>RUNNER-UP</th>
                <th className="text-right">MARGIN</th>
                <th>REGULATION ERA</th>
                <th>MAX VERSTAPPEN FINISH</th>
              </tr>
            </thead>
            <tbody>
              {championsList.map((c: any) => {
                const isSelected = c.year === historicalSeason;
                const isVerstappenChamp = c.champion_code === 'VER';
                return (
                  <tr
                    key={c.year}
                    onClick={() => setHistoricalSeason(c.year)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#1e293b]/90 border-l-4 border-l-[#e10600]'
                        : isVerstappenChamp
                        ? 'bg-[#151c27] hover:bg-[#1c2433]'
                        : 'hover:bg-[#151922]'
                    }`}
                  >
                    <td className="font-mono font-black text-white">{c.year}</td>
                    <td className="font-bold text-white">
                      <div className="flex items-center space-x-1.5">
                        <span>{c.champion_driver}</span>
                        {isVerstappenChamp && (
                          <span className="text-[#f59e0b]">👑</span>
                        )}
                      </div>
                    </td>
                    <td className="text-[#94a3b8]">{c.constructor}</td>
                    <td className="text-right font-mono font-bold text-white">{c.points}</td>
                    <td className="text-center font-mono font-bold text-white">{c.wins}</td>
                    <td className="text-[#94a3b8]">{c.runner_up}</td>
                    <td className="text-right font-mono text-[#10b981]">+{c.margin_pts}</td>
                    <td className="text-[11px] text-[#64748b]">{c.regulation_era}</td>
                    <td className="font-mono font-bold text-[#f59e0b]">{c.verstappen_finish}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
