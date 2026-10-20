import React, { useState, useEffect } from 'react';
import { fetchRaceDetails, fetchRaceResults, fetchRaces } from '../services/api';
import { Flag, Clock, Calendar, Shield, MapPin, ChevronRight, AlertCircle, Award } from 'lucide-react';

interface WeekendCentreViewProps {
  season: number;
}

export const WeekendCentreView: React.FC<WeekendCentreViewProps> = ({ season }) => {
  const [selectedRaceId, setSelectedRaceId] = useState<string>('2026-17');
  const [raceDetails, setRaceDetails] = useState<any>(null);
  const [raceResults, setRaceResults] = useState<any>(null);
  const [allRaces, setAllRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaces(season).then((races) => {
      setAllRaces(races);
      if (races.length > 0) {
        // Find Singapore GP (Round 17) or first completed race
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

  return (
    <div className="space-y-6">
      {/* Top Selector & Race Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Flag className="w-5 h-5 text-[#e10600]" />
            <span>Race Weekend Centre & Trackside Timetable</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Live weekend schedules, local circuit timezones, India Standard Time (IST) conversion, and classifications</p>
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
              </div>
            </div>

            <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-lg text-right">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">INDIA STANDARD TIME CONVERSION</div>
              <div className="text-sm font-bold text-[#38bdf8] font-mono">{raceDetails.ist_race_time}</div>
            </div>
          </div>

          {/* Timetable Schedule Grid */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#38bdf8]" />
              <span>Weekend Timetable & IST Session Broadcast Windows</span>
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
