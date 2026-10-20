import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FolderDown,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

interface VerifiedImage {
  id: string;
  title: string;
  driver: string;
  team: string;
  season: number;
  grand_prix?: string;
  source_site: string;
  source_page: string;
  original_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  aspect_ratio: number;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  resolution_label: string;
  is_uhd: boolean;
  file_size_bytes: number;
  file_size_mb: number;
  format: string;
  classification: 'EXCELLENT' | 'GOOD' | 'REVIEW' | 'REJECTED';
  is_valid: boolean;
  license: string;
  author: string;
  description: string;
  sha256: string;
  metrics: {
    sharpness_laplacian: number;
    edge_energy: number;
    high_frequency_spectral_mean: number;
    blockiness_ratio: number;
    is_upscaled: boolean;
  };
  reasons: string[];
  verified_at: string;
}

interface SourceCompliance {
  name: string;
  homepage: string;
  access_type: string;
  license_compliance: string;
  status: string;
  details: string;
}

export const GalleryView: React.FC = () => {
  // State
  const [images, setImages] = useState<VerifiedImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXCELLENT' | 'GOOD' | 'REVIEW' | 'REJECTED'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Search state
  const [driverName, setDriverName] = useState<string>('Max Verstappen');
  const [teamName, setTeamName] = useState<string>('Red Bull Racing');
  const [season, setSeason] = useState<number>(2026);
  const [grandPrix, setGrandPrix] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Custom URL verification state
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isVerifyingUrl, setIsVerifyingUrl] = useState<boolean>(false);
  const [urlVerifyError, setUrlVerifyError] = useState<string | null>(null);

  // Modals & Panels
  const [previewImage, setPreviewImage] = useState<VerifiedImage | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showCompliance, setShowCompliance] = useState<boolean>(false);
  const [sources, setSources] = useState<SourceCompliance[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Configurable thresholds
  const [thresholds, setThresholds] = useState({
    uhd_min_width: 3840,
    uhd_min_height: 2160,
    sharpness_threshold_excellent: 110.0,
    sharpness_threshold_good: 55.0,
    sharpness_threshold_review: 20.0,
    max_blockiness_ratio: 1.95,
  });

  // Fetch images & sources on mount
  useEffect(() => {
    loadGalleryImages();
    loadSourceCompliance();
  }, []);

  const loadGalleryImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/gallery/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to load gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceCompliance = async () => {
    try {
      const res = await fetch('/api/v1/gallery/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  const handleDiscover = async () => {
    setIsSearching(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/v1/gallery/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_name: driverName,
          team_name: teamName,
          season: season,
          grand_prix: grandPrix || null,
          limit: 12,
          thresholds: thresholds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const report = data.discovery_report;
        if (report && report.images) {
          // Merge newly discovered items
          setImages((prev) => {
            const existingMap = new Map(prev.map((img) => [img.id, img]));
            report.images.forEach((img: VerifiedImage) => {
              existingMap.set(img.id, img);
            });
            return Array.from(existingMap.values());
          });
          setSaveStatus(
            `Discovery finished: Found ${report.total_discovered} candidates in ${report.duration_sec}s. Excellent: ${report.counts.EXCELLENT}, Good: ${report.counts.GOOD}, Review: ${report.counts.REVIEW}, Rejected: ${report.counts.REJECTED}.`
          );
        }
      }
    } catch (err) {
      console.error('Discovery search error:', err);
      setSaveStatus('Discovery failed due to network error.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyDirectUrl = async () => {
    if (!customUrl.trim()) return;
    setIsVerifyingUrl(true);
    setUrlVerifyError(null);
    try {
      const res = await fetch('/api/v1/gallery/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: customUrl.trim(),
          driver_name: driverName,
          team_name: teamName,
          thresholds: thresholds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        const verified = data.result;
        setImages((prev) => [verified, ...prev.filter((i) => i.id !== verified.id)]);
        setCustomUrl('');
        setSaveStatus(
          `URL verified: ${verified.resolution_label} (${verified.width}x${verified.height}) - Classified as ${verified.classification}.`
        );
      } else {
        setUrlVerifyError(data.detail || 'Verification rejected or failed.');
      }
    } catch (err) {
      setUrlVerifyError(`Verification error: ${err}`);
    } finally {
      setIsVerifyingUrl(false);
    }
  };

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = filteredImages.map((i) => i.id);
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Save via Directory Picker (File System Access API)
  const handleSaveToDirectory = async () => {
    const selectedList = images.filter((i) => selectedIds.has(i.id));
    if (selectedList.length === 0) {
      alert('Please select at least one image to download.');
      return;
    }

    if (!('showDirectoryPicker' in window)) {
      alert(
        'The Directory Picker API is not supported in this browser. Falling back to structured ZIP export with manifest.'
      );
      handleDownloadZip();
      return;
    }

    try {
      setSaveStatus('Waiting for folder selection...');
      // @ts-expect-error File System Access API
      const rootDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      
      let writtenCount = 0;
      setSaveStatus(`Beginning local write of ${selectedList.length} verified originals...`);

      for (const img of selectedList) {
        // Sanitize folder and file names
        const cleanTeam = img.team.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'Formula1';
        const cleanDriver = img.driver.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'Driver';
        const cleanTitle = img.title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'f1_image';
        const ext = (img.format || 'jpg').toLowerCase() === 'jpeg' ? 'jpg' : (img.format || 'jpg').toLowerCase();
        const filename = `${cleanTitle}.${ext}`;

        // Create team folder
        const teamDirHandle = await rootDirHandle.getDirectoryHandle(cleanTeam, { create: true });
        // Create driver folder
        const driverDirHandle = await teamDirHandle.getDirectoryHandle(cleanDriver, { create: true });

        // Retrieve verified bytes from original URL
        const resp = await fetch(img.original_url);
        if (!resp.ok) {
          throw new Error(`Failed to retrieve original bytes for ${filename}`);
        }
        const blob = await resp.blob();

        // Write file
        const fileHandle = await driverDirHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        writtenCount++;
        setSaveStatus(`Saved (${writtenCount}/${selectedList.length}): ${cleanTeam}/${cleanDriver}/${filename}`);
      }

      setSaveStatus(`Success! Confirmed browser write of ${writtenCount} verified UHD files organized by Driver and Team.`);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        setSaveStatus('Directory selection cancelled by user.');
      } else {
        console.error('Directory write error:', err);
        setSaveStatus(`Save error: ${(err as Error)?.message || err}. Consider using ZIP download.`);
      }
    }
  };

  // ZIP download fallback
  const handleDownloadZip = async () => {
    const selectedList = images.filter((i) => selectedIds.has(i.id));
    if (selectedList.length === 0) {
      alert('Please select at least one image to export.');
      return;
    }

    setSaveStatus('Generating structured ZIP archive on backend with manifest.json...');
    try {
      const res = await fetch('/api/v1/gallery/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apexops_f1_uhd_gallery_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSaveStatus(`Downloaded ZIP archive with ${selectedList.length} verified originals and manifest.json.`);
      } else {
        setSaveStatus('ZIP generation failed on backend.');
      }
    } catch (err) {
      console.error('ZIP download error:', err);
      setSaveStatus('ZIP download failed.');
    }
  };

  // Filter images according to active tab
  const filteredImages = images.filter((img) => {
    if (activeTab === 'ALL') return img.classification !== 'REJECTED';
    return img.classification === activeTab;
  });

  const countExcellent = images.filter((i) => i.classification === 'EXCELLENT').length;
  const countGood = images.filter((i) => i.classification === 'GOOD').length;
  const countReview = images.filter((i) => i.classification === 'REVIEW').length;
  const countRejected = images.filter((i) => i.classification === 'REJECTED').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Title & Mission Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1a202c] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-[#e10600]/10 border border-[#e10600]/30 rounded-lg text-[#e10600]">
              <ImageIcon className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Formula 1 UHD Image Discovery & Quality Verification
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold">
                  CV Verified
                </span>
              </h1>
              <p className="text-xs text-[#94a3b8] mt-1">
                Discover publicly accessible photography, retrieve genuine master originals, and verify resolution & visual clarity (Laplacian sharpness & 2D FFT spectral density).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompliance(!showCompliance)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12161f] hover:bg-[#1a2230] border border-[#2d3748] rounded text-xs font-medium text-[#cbd5e1] transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            Source Compliance
            {showCompliance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12161f] hover:bg-[#1a2230] border border-[#2d3748] rounded text-xs font-medium text-[#cbd5e1] transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f59e0b]" />
            CV Thresholds
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <a
            href="/api/v1/gallery/manifest"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12161f] hover:bg-[#1a2230] border border-[#2d3748] rounded text-xs font-medium text-[#cbd5e1] transition"
          >
            <FileText className="w-3.5 h-3.5 text-[#10b981]" />
            Download Manifest
          </a>
        </div>
      </div>

      {/* Honest Source Compliance & Licensing Audit Drawer */}
      {showCompliance && (
        <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
              Permitted Web Sources & Compliance Audit
            </h3>
            <span className="text-[11px] text-[#64748b]">
              Zero bypass of logins, paywalls, or CAPTCHAs &bull; SSRF Protected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sources.map((src, i) => (
              <div key={i} className="p-3 bg-[#161b22] border border-[#21262d] rounded text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{src.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      src.status === 'AVAILABLE'
                        ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                        : src.status === 'AVAILABLE_SELECTIVE'
                        ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                    }`}
                  >
                    {src.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#8b949e]">{src.details}</div>
                <div className="text-[10px] text-[#58a6ff] truncate">License: {src.license_compliance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CV Verification Thresholds Config Drawer */}
      {showConfig && (
        <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#f59e0b]" />
              Computer Vision & Quality Classification Thresholds
            </h3>
            <button
              onClick={() =>
                setThresholds({
                  uhd_min_width: 3840,
                  uhd_min_height: 2160,
                  sharpness_threshold_excellent: 110.0,
                  sharpness_threshold_good: 55.0,
                  sharpness_threshold_review: 20.0,
                  max_blockiness_ratio: 1.95,
                })
              }
              className="text-[11px] text-[#38bdf8] hover:underline"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[#8b949e] text-[11px] block">UHD Min Width (px)</label>
              <input
                type="number"
                value={thresholds.uhd_min_width}
                onChange={(e) => setThresholds({ ...thresholds, uhd_min_width: Number(e.target.value) })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-white text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-[11px] block">UHD Min Height (px)</label>
              <input
                type="number"
                value={thresholds.uhd_min_height}
                onChange={(e) => setThresholds({ ...thresholds, uhd_min_height: Number(e.target.value) })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-white text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-[11px] block">Sharpness (Excellent &ge;)</label>
              <input
                type="number"
                value={thresholds.sharpness_threshold_excellent}
                onChange={(e) =>
                  setThresholds({ ...thresholds, sharpness_threshold_excellent: Number(e.target.value) })
                }
                className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-white text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-[11px] block">Sharpness (Good &ge;)</label>
              <input
                type="number"
                value={thresholds.sharpness_threshold_good}
                onChange={(e) =>
                  setThresholds({ ...thresholds, sharpness_threshold_good: Number(e.target.value) })
                }
                className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-white text-xs mt-1"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#64748b]">
            Note: Automated Laplacian variance and 2D FFT spectral density measure edge energy and detect artificially upscaled/stretched thumbnails. An automated sharpness score does not replace human aesthetic judgment.
          </p>
        </div>
      )}

      {/* Discovery & Search Panel */}
      <div className="p-4 bg-[#11141c] border border-[#1e2533] rounded-xl space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            <div>
              <label className="text-[11px] font-semibold text-[#64748b] uppercase">Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Max Verstappen"
                className="w-full mt-1 bg-[#0b0e14] border border-[#2d3748] focus:border-[#e10600] rounded px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#64748b] uppercase">Team / Constructor</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Red Bull Racing"
                className="w-full mt-1 bg-[#0b0e14] border border-[#2d3748] focus:border-[#e10600] rounded px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#64748b] uppercase">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="w-full mt-1 bg-[#0b0e14] border border-[#2d3748] focus:border-[#e10600] rounded px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value={2026}>2026 Season</option>
                <option value={2025}>2025 Season</option>
                <option value={2024}>2024 Season</option>
                <option value={2023}>2023 Season</option>
                <option value={2022}>2022 Season</option>
                <option value={2021}>2021 Season</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#64748b] uppercase">Grand Prix (Optional)</label>
              <input
                type="text"
                value={grandPrix}
                onChange={(e) => setGrandPrix(e.target.value)}
                placeholder="Chinese GP / Monaco"
                className="w-full mt-1 bg-[#0b0e14] border border-[#2d3748] focus:border-[#e10600] rounded px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleDiscover}
              disabled={isSearching}
              className="w-full lg:w-auto px-5 py-2 bg-[#e10600] hover:bg-[#b00500] disabled:bg-[#5c1310] text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning Web & Verifying...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search & Verify Web Sources
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct URL Inspector Accordion */}
        <div className="pt-3 border-t border-[#1a202c]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Or paste any direct public image URL to verify UHD dimensions & clarity on backend..."
              className="flex-1 bg-[#0b0e14] border border-[#2d3748] rounded px-3 py-1.5 text-xs text-white outline-none"
            />
            <button
              onClick={handleVerifyDirectUrl}
              disabled={isVerifyingUrl || !customUrl.trim()}
              className="px-4 py-1.5 bg-[#1e2533] hover:bg-[#2b3548] disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {isVerifyingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              Verify URL
            </button>
          </div>
          {urlVerifyError && <div className="text-[11px] text-[#ff6b6b] mt-1">{urlVerifyError}</div>}
        </div>
      </div>

      {/* Status Banner */}
      {saveStatus && (
        <div className="p-3 bg-[#161f2e] border border-[#1e3a5f] rounded-lg text-xs text-[#38bdf8] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus(null)} className="text-[#64748b] hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Classification Filter Tabs & Selection Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1a202c] pb-3">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-[#1a2230] text-white border border-[#2d3748]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <span>Verified Candidates</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#2d3748] rounded-full text-white">
              {images.filter((i) => i.classification !== 'REJECTED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('EXCELLENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EXCELLENT'
                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                : 'text-[#94a3b8] hover:text-[#10b981] hover:bg-[#12161f]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Excellent</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#10b981]/30 rounded-full">{countExcellent}</span>
          </button>

          <button
            onClick={() => setActiveTab('GOOD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'GOOD'
                ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                : 'text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#12161f]'
            }`}
          >
            <span>Good</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#38bdf8]/30 rounded-full">{countGood}</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REVIEW'
                ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                : 'text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#12161f]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Review</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#f59e0b]/30 rounded-full">{countReview}</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REJECTED'
                ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                : 'text-[#64748b] hover:text-[#ef4444] hover:bg-[#12161f]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Audit / Rejected</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#ef4444]/30 rounded-full">{countRejected}</span>
          </button>
        </div>

        {/* Selection Actions */}
        <div className="flex items-center gap-2">
          {filteredImages.length > 0 && (
            <>
              <button
                onClick={selectAll}
                className="text-[11px] text-[#94a3b8] hover:text-white px-2 py-1 rounded hover:bg-[#1a2230] cursor-pointer"
              >
                Select All
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-[11px] text-[#94a3b8] hover:text-white px-2 py-1 rounded hover:bg-[#1a2230] cursor-pointer"
                >
                  Clear ({selectedIds.size})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Action Bar when images are selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-30 p-3 bg-[#111827]/95 backdrop-blur border border-[#374151] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#e10600] text-white text-[11px] font-bold flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-white">Images Selected</span>
            <span className="text-[11px] text-[#9ca3af]">
              Ready for verified local save organized by Driver & Team
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDirectory}
              className="px-3.5 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <FolderDown className="w-4 h-4" />
              Save to Local Folder (Directory Picker)
            </button>

            <button
              onClick={handleDownloadZip}
              className="px-3.5 py-1.5 bg-[#1f2937] hover:bg-[#374151] border border-[#4b5563] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#38bdf8]" />
              Download as ZIP Fallback
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#e10600]" />
          <span>Loading verified UHD gallery candidates...</span>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2d3748] rounded-xl text-xs text-[#64748b] space-y-2">
          <ImageIcon className="w-8 h-8 mx-auto text-[#475569]" />
          <p className="font-semibold text-white">No images found for this category</p>
          <p className="text-[11px]">
            Run a web search using the search bar above or verify an external image URL.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredImages.map((img) => {
            const isSelected = selectedIds.has(img.id);
            const isExcellent = img.classification === 'EXCELLENT';
            const isGood = img.classification === 'GOOD';
            const isReview = img.classification === 'REVIEW';
            const isRejected = img.classification === 'REJECTED';

            return (
              <div
                key={img.id}
                className={`bg-[#0e1118] border rounded-xl overflow-hidden flex flex-col transition hover:border-[#38bdf8]/50 shadow-md ${
                  isSelected ? 'border-[#e10600] ring-1 ring-[#e10600]' : 'border-[#1e2533]'
                }`}
              >
                {/* Image Preview with Badges */}
                <div className="relative aspect-video bg-[#05070a] overflow-hidden group">
                  <img
                    src={img.original_url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118] via-transparent to-black/60 pointer-events-none" />

                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(img.id)}
                    className={`absolute top-2.5 left-2.5 w-6 h-6 rounded flex items-center justify-center border cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#e10600] border-[#e10600] text-white'
                        : 'bg-black/60 border-white/40 text-transparent hover:border-white'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Classification Pill */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1 ${
                        isExcellent
                          ? 'bg-[#10b981] text-black'
                          : isGood
                          ? 'bg-[#38bdf8] text-black'
                          : isReview
                          ? 'bg-[#f59e0b] text-black'
                          : 'bg-[#ef4444] text-white'
                      }`}
                    >
                      {isExcellent && <Sparkles className="w-3 h-3" />}
                      {isReview && <AlertTriangle className="w-3 h-3" />}
                      {img.classification}
                    </span>
                  </div>

                  {/* Resolution & Dimension Pill */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/20">
                      {img.resolution_label} ({img.width} &times; {img.height})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/80 text-[#94a3b8] border border-white/10">
                      {img.orientation}
                    </span>
                  </div>

                  {/* Fullscreen Preview Trigger */}
                  <button
                    onClick={() => setPreviewImage(img)}
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-[#e10600] text-white transition cursor-pointer border border-white/20"
                    title="Inspect Full Original Resolution"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body & Provenance */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                      <span className="font-semibold text-[#e10600] truncate max-w-[150px]">{img.team}</span>
                      <span className="text-white font-medium">{img.driver}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1" title={img.title}>
                      {img.title}
                    </h4>

                    {img.description && (
                      <p className="text-[11px] text-[#8b949e] mt-1 line-clamp-2">{img.description}</p>
                    )}
                  </div>

                  {/* Computer Vision Metrics Chip */}
                  <div className="p-2.5 bg-[#080a0f] border border-[#1a202c] rounded text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Laplacian Sharpness:</span>
                      <span
                        className={`font-mono font-bold ${
                          img.metrics?.sharpness_laplacian >= 100
                            ? 'text-[#10b981]'
                            : img.metrics?.sharpness_laplacian >= 50
                            ? 'text-[#38bdf8]'
                            : 'text-[#f59e0b]'
                        }`}
                      >
                        {img.metrics?.sharpness_laplacian ?? 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">File Size & Format:</span>
                      <span className="text-[#cbd5e1] font-mono">
                        {img.file_size_mb} MB &bull; {img.format}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">JPEG Blockiness:</span>
                      <span className="text-[#cbd5e1] font-mono">
                        {img.metrics?.blockiness_ratio ?? 1.0} ratio
                      </span>
                    </div>

                    {img.reasons && img.reasons.length > 0 && (
                      <div className="pt-1 text-[9px] text-[#94a3b8] border-t border-[#161d2b]">
                        {img.reasons[0]}
                      </div>
                    )}
                  </div>

                  {/* Source & Attribution Footer */}
                  <div className="pt-2 border-t border-[#1a202c] flex items-center justify-between text-[10px] text-[#64748b]">
                    <div className="truncate max-w-[180px]">
                      <span className="text-white font-medium">{img.author}</span> &bull; {img.license}
                    </div>

                    <a
                      href={img.source_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#38bdf8] hover:underline flex items-center gap-1"
                    >
                      Source <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Original Resolution Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-[#2d3748] rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-3.5 bg-[#12161f] border-b border-[#1e2533] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {previewImage.title}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-bold">
                    {previewImage.resolution_label} ({previewImage.width} &times; {previewImage.height})
                  </span>
                </h3>
                <div className="text-[11px] text-[#94a3b8]">
                  {previewImage.driver} &bull; {previewImage.team} &bull; {previewImage.file_size_mb} MB
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewImage.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#1e2533] hover:bg-[#2b3548] text-white rounded text-xs flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Raw URL
                </a>

                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded text-[#94a3b8] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewer */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-auto p-2">
              <img
                src={previewImage.original_url}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>

            {/* Modal Details Footer */}
            <div className="p-3 bg-[#12161f] border-t border-[#1e2533] text-xs flex flex-wrap items-center justify-between gap-3 text-[#94a3b8]">
              <div>
                <span className="text-[#64748b]">SHA-256: </span>
                <span className="font-mono text-white text-[11px]">{previewImage.sha256}</span>
              </div>

              <div>
                <span className="text-[#64748b]">License: </span>
                <span className="text-white font-medium">{previewImage.license}</span> &bull; Author:{' '}
                <span className="text-white font-medium">{previewImage.author}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
