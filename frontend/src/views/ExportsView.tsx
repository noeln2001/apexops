import React, { useState } from 'react';
import { Database, Download, FileText } from 'lucide-react';

interface ExportsViewProps {
  season: number;
}

export const ExportsView: React.FC<ExportsViewProps> = ({ season }) => {
  const [selectedDataset, setSelectedDataset] = useState('standings');
  const [format, setFormat] = useState('csv');

  const datasets = [
    {
      id: 'standings',
      name: 'Championship Driver & Team Standings',
      description: 'Championship points, official positions, total wins, and gaps for all drivers and constructors.',
      fields: ['Position', 'Driver', 'Code', 'Team', 'Points', 'Wins', 'Season', 'Attribution'],
      source: 'ApexOps / Jolpica F1 Archive'
    },
    {
      id: 'races',
      name: 'Official Championship Calendar & Results',
      description: 'Complete round schedules, dates, UTC times, and confirmed race statuses.',
      fields: ['Round', 'RaceName', 'Date', 'TimeUTC', 'Status', 'CircuitID', 'Season', 'Attribution'],
      source: 'ApexOps / Formula 1 Official Calendar'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#38bdf8]" />
          <span>Data Explorer & Controlled Dataset Exports</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Export verified motorsport intelligence datasets with schema provenance, data dictionaries, and rate protections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector Card */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Select Export Dataset</h3>

          <div className="space-y-2">
            {datasets.map((ds) => (
              <label
                key={ds.id}
                onClick={() => setSelectedDataset(ds.id)}
                className={`block p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                  selectedDataset === ds.id
                    ? 'bg-[#182232] border-[#38bdf8] text-white'
                    : 'bg-[#0d1017] border-[#1f2530] text-[#94a3b8] hover:border-[#2b3548]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{ds.name}</span>
                  <span className="px-1.5 py-0.2 bg-[#12151b] text-[#38bdf8] rounded font-mono text-[10px]">
                    {ds.id}
                  </span>
                </div>
                <p className="text-[#94a3b8] text-xs leading-relaxed">{ds.description}</p>
                <div className="mt-2 text-[10px] text-[#64748b]">Provenance: {ds.source}</div>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1f2530] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#64748b] font-medium">FORMAT:</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-[#0b0e14] border border-[#1f2530] rounded px-2.5 py-1 text-white font-bold cursor-pointer"
              >
                <option value="csv">CSV (Comma Separated)</option>
                <option value="json">JSON (Structured)</option>
              </select>
            </div>

            <a
              href={`/api/v1/exports/${selectedDataset}?season=${season}&format=${format}`}
              download
              className="flex items-center space-x-2 px-4 py-2 bg-[#e10600] hover:bg-[#b80500] text-white rounded text-xs font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()}</span>
            </a>
          </div>
        </div>

        {/* Data Dictionary & Security Rules */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#10b981]" />
            <span>Dataset Schema & Provenance Dictionary</span>
          </h3>

          <div className="space-y-3 text-xs text-[#94a3b8]">
            <div>
              <span className="text-white font-semibold">Attribution & Licensing: </span>
              All records exported through ApexOps adhere to Open Database License (ODbL) standards and carry source attribution metadata.
            </div>

            <div className="p-3 bg-[#0d1017] border border-[#1f2530] rounded-md space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-[#64748b]">EXPORTABLE FIELDS:</div>
              <div className="flex flex-wrap gap-1.5">
                {datasets
                  .find((d) => d.id === selectedDataset)
                  ?.fields.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#171d27] border border-[#232c3d] text-white font-mono text-[11px] rounded">
                      {f}
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-3 bg-[#132018] border border-[#1d422a] rounded-md text-[11px] text-[#86efac]">
              <span className="font-bold">Security Protection: </span>
              Export endpoints enforce pagination, query size caps, and parameter sanitization to prevent unconstrained SQL execution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
