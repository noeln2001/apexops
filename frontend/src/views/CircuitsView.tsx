import React, { useState, useEffect } from 'react';
import { fetchCircuits } from '../services/api';
import { CircuitItem } from '../types';
import { MapPin, Navigation, Flag, Search, Compass, Award } from 'lucide-react';

export const CircuitsView: React.FC = () => {
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircuits().then((data) => {
      setCircuits(data);
      setLoading(false);
    });
  }, []);

  const filtered = circuits.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#38bdf8]" />
            <span>Championship Circuit Directory & Track Geometry</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Verified track lengths, corner turn counts, DRS activation zones, and official lap records</p>
        </div>

        <div className="flex items-center bg-[#12151b] border border-[#1f2530] rounded px-3 py-1.5 text-xs w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748b] mr-2" />
          <input
            type="text"
            placeholder="Search circuit, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-[#64748b] outline-none w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Loading circuits...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.circuit_id}
              className="bg-[#12151b] border border-[#1f2530] hover:border-[#38bdf8] rounded-lg p-5 space-y-4 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1f2530]">
                  <span className="text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider">{c.country}</span>
                  <span className="text-[10px] font-mono text-[#64748b]">
                    {c.lat ? `${c.lat.toFixed(2)}°, ${c.lng ? c.lng.toFixed(2) : ''}°` : 'GPS Verified'}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-[#94a3b8] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e10600]" />
                    <span>{c.location}</span>
                  </div>
                </div>

                {/* Track Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#181d27] text-center text-xs">
                  <div className="p-1.5 bg-[#0d1017] rounded border border-[#1a202c]">
                    <div className="text-[10px] uppercase text-[#64748b]">Length</div>
                    <div className="font-mono font-bold text-white">{c.length_km.toFixed(3)} km</div>
                  </div>
                  <div className="p-1.5 bg-[#0d1017] rounded border border-[#1a202c]">
                    <div className="text-[10px] uppercase text-[#64748b]">Turns</div>
                    <div className="font-mono font-bold text-white">{c.turns}</div>
                  </div>
                  <div className="p-1.5 bg-[#0d1017] rounded border border-[#1a202c]">
                    <div className="text-[10px] uppercase text-[#64748b]">DRS Zones</div>
                    <div className="font-mono font-bold text-[#10b981]">{c.drs_zones}</div>
                  </div>
                </div>
              </div>

              {/* Lap Record Footer */}
              <div className="pt-2 text-[11px] text-[#94a3b8] flex items-center space-x-1.5 border-t border-[#181d27]">
                <Award className="w-3.5 h-3.5 text-[#a855f7] flex-shrink-0" />
                <span className="truncate">Record: <strong className="text-white font-mono">{c.lap_record_time}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
