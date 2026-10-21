import React from 'react';
import { ExternalLink, X } from 'lucide-react';

export interface SourceCompliance {
  domain?: string;
  name: string;
  homepage?: string;
  url?: string;
  access_type?: string;
  license_compliance?: string;
  status?: string;
  details?: string;
  editorial_license_note?: string;
  max_resolution_found?: string;
  is_permitted?: boolean;
}

interface SourceCompliancePanelProps {
  sources: SourceCompliance[];
  onClose: () => void;
}

export const SourceCompliancePanel: React.FC<SourceCompliancePanelProps> = ({ sources, onClose }) => {
  return (
    <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          Permitted Source Domains &amp; Editorial Compliance Audit
        </h3>
        <button
          onClick={onClose}
          className="text-[#8b949e] hover:text-white text-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {sources.map((src, i) => (
          <div
            key={src.domain || src.name || i}
            className="p-3 bg-[#161b22] border border-[#21262d] rounded-lg space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{src.name}</span>
              {(src.url || src.homepage) && (
                <a
                  href={src.url || src.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#58a6ff] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {src.domain && <div className="text-[10px] text-[#8b949e] font-mono">{src.domain}</div>}
            {src.status && (
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-zinc-800 text-zinc-300">
                {src.status}
              </span>
            )}
            <div className="text-[11px] text-[#c9d1d9]">{src.details || src.editorial_license_note}</div>
            {src.license_compliance && (
              <div className="text-[10px] text-[#7ee787] font-semibold">
                {src.license_compliance}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
