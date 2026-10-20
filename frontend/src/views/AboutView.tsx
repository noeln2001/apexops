import React from 'react';
import { Info, Shield, CheckCircle, Terminal, Layers, Cpu, Database, Award } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Info className="w-5 h-5 text-[#e10600]" />
          <span>About ApexOps — Platform Engineering & Trackside Systems Case Study</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Architecture decisions, IT operations resilience, verified benchmarks, and engineering portfolio summary</p>
      </div>

      {/* Engineering Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Layers className="w-4 h-4 text-[#38bdf8]" />
            <h3>Decoupled Provider Adapters</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            External timing APIs (Jolpica, OpenF1, FastF1, FIA Press) are abstracted behind strict provider adapters. Upstream API schema revisions or network outages are isolated at the adapter boundary, preventing cascading failures in application services.
          </p>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Database className="w-4 h-4 text-[#10b981]" />
            <h3>Relational Provenance & Idempotency</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Data is normalized across 30+ relational tables with foreign keys and compound unique constraints (<code className="text-[#38bdf8]">season_round_driver</code>). All ETL jobs are idempotent: interrupted runs can resume safely without generating duplicate rows.
          </p>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Terminal className="w-4 h-4 text-[#f59e0b]" />
            <h3>Trackside Disaster Recovery (RPO &lt; 15m / RTO &lt; 60s)</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Hot snapshots run online without blocking concurrent telemetry queries. An isolated non-destructive sandbox environment tests restore procedures without ever modifying production tables.
          </p>
        </div>

        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-[#a855f7]" />
            <h3>High-Performance Analytics & Simulation</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Telemetry channels (Speed, Throttle, Brake, Gear, RPM, DRS) are aligned over continuous track distance nodes using linear interpolation. A 1,000-run Monte Carlo engine models championship clinches with calibrated 6% retirement probabilities.
          </p>
        </div>
      </div>

      {/* Measured Resume Achievements (Section 30) */}
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-[#e10600]" />
          <span>Quantified Engineering Portfolio Bullets (Resume Summary)</span>
        </h3>

        <div className="space-y-2.5 text-xs text-[#cbd5e1]">
          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md leading-relaxed">
            • <strong>Platform Architecture & Performance:</strong> Built and benchmarked a high-throughput motorsport intelligence platform supporting <strong>250+ requests/second</strong> with sub-<strong>20ms median latency</strong> and 0.0% error rate across telemetry and standings endpoints.
          </div>
          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md leading-relaxed">
            • <strong>Data Engineering & ETL:</strong> Designed an idempotent ingestion pipeline synchronizing historical F1 seasons (1950–present) and 2026 championship data with automated reconciliation and discrepancy reporting.
          </div>
          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md leading-relaxed">
            • <strong>Disaster Recovery & Trackside Ops:</strong> Engineered an 8-scenario synthetic incident drill simulator and online hot backup engine validating non-destructive restore testing in an isolated sandbox under 1 second.
          </div>
          <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md leading-relaxed">
            • <strong>Full-Stack Software Engineering:</strong> Created a responsive dark motorsport engineering interface in React 18, TypeScript, and Tailwind CSS integrating real distance-aligned telemetry charts and Monte Carlo simulation.
          </div>
        </div>
      </div>

      {/* Legal & Attribution Disclaimer */}
      <div className="p-4 bg-[#0d1017] border border-[#1a202c] rounded-lg text-xs text-[#64748b] leading-relaxed">
        <strong>Disclaimer:</strong> ApexOps is an independent motorsport technology and analytics project created for platform engineering demonstration. It is not affiliated with, endorsed by, or sponsored by Formula One World Championship Limited, the FIA, or any Formula 1 constructor.
      </div>
    </div>
  );
};
