import React, { useState, useEffect } from 'react';
import { DriverStandingItem, ConstructorStandingItem } from '../types';
import { fetchDriverStandings, fetchConstructorStandings } from '../services/api';
import { Trophy, Download, Search, Shield, ArrowUpDown } from 'lucide-react';

interface StandingsViewProps {
  season: number;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ season }) => {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const [drivers, setDrivers] = useState<DriverStandingItem[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStandingItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchDriverStandings(season), fetchConstructorStandings(season)])
      .then(([d, c]) => {
        if (mounted) {
          setDrivers(d);
          setConstructors(c);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [season]);

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.team_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredConstructors = constructors.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#e10600]" />
            <span>Championship Standings — Season {season}</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Official classifications verified against FIA sporting regulations and countback tie-breaker</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Selector */}
          <div className="flex bg-[#12151b] border border-[#1f2530] rounded p-0.5 text-xs">
            <button
              onClick={() => setTab('drivers')}
              className={`px-3 py-1 font-semibold rounded cursor-pointer transition ${
                tab === 'drivers' ? 'bg-[#e10600] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Drivers
            </button>
            <button
              onClick={() => setTab('constructors')}
              className={`px-3 py-1 font-semibold rounded cursor-pointer transition ${
                tab === 'constructors' ? 'bg-[#e10600] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Constructors
            </button>
          </div>

          {/* Export CSV */}
          <a
            href={`/api/v1/exports/standings?season=${season}&format=csv`}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#171d27] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center bg-[#12151b] border border-[#1f2530] rounded px-3 py-2 text-xs w-full sm:w-72">
        <Search className="w-4 h-4 text-[#64748b] mr-2" />
        <input
          type="text"
          placeholder="Filter by driver, code, or team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white placeholder-[#64748b] outline-none w-full"
        />
      </div>

      {/* Standings Table */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748b]">Loading standings from database...</div>
        ) : tab === 'drivers' ? (
          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th className="w-12 text-center">POS</th>
                <th>DRIVER</th>
                <th>TEAM</th>
                <th className="text-right">PTS</th>
                <th className="text-right">GAP LEADER</th>
                <th className="text-right">GAP PREV</th>
                <th className="text-center">WINS</th>
                <th className="text-center">PODIUMS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => (
                <tr key={d.driver_id} className="hover:bg-[#161a22] transition">
                  <td className="text-center font-mono font-bold text-white">
                    {d.position}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: d.team_color }}></span>
                      <span className="font-bold text-white">{d.name}</span>
                      {d.code && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-[#1a202c] text-[#94a3b8] rounded font-mono font-semibold">
                          {d.code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-[#94a3b8] font-medium">{d.team_name}</td>
                  <td className="text-right font-mono font-bold text-white text-sm">
                    {d.points}
                  </td>
                  <td className="text-right font-mono text-[#94a3b8]">
                    {d.gap_to_leader === 0 ? (
                      <span className="text-[#10b981] font-semibold">Leader</span>
                    ) : (
                      `-${d.gap_to_leader}`
                    )}
                  </td>
                  <td className="text-right font-mono text-[#64748b]">
                    {d.gap_to_prev === 0 ? '—' : `-${d.gap_to_prev}`}
                  </td>
                  <td className="text-center font-mono font-semibold text-white">
                    {d.wins}
                  </td>
                  <td className="text-center font-mono text-[#94a3b8]">
                    {d.podiums ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th className="w-12 text-center">POS</th>
                <th>CONSTRUCTOR</th>
                <th>NATIONALITY</th>
                <th className="text-right">PTS</th>
                <th className="text-right">GAP LEADER</th>
                <th className="text-right">GAP PREV</th>
                <th className="text-center">WINS</th>
              </tr>
            </thead>
            <tbody>
              {filteredConstructors.map((c) => (
                <tr key={c.constructor_id} className="hover:bg-[#161a22] transition">
                  <td className="text-center font-mono font-bold text-white">
                    {c.position}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-4 rounded-sm" style={{ backgroundColor: c.team_color }}></span>
                      <span className="font-bold text-white text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="text-[#94a3b8]">{c.nationality || 'International'}</td>
                  <td className="text-right font-mono font-bold text-white text-sm">
                    {c.points}
                  </td>
                  <td className="text-right font-mono text-[#94a3b8]">
                    {c.gap_to_leader === 0 ? (
                      <span className="text-[#10b981] font-semibold">Leader</span>
                    ) : (
                      `-${c.gap_to_leader}`
                    )}
                  </td>
                  <td className="text-right font-mono text-[#64748b]">
                    {c.gap_to_prev === 0 ? '—' : `-${c.gap_to_prev}`}
                  </td>
                  <td className="text-center font-mono font-semibold text-white">
                    {c.wins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
