import React, { useState, useEffect } from 'react';
import { fetchTelemetry } from '../services/api';
import { TelemetryData } from '../types';
import { Activity, Gauge, ArrowUpDown } from 'lucide-react';

interface TelemetryViewProps {
  season?: number;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ season: _season }) => {
  const [driverA, setDriverA] = useState('norris');
  const [driverB, setDriverB] = useState('verstappen');
  const [raceId] = useState('2026-17');
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTelemetry(raceId, driverA, driverB)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [raceId, driverA, driverB]);

  // SVG Chart Dimensions
  const chartWidth = 900;
  const chartHeight = 220;

  const renderSpeedPath = (speeds: number[], maxSpeed = 350) => {
    if (!speeds || speeds.length === 0) return '';
    const step = chartWidth / (speeds.length - 1);
    return speeds
      .map((spd, i) => {
        const x = i * step;
        const y = chartHeight - (spd / maxSpeed) * (chartHeight - 20) - 10;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const renderDeltaPath = (deltas: number[]) => {
    if (!deltas || deltas.length === 0) return '';
    const maxDelta = 1.5;
    const midY = 60;
    const step = chartWidth / (deltas.length - 1);
    return deltas
      .map((d, i) => {
        const x = i * step;
        const clamped = Math.max(-maxDelta, Math.min(maxDelta, d));
        const y = midY - (clamped / maxDelta) * 45;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#e10600]" />
            <span>Telemetry Lab — Distance-Aligned Overlay Traces</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Synchronized speed, delta-time, throttle, brake, gear and DRS channel comparative analysis</p>
        </div>

        {/* Driver Selectors */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center bg-[#12151b] border border-[#1f2530] rounded px-3 py-1.5">
            <span className="text-[#ff8000] font-bold mr-2">DRIVER A:</span>
            <select
              value={driverA}
              onChange={(e) => setDriverA(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="norris" className="bg-[#12151b]">Lando Norris (MCL)</option>
              <option value="piastri" className="bg-[#12151b]">Oscar Piastri (MCL)</option>
              <option value="leclerc" className="bg-[#12151b]">Charles Leclerc (FER)</option>
              <option value="hamilton" className="bg-[#12151b]">Lewis Hamilton (MER)</option>
            </select>
          </div>

          <div className="flex items-center bg-[#12151b] border border-[#1f2530] rounded px-3 py-1.5">
            <span className="text-[#38bdf8] font-bold mr-2">DRIVER B:</span>
            <select
              value={driverB}
              onChange={(e) => setDriverB(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="verstappen" className="bg-[#12151b]">Max Verstappen (RBR)</option>
              <option value="sainz" className="bg-[#12151b]">Carlos Sainz (FER)</option>
              <option value="russell" className="bg-[#12151b]">George Russell (MER)</option>
              <option value="alonso" className="bg-[#12151b]">Fernando Alonso (AST)</option>
            </select>
          </div>
        </div>
      </div>

      {loading || !data ? (
        <div className="p-16 text-center text-xs text-[#64748b]">Aligning vehicle distance telemetry...</div>
      ) : (
        <div className="space-y-6">
          {/* Main Speed Overlay Chart */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1f2530]">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#38bdf8]" />
                  SPEED TRACE (KM/H) OVER TRACK DISTANCE
                </span>
                <span className="flex items-center space-x-1.5 text-[#ff8000] font-semibold">
                  <span className="w-3 h-0.5 bg-[#ff8000]"></span>
                  <span>{data.driver_a.toUpperCase()} (Lap {data.lap_a_number})</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#38bdf8] font-semibold">
                  <span className="w-3 h-0.5 bg-[#38bdf8]"></span>
                  <span>{data.driver_b.toUpperCase()} (Lap {data.lap_b_number})</span>
                </span>
              </div>
              <span className="text-[10px] text-[#64748b] font-mono">Lap Distance: {data.telemetry.max_distance_m}m</span>
            </div>

            {/* SVG Speed Canvas */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 bg-[#0b0e14] rounded border border-[#1a202c]">
                {/* Horizontal Grid lines */}
                {[100, 200, 300].map((spd) => {
                  const y = chartHeight - (spd / 350) * (chartHeight - 20) - 10;
                  return (
                    <g key={spd}>
                      <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1a202c" strokeDasharray="4 4" />
                      <text x="10" y={y - 4} fill="#475569" fontSize="10" fontFamily="monospace">
                        {spd} km/h
                      </text>
                    </g>
                  );
                })}

                {/* Driver A Speed Path */}
                <path
                  d={renderSpeedPath(data.telemetry.lap_a.speed)}
                  fill="none"
                  stroke="#ff8000"
                  strokeWidth="2.2"
                />

                {/* Driver B Speed Path */}
                <path
                  d={renderSpeedPath(data.telemetry.lap_b.speed)}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.0"
                />
              </svg>
            </div>
          </div>

          {/* Delta Time Trace Chart */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1f2530]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-[#a855f7]" />
                TIME DELTA (SECONDS): POSITIVE = {data.driver_a.toUpperCase()} AHEAD / NEGATIVE = {data.driver_b.toUpperCase()} AHEAD
              </span>
              <span className="text-[10px] text-[#64748b]">Interval calculated per ds node</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} 120`} className="w-full h-32 bg-[#0b0e14] rounded border border-[#1a202c]">
                {/* Zero centerline */}
                <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="#334155" strokeWidth="1.5" />
                <text x="10" y="55" fill="#64748b" fontSize="10" fontFamily="monospace">0.00s (Parity)</text>

                {/* Delta Path */}
                <path
                  d={renderDeltaPath(data.telemetry.time_delta)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                />
              </svg>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">MAX SPEED {data.driver_a.toUpperCase()}</div>
              <div className="text-xl font-bold font-mono text-[#ff8000]">
                {Math.max(...data.telemetry.lap_a.speed).toFixed(1)} km/h
              </div>
              <div className="text-[10px] text-[#64748b]">Sector 3 Straight</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">MAX SPEED {data.driver_b.toUpperCase()}</div>
              <div className="text-xl font-bold font-mono text-[#38bdf8]">
                {Math.max(...data.telemetry.lap_b.speed).toFixed(1)} km/h
              </div>
              <div className="text-[10px] text-[#64748b]">Sector 3 Straight</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">APEX SPEED ADVANTAGE</div>
              <div className="text-xl font-bold font-mono text-white">
                +4.2 km/h
              </div>
              <div className="text-[10px] text-[#10b981]">Driver A in Turn 14-16 complex</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3">
              <div className="text-[10px] uppercase font-semibold text-[#64748b]">NET TIME ADVANTAGE</div>
              <div className="text-xl font-bold font-mono text-[#10b981]">
                -0.184s
              </div>
              <div className="text-[10px] text-[#64748b]">Across full synchronized lap</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
