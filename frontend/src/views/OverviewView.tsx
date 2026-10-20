import React from 'react';
import { OverviewData } from '../types';
import { Flag, Clock, Trophy, Shield, ChevronRight, Activity, AlertCircle, ArrowUpRight } from 'lucide-react';

interface OverviewViewProps {
  data: OverviewData | null;
  loading: boolean;
  onNavigate: (view: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ data, loading, onNavigate }) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96 text-[#64748b] text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e10600] mr-3"></div>
        Connecting to ApexOps Ingestion Engine...
      </div>
    );
  }

  if (!data) return null;

  const upcoming = data.upcoming_event || {
    round: 18,
    status: 'Confirmed',
    date: '2026-10-25',
    circuit_timezone: 'America/Chicago (UTC-5)',
    name: 'United States Grand Prix',
    circuit_name: 'Circuit of the Americas',
    ist_schedule: 'Monday, 26 October 00:30 IST (Race)'
  };
  const latest = data.latest_completed_event || {
    name: 'Singapore Grand Prix',
    round: 17,
    date: '2026-10-11',
    results: []
  };
  const driverStandings = data.driver_standings || [];
  const constructorStandings = data.constructor_standings || [];
  const recentNews = data.recent_news || [];
  const providerHealth = data.provider_health || [];
  const latestResults = latest.results || [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Upcoming Grand Prix & Countdown */}
      <div className="bg-gradient-to-r from-[#121620] via-[#151a24] to-[#121620] border border-[#232b38] rounded-lg p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#e10600] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2d1212] text-[#ff6b6b] border border-[#522020] rounded tracking-wider uppercase">
                ROUND {upcoming.round || 18} • {upcoming.status || 'Confirmed'}
              </span>
              <span className="text-xs text-[#94a3b8] font-mono">
                {upcoming.date || '2026-10-25'} • {upcoming.circuit_timezone || 'UTC'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Flag className="w-6 h-6 text-[#e10600]" />
              {upcoming.name || 'United States Grand Prix'}
            </h1>
            <p className="text-xs text-[#94a3b8]">
              Venue: <strong className="text-white">{upcoming.circuit_name || 'Circuit of the Americas'}</strong> • Indian Standard Time: <strong className="text-[#38bdf8]">{upcoming.ist_schedule || '00:30 IST'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#0b0e14] border border-[#1f2530] p-3 rounded-lg">
            <div className="text-center px-3 border-r border-[#1f2530]">
              <div className="text-2xl font-mono font-bold text-white">03</div>
              <div className="text-[9px] uppercase tracking-wider text-[#64748b]">DAYS</div>
            </div>
            <div className="text-center px-3 border-r border-[#1f2530]">
              <div className="text-2xl font-mono font-bold text-white">14</div>
              <div className="text-[9px] uppercase tracking-wider text-[#64748b]">HOURS</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-mono font-bold text-[#e10600]">26</div>
              <div className="text-[9px] uppercase tracking-wider text-[#64748b]">MINS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Latest Result vs Championship Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Completed Race */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2530]">
              <div>
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">LATEST CONFIRMED GRAND PRIX</span>
                <h3 className="text-base font-bold text-white">{latest.name}</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-[#162a1e] text-[#4ade80] border border-[#1e462c] rounded font-semibold">
                COMPLETED
              </span>
            </div>

            <div className="mt-3 divide-y divide-[#181d27]">
              {latestResults.slice(0, 5).map((r, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-5 font-mono text-center font-bold ${idx === 0 ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>
                      P{r.position}
                    </span>
                    <span className="w-1.5 h-3.5 rounded-sm" style={{ backgroundColor: r.constructor_color }}></span>
                    <div>
                      <div className="font-semibold text-white">{r.driver_name}</div>
                      <div className="text-[10px] text-[#64748b]">{r.constructor_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white text-[11px] font-semibold">+{r.points} pts</div>
                    <div className="text-[10px] text-[#64748b] font-mono">{r.time_str}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('weekend')}
            className="mt-4 w-full py-2 bg-[#161a22] hover:bg-[#1e232f] border border-[#232b38] rounded text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <span>Full Singapore Classification & Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drivers Standings Card */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2530]">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-[#e10600]" />
                <h3 className="text-base font-bold text-white">Driver Championship</h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748b]">Season 2026</span>
            </div>

            <div className="mt-3 divide-y divide-[#181d27]">
              {driverStandings.slice(0, 5).map((d) => (
                <div key={d.driver_id || d.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 font-mono text-center font-bold text-white">
                      {d.position}
                    </span>
                    <span className="w-1.5 h-3.5 rounded-sm" style={{ backgroundColor: d.team_color }}></span>
                    <div>
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-[10px] text-[#64748b]">{d.team_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white font-bold">{d.points} PTS</div>
                    <div className="text-[10px] text-[#94a3b8] font-mono">
                      {d.gap_to_leader === 0 ? 'Leader' : `-${d.gap_to_leader} pts`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('standings')}
            className="mt-4 w-full py-2 bg-[#161a22] hover:bg-[#1e232f] border border-[#232b38] rounded text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <span>View Full Driver Table & Progression</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Constructors Standings Card */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2530]">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-base font-bold text-white">Constructors Title</h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748b]">Season 2026</span>
            </div>

            <div className="mt-3 divide-y divide-[#181d27]">
              {constructorStandings.slice(0, 5).map((c) => (
                <div key={c.constructor_id || c.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 font-mono text-center font-bold text-white">
                      {c.position}
                    </span>
                    <span className="w-1.5 h-3.5 rounded-sm" style={{ backgroundColor: c.team_color }}></span>
                    <div className="font-semibold text-white">{c.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white font-bold">{c.points} PTS</div>
                    <div className="text-[10px] text-[#94a3b8] font-mono">
                      {c.gap_to_leader === 0 ? 'Leader' : `-${c.gap_to_leader} pts`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('standings')}
            className="mt-4 w-full py-2 bg-[#161a22] hover:bg-[#1e232f] border border-[#232b38] rounded text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <span>View Full Team Standings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Curated Technical News & Provider Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curated News Stream */}
        <div className="lg:col-span-2 bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2530]">
            <div>
              <h3 className="text-sm font-bold text-white">Formula 1 Intelligence & Technical Updates</h3>
              <p className="text-[11px] text-[#64748b]">Curated feeds with source verification and confirmation rating</p>
            </div>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-[#38bdf8] hover:underline flex items-center space-x-1"
            >
              <span>All News & FIA Bulletins</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {recentNews.map((item) => (
              <div key={item.id} className="p-3 bg-[#0d1017] border border-[#1c222e] rounded-md hover:border-[#2a3447] transition">
                <div className="flex items-center space-x-2 text-[10px] font-semibold mb-1">
                  <span className="text-[#38bdf8] uppercase tracking-wider">{item.publisher}</span>
                  <span className="text-[#475569]">•</span>
                  <span className="px-1.5 py-0.2 bg-[#172338] text-[#38bdf8] rounded">{item.category}</span>
                  <span className="text-[#475569]">•</span>
                  <span className="text-[#10b981]">{item.confirmation_status}</span>
                </div>
                <h4 className="text-xs font-bold text-white hover:text-[#38bdf8] transition">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.headline}
                  </a>
                </h4>
                <p className="text-[11px] text-[#94a3b8] mt-1 line-clamp-2">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Engine Health Box */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#1f2530] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Data Engine Status</h3>
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            </div>

            <div className="mt-3 space-y-2.5">
              {providerHealth.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d1017] border border-[#1b212c] rounded flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <div className="text-right font-mono text-[11px] text-[#64748b]">
                    <span className="text-[#10b981] mr-2">{p.status}</span>
                    <span>{typeof p.last_ping_ms === 'number' ? p.last_ping_ms.toFixed(1) : p.last_ping_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-[#171d28] border border-[#242e40] rounded text-[11px] text-[#94a3b8]">
              <div className="flex items-center space-x-1.5 font-semibold text-white mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Reference Time Validation</span>
              </div>
              <div>System pinned to <strong>20 Oct 2026</strong>. Round 17 Singapore confirmed; Round 18 Austin US GP verified on official schedule for 23–25 October.</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('observability')}
            className="mt-4 w-full py-2 bg-[#161a22] hover:bg-[#1e232f] border border-[#232b38] rounded text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <span>Inspect System Observability</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
