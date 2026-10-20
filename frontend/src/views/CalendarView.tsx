import React, { useState, useEffect } from 'react';
import { fetchRaces } from '../services/api';
import { RaceItem } from '../types';
import { Calendar, Flag, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface CalendarViewProps {
  season: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ season }) => {
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRaces(season).then((data) => {
      setRaces(data);
      setLoading(false);
    });
  }, [season]);

  return (
    <div className="space-y-5">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#e10600]" />
          <span>Formula 1 Championship Calendar — Season {season}</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Authoritative Grand Prix schedules with verified event statuses and Indian Standard Time (IST) conversions</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Loading race calendar...</div>
      ) : (
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs table-f1">
            <thead>
              <tr>
                <th className="w-12 text-center">RND</th>
                <th>GRAND PRIX</th>
                <th>CIRCUIT & LOCATION</th>
                <th>DATE (UTC)</th>
                <th>INDIAN STANDARD TIME (IST)</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {races.map((r) => {
                const isCompleted = r.status === 'Completed';
                const isConfirmed = r.status === 'Confirmed';
                const isUpcoming = r.round === 18;

                return (
                  <tr
                    key={r.race_id}
                    className={`hover:bg-[#161a22] transition ${
                      isUpcoming ? 'bg-[#182030] border-l-2 border-[#38bdf8]' : ''
                    }`}
                  >
                    <td className="text-center font-mono font-bold text-white">
                      R{r.round}
                    </td>
                    <td>
                      <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                        <Flag className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#10b981]' : isConfirmed ? 'text-[#38bdf8]' : 'text-[#64748b]'}`} />
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-white font-medium">{r.circuit_name}</div>
                      <div className="text-[10px] text-[#64748b]">{r.country}</div>
                    </td>
                    <td className="font-mono text-[#94a3b8]">{r.date}</td>
                    <td className="font-mono text-[#38bdf8] font-semibold">{r.ist_schedule}</td>
                    <td className="text-center">
                      <span className={`px-2 py-0.5 text-[10px] rounded font-semibold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-[#152a1c] text-[#4ade80] border border-[#214f2e]'
                          : isConfirmed
                          ? 'bg-[#1a2d42] text-[#38bdf8] border border-[#2b4c6e] font-bold'
                          : 'bg-[#171d28] text-[#94a3b8] border border-[#242e40]'
                      }`}>
                        {r.status}
                      </span>
                    </td>
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
