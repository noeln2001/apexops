import React from 'react';
import { Activity, ShieldCheck, Clock, Search, RefreshCw } from 'lucide-react';
import { F1Logo } from './F1Logo';

interface NavbarProps {
  season: number;
  onSeasonChange: (season: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  season,
  onSeasonChange,
  onRefresh,
  loading
}) => {
  return (
    <header className="h-14 bg-[#0e1117] border-b border-[#1f2530] px-4 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Platform */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <F1Logo className="h-6 w-auto drop-shadow-[0_0_8px_rgba(225,6,0,0.6)]" />
          <div className="h-4 w-px bg-[#2d3748]"></div>
          <span className="font-black text-lg tracking-wider text-white">
            APEX<span className="text-[#e10600]">OPS</span>
          </span>
        </div>
        <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#1a202c] text-[#94a3b8] rounded border border-[#2d3748] uppercase tracking-wider">
          Trackside Intelligence &amp; Ops
        </span>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center space-x-6 text-xs text-[#94a3b8]">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>PROJECT ANCHOR: <strong className="text-white">20 OCT 2026</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>UPSTREAM: <strong className="text-white">JOLPICA / FIA ACTIVE</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          <span>ENV: <strong className="text-white">STANDALONE (VERIFIED)</strong></span>
        </div>
      </div>

      {/* Controls & Season Filter */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-[#151922] border border-[#232b38] rounded px-2.5 py-1 text-xs">
          <span className="text-[#64748b] mr-2 font-medium">SEASON:</span>
          <select
            value={season}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            <option value={2026} className="bg-[#12151b]">2026 (Active)</option>
            <option value={2025} className="bg-[#12151b]">2025</option>
            <option value={2024} className="bg-[#12151b]">2024</option>
            <option value={2023} className="bg-[#12151b]">2023</option>
            <option value={2022} className="bg-[#12151b]">2022</option>
            <option value={2021} className="bg-[#12151b]">2021</option>
            <option value={2020} className="bg-[#12151b]">2020</option>
            <option value={2019} className="bg-[#12151b]">2019</option>
            <option value={2018} className="bg-[#12151b]">2018</option>
            <option value={2017} className="bg-[#12151b]">2017</option>
            <option value={2016} className="bg-[#12151b]">2016</option>
            <option value={2015} className="bg-[#12151b]">2015</option>
            <option value={2014} className="bg-[#12151b]">2014</option>
            <option value={2013} className="bg-[#12151b]">2013</option>
            <option value={2012} className="bg-[#12151b]">2012</option>
            <option value={2011} className="bg-[#12151b]">2011</option>
            <option value={2010} className="bg-[#12151b]">2010</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Data Feeds"
          className="p-1.5 bg-[#151922] hover:bg-[#1e2533] border border-[#232b38] rounded text-[#94a3b8] hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#e10600]' : ''}`} />
        </button>
      </div>
    </header>
  );
};
