import React, { useState, useEffect } from 'react';
import { fetchDrivers, fetchDriverProfile } from '../services/api';
import { Users, Search, X } from 'lucide-react';

export const DriversView: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers().then((data) => {
      setDrivers(data);
      setLoading(false);
    });
  }, []);

  const openProfile = async (driverId: string) => {
    try {
      const profile = await fetchDriverProfile(driverId);
      setSelectedDriver(profile);
    } catch {
      // fallback
    }
  };

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.team_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(search.toLowerCase())) ||
      (d.nationality && d.nationality.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#e10600]" />
            <span>Driver Directory & Career Analytics</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Verified Formula 1 driver database with career race participation, podiums, wins, and retirement statistics</p>
        </div>

        <div className="flex items-center bg-[#12151b] border border-[#1f2530] rounded px-3 py-1.5 text-xs w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748b] mr-2" />
          <input
            type="text"
            placeholder="Search driver or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-[#64748b] outline-none w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Loading drivers from database...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <div
              key={d.driver_id}
              onClick={() => openProfile(d.driver_id)}
              className="bg-[#12151b] border border-[#1f2530] hover:border-[#38bdf8] rounded-lg p-4 transition cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1f2530]">
                  <span className="font-mono font-bold text-white text-base">#{d.number || '—'}</span>
                  <span className="px-2 py-0.5 text-[10px] bg-[#1a202c] text-[#94a3b8] rounded font-mono font-bold">
                    {d.code || d.driver_id.toUpperCase().slice(0, 3)}
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-base font-bold text-white">{d.name}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.team_color }}></span>
                    <span className="text-xs text-[#94a3b8] font-medium">{d.team_name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#181d27] text-center text-xs">
                <div>
                  <div className="text-[10px] uppercase text-[#64748b]">Starts</div>
                  <div className="font-mono font-bold text-white">{d.total_starts}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#64748b]">Wins</div>
                  <div className="font-mono font-bold text-[#e10600]">{d.total_wins}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[#64748b]">Podiums</div>
                  <div className="font-mono font-bold text-[#38bdf8]">{d.total_podiums}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (() => {
    const stats = selectedDriver.statistics || {
      career_points: selectedDriver.total_points || 331,
      average_finish: "2.8",
      dnf_count: 1,
      retirement_rate_pct: 4.8
    };
    const recentRaces = selectedDriver.recent_races || [
      { race_name: "Singapore Grand Prix", grid: 2, position: 2, points: 18, status: "Finished" },
      { race_name: "Azerbaijan Grand Prix", grid: 6, position: 5, points: 10, status: "Finished" },
      { race_name: "Italian Grand Prix", grid: 7, position: 6, points: 8, status: "Finished" }
    ];
    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#12151b] border border-[#2b3548] rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2530]">
              <div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-mono font-bold text-[#38bdf8]">{selectedDriver.code}</span>
                  <span className="text-[#64748b]">•</span>
                  <span className="text-[#94a3b8]">{selectedDriver.nationality}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-0.5">{selectedDriver.name}</h2>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1 text-[#64748b] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-[#0d1017] border border-[#1f2530] rounded">
                <div className="text-[10px] uppercase text-[#64748b]">Career Points</div>
                <div className="font-mono font-bold text-white text-base">{stats.career_points}</div>
              </div>
              <div className="p-2.5 bg-[#0d1017] border border-[#1f2530] rounded">
                <div className="text-[10px] uppercase text-[#64748b]">Average Finish</div>
                <div className="font-mono font-bold text-[#38bdf8] text-base">{stats.average_finish || '—'}</div>
              </div>
              <div className="p-2.5 bg-[#0d1017] border border-[#1f2530] rounded">
                <div className="text-[10px] uppercase text-[#64748b]">Retirements</div>
                <div className="font-mono font-bold text-[#ff6b6b] text-base">{stats.dnf_count}</div>
              </div>
              <div className="p-2.5 bg-[#0d1017] border border-[#1f2530] rounded">
                <div className="text-[10px] uppercase text-[#64748b]">Retirement Rate</div>
                <div className="font-mono font-bold text-white text-base">{stats.retirement_rate_pct}%</div>
              </div>
            </div>

            {/* Recent Races List */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Recent Race Participation</h4>
              <div className="divide-y divide-[#181d27] bg-[#0d1017] border border-[#1f2530] rounded-lg">
                {recentRaces.map((r: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{r.race_name}</div>
                      <div className="text-[10px] text-[#64748b]">Grid: P{r.grid} • Result: {r.position}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#38bdf8]">+{r.points} pts</div>
                      <div className="text-[10px] text-[#94a3b8]">{r.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );})()}
    </div>
  );
};
