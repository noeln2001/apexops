import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRaceDetails, fetchRaceResults, fetchRaces, fetchLiveSessionCurrent } from '../services/api';
import { Flag, Clock, Calendar, MapPin, Award, Radio, AlertCircle } from 'lucide-react';

interface WeekendCentreViewProps {
  season: number;
}

interface LiveSessionData {
  has_live_session: boolean;
  status: string;
  server_time_utc: string;
  next_session?: {
    race_id: string;
    race_name: string;
    session_name: string;
    scheduled_utc: string;
    countdown_seconds: number;
    circuit_name: string;
    country: string;
  };
  live_positions: Array<{
    position: number;
    driver_number: number;
    interval: string;
    tyre_compound: string;
    tyre_laps: number;
    status: string;
  }>;
  polling_interval_sec: number;
}

export const WeekendCentreView: React.FC<WeekendCentreViewProps> = ({ season }) => {
  const [selectedRaceId, setSelectedRaceId] = useState<string>('2026-17');
  const [raceDetails, setRaceDetails] = useState<any>(null);
  const [raceResults, setRaceResults] = useState<any>(null);
  const [allRaces, setAllRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Centre & Countdown
  const [liveState, setLiveState] = useState<LiveSessionData | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const backoffRef = useRef<number>(10000);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const pollLiveState = useCallback(async () => {
    try {
      const data = await fetchLiveSessionCurrent();
      setLiveState(data);
      if (data.next_session?.countdown_seconds !== undefined) {
        setSecondsRemaining(data.next_session.countdown_seconds);
      }
      backoffRef.current = 10000; // Reset to 10s on success
    } catch {
      // Exponential backoff up to 60s
      backoffRef.current = Math.min(60000, backoffRef.current * 2);
    } finally {
      pollTimerRef.current = setTimeout(pollLiveState, backoffRef.current);
    }
  }, []);

  useEffect(() => {
    pollLiveState();
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [pollLiveState]);

  // 1-second countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRaces(season).then((races) => {
      setAllRaces(races);
      if (races.length > 0) {
        const defaultRace = races.find((r) => r.round === 17) || races[0];
        setSelectedRaceId(defaultRace.race_id);
      }
    });
  }, [season]);

  useEffect(() => {
    if (!selectedRaceId) return;
    setLoading(true);
    Promise.all([fetchRaceDetails(selectedRaceId), fetchRaceResults(selectedRaceId)])
      .then(([details, results]) => {
        setRaceDetails(details);
        setRaceResults(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRaceId]);

  const formatCountdown = (totalSec: number) => {
    const d = Math.floor(totalSec / (3600 * 24));
    const h = Math.floor((totalSec % (3600 * 24)) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  const formatLocalTime = (utcStr?: string) => {
    if (!utcStr) return 'TBD';
    try {
      const dt = new Date(utcStr);
      return dt.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return utcStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Race Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Flag className="w-5 h-5 text-[#e10600]" />
            <span>Race Weekend Live Centre &amp; Trackside Timetable</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">
            Live timing telemetry, OpenF1 multi-car interval tracking, local browser timezone conversion ({userTimezone}), and verified classifications
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#12151b] border border-[#1f2530] rounded px-3 py-1.5 text-xs">
          <span className="text-[#64748b] font-medium">EVENT:</span>
          <select
            value={selectedRaceId}
            onChange={(e) => setSelectedRaceId(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            {allRaces.map((r) => (
              <option key={r.race_id} value={r.race_id} className="bg-[#12151b]">
                Round {r.round}: {r.name} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Race Weekend Live Centre Banner */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1f2530]">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              liveState?.has_live_session
                ? 'bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                  liveState?.has_live_session
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {liveState?.has_live_session ? '● LIVE SESSION ACTIVE' : 'NO LIVE SESSION IN PROGRESS'}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  OpenF1 Polling (10s backoff)
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {liveState?.has_live_session
                  ? `${liveState.next_session?.session_name || 'Active Session'} — ${liveState.next_session?.race_name || 'Grand Prix'}`
                  : `Next: ${liveState?.next_session?.race_name || 'Upcoming Grand Prix'} (${liveState?.next_session?.session_name || 'Session'})`}
              </h3>
            </div>
          </div>

          {/* Countdown Clock */}
          {liveState?.next_session && (
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-right">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {liveState.has_live_session ? 'SESSION TIME REMAINING' : 'COUNTDOWN TO NEXT SESSION'}
              </div>
              <div className="text-xl font-black font-mono text-[#38bdf8] mt-0.5">
                {formatCountdown(secondsRemaining)}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                Local: {formatLocalTime(liveState.next_session.scheduled_utc)}
              </div>
            </div>
          )}
        </div>

        {/* Live Positions Table when Session is Live */}
        {liveState?.has_live_session && liveState.live_positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-f1">
              <thead>
                <tr>
                  <th className="w-12 text-center">POS</th>
                  <th>DRIVER #</th>
                  <th>INTERVAL</th>
                  <th>TYRE</th>
                  <th>STINT AGE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {liveState.live_positions.map((p) => (
                  <tr key={p.driver_number} className="hover:bg-zinc-800/40 font-mono">
                    <td className="text-center font-bold text-white">P{p.position}</td>
                    <td className="font-bold text-white">#{p.driver_number}</td>
                    <td className="text-[#f59e0b] font-bold">{p.interval}</td>
                    <td>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        {p.tyre_compound}
                      </span>
                    </td>
                    <td className="text-zinc-300">{p.tyre_laps} Laps</td>
                    <td className="text-[#10b981] font-semibold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-500" />
              <span>Track timing transponders idle. No active session telemetry streaming at this moment.</span>
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Next scheduled broadcast in {formatCountdown(secondsRemaining)}
            </span>
          </div>
        )}
      </div>

      {loading || !raceDetails ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Loading race weekend data...</div>
      ) : (
        <div className="space-y-6">
          {/* Weekend Summary Banner */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  raceDetails.status === 'Completed'
                    ? 'bg-[#152a1c] text-[#4ade80] border border-[#1c4728]'
                    : 'bg-[#2b1717] text-[#ff6b6b] border border-[#522020]'
                }`}>
                  ROUND {raceDetails.round} • {raceDetails.status}
                </span>
                <span className="text-xs text-[#94a3b8] font-mono">{raceDetails.date}</span>
              </div>
              <h1 className="text-2xl font-black text-white">{raceDetails.name}</h1>
              <div className="flex items-center space-x-3 text-xs text-[#94a3b8] pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{raceDetails.circuit.name}, {raceDetails.circuit.country}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Circuit Timezone: {raceDetails.circuit.timezone}</span>
                </span>
                <span>•</span>
                <span className="text-[#10b981] font-semibold">
                  Your Local: {userTimezone}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-lg text-right">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">BROADCAST TIMING</div>
              <div className="text-sm font-bold text-[#38bdf8] font-mono">{raceDetails.ist_race_time}</div>
            </div>
          </div>

          {/* Timetable Schedule Grid */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#38bdf8]" />
              <span>Weekend Timetable &amp; Local ({userTimezone}) Windows</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {raceDetails.weekend_schedule.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">{item.day}</div>
                  <div className="text-xs font-bold text-white">{item.session}</div>
                  <div className="text-[11px] font-mono text-[#94a3b8]">{item.utc}</div>
                  <div className="text-[10px] font-mono text-[#38bdf8] font-semibold pt-1 border-t border-[#1a202c]">
                    {item.ist}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classification Table */}
          {raceResults && raceResults.classifications && raceResults.classifications.length > 0 && (
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
              <div className="p-4 border-b border-[#1f2530] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Grand Prix Race Classification</h3>
                  <p className="text-[11px] text-[#64748b]">Confirmed final order, pit time intervals and fastest lap awards</p>
                </div>
                <span className="text-xs font-mono text-[#10b981] font-semibold">Official Classification Confirmed</span>
              </div>

              <table className="w-full text-left text-xs table-f1">
                <thead>
                  <tr>
                    <th className="w-12 text-center">POS</th>
                    <th>DRIVER</th>
                    <th>TEAM</th>
                    <th className="text-center">GRID</th>
                    <th className="text-center">LAPS</th>
                    <th>TIME / RETIREMENT</th>
                    <th className="text-right">PTS</th>
                    <th className="text-center">FASTEST LAP</th>
                  </tr>
                </thead>
                <tbody>
                  {raceResults.classifications.map((r: any) => (
                    <tr key={r.driver_id} className="hover:bg-[#161a22] transition">
                      <td className="text-center font-mono font-bold text-white">
                        {r.position || r.position_text}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: r.constructor_color }}></span>
                          <span className="font-bold text-white">{r.driver_name}</span>
                          {r.driver_code && (
                            <span className="px-1.5 py-0.2 text-[10px] bg-[#1a202c] text-[#94a3b8] rounded font-mono font-semibold">
                              {r.driver_code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-[#94a3b8] font-medium">{r.constructor_name}</td>
                      <td className="text-center font-mono text-[#64748b]">{r.grid}</td>
                      <td className="text-center font-mono text-white">{r.laps}</td>
                      <td className="font-mono text-xs text-[#94a3b8]">{r.time_str}</td>
                      <td className="text-right font-mono font-bold text-white text-sm">+{r.points}</td>
                      <td className="text-center font-mono text-xs text-[#38bdf8]">
                        {r.fastest_lap_time ? (
                          <span className="flex items-center justify-center space-x-1">
                            <Award className="w-3.5 h-3.5 text-[#a855f7]" />
                            <span>{r.fastest_lap_time}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default WeekendCentreView;
