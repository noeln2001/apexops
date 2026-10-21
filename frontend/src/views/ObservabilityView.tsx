import React, { useState, useEffect } from 'react';
import { fetchSystemMetrics } from '../services/api';
import { SystemMetrics } from '../types';
import { Sliders, Database, HardDrive, Cpu, RefreshCw } from 'lucide-react';

export const ObservabilityView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMetrics = () => {
    setLoading(true);
    fetchSystemMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#38bdf8]" />
            <span>Platform Observability & Infrastructure Telemetry</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Live system health, database query latencies, process memory RSS, and data ingestion run logs</p>
        </div>

        <button
          onClick={loadMetrics}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#171d28] hover:bg-[#202735] border border-[#273245] rounded text-xs font-semibold text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38bdf8]' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading && !metrics ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Collecting host observability telemetry...</div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Scheduled Ingestion Freshness Banner */}
          <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            metrics.ingestion?.stale_data_warning
              ? 'bg-[#291717] border-[#592626] text-[#ff8080]'
              : 'bg-[#102217] border-[#1e4e2e] text-[#4ade80]'
          }`}>
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${metrics.ingestion?.stale_data_warning ? 'bg-[#ef4444]' : 'bg-[#10b981] animate-pulse'}`}></span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  APScheduler Ingestion Cadence: {metrics.ingestion?.stale_data_warning ? 'STALE' : 'LIVE & FRESH (Hourly on Race Weekends)'}
                </div>
                <div className="text-[11px] text-[#cbd5e1] mt-0.5">
                  {metrics.ingestion?.stale_data_warning
                    ? metrics.ingestion?.stale_reason
                    : `Idempotent Jolpica reconciler active • Last synced: ${metrics.ingestion?.last_successful_run ? metrics.ingestion.last_successful_run.slice(0, 19).replace('T', ' ') : 'Just now'} UTC`}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono font-bold bg-[#0b1610] px-3 py-1.5 rounded border border-[#1e4e2e] text-[#10b981]">
              FRESHNESS: OPTIMAL
            </div>
          </div>

          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-[#64748b] font-semibold">
                <span>SYSTEM HEALTH</span>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              </div>
              <div className="text-2xl font-black font-mono text-[#10b981] mt-1">{metrics.status}</div>
              <div className="text-[10px] text-[#94a3b8] mt-1 font-mono">Uptime: {(metrics.uptime_seconds / 60).toFixed(1)} mins</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-[#64748b] font-semibold">
                <span>DATABASE PING</span>
                <Database className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">{metrics.database.ping_latency_ms} ms</div>
              <div className="text-[10px] text-[#94a3b8] mt-1 font-mono">Engine: {metrics.database.engine}</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-[#64748b] font-semibold">
                <span>MEMORY (RSS)</span>
                <Cpu className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">{metrics.backend.memory_rss_mb} MB</div>
              <div className="text-[10px] text-[#94a3b8] mt-1 font-mono">CPU: {metrics.backend.cpu_percent}%</div>
            </div>

            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-[#64748b] font-semibold">
                <span>DISK CAPACITY</span>
                <HardDrive className="w-4 h-4 text-[#a855f7]" />
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">{metrics.backend.disk_free_gb} GB Free</div>
              <div className="text-[10px] text-[#94a3b8] mt-1 font-mono">Total Volume: {metrics.backend.disk_total_gb} GB</div>
            </div>
          </div>

          {/* Providers Health Table */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
            <div className="p-4 border-b border-[#1f2530]">
              <h3 className="text-sm font-bold text-white">External Data Provider Ping Latencies</h3>
              <p className="text-[11px] text-[#64748b]">Jolpica F1, OpenF1, FastF1, and Official Press endpoints status</p>
            </div>
            <table className="w-full text-left text-xs table-f1">
              <thead>
                <tr>
                  <th>PROVIDER NAME</th>
                  <th>INGESTION TYPE</th>
                  <th>PING LATENCY</th>
                  <th>HEALTH STATUS</th>
                  <th className="text-right">LAST SUCCESSFUL SYNC</th>
                </tr>
              </thead>
              <tbody>
                {metrics.providers.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#161a22] transition">
                    <td className="font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                      <span>{p.name}</span>
                    </td>
                    <td className="text-[#94a3b8] font-mono text-xs">{p.type}</td>
                    <td className="font-mono text-white">{p.last_ping_ms.toFixed(1)} ms</td>
                    <td>
                      <span className="px-2 py-0.5 text-[10px] bg-[#162a1e] text-[#4ade80] border border-[#1e462c] rounded font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs text-[#64748b]">
                      {p.last_success_at ? p.last_success_at.slice(0, 19).replace('T', ' ') : 'Nominal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Ingestion Runs Table */}
          <div className="bg-[#12151b] border border-[#1f2530] rounded-lg overflow-x-auto shadow-sm">
            <div className="p-4 border-b border-[#1f2530]">
              <h3 className="text-sm font-bold text-white">Recent Data Ingestion Runs</h3>
              <p className="text-[11px] text-[#64748b]">Audit log of scheduled and manual historical import execution</p>
            </div>
            <table className="w-full text-left text-xs table-f1">
              <thead>
                <tr>
                  <th>RUN ID</th>
                  <th>DATASET</th>
                  <th>RECORDS PROCESSED</th>
                  <th>DURATION</th>
                  <th>STATUS</th>
                  <th className="text-right">TIMESTAMP (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {metrics.ingestion.recent_runs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#161a22] transition">
                    <td className="font-mono text-white">RUN-{r.id}</td>
                    <td className="font-semibold text-white">{r.dataset}</td>
                    <td className="font-mono text-[#38bdf8] font-bold">{r.records} records</td>
                    <td className="font-mono text-[#94a3b8]">{r.duration_sec}s</td>
                    <td>
                      <span className="px-2 py-0.5 text-[10px] bg-[#162a1e] text-[#4ade80] border border-[#1e462c] rounded font-semibold">
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs text-[#64748b]">
                      {r.started_at ? r.started_at.slice(0, 19).replace('T', ' ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
