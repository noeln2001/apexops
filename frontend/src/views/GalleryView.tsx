import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FolderDown,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_VERIFIED_GALLERY } from '../services/fallbackData';
import { ImageCard, ImageModal, SourceCompliancePanel } from './gallery';

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
  const { isAdmin } = useAuth();
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

  const DEFAULT_SOURCES: SourceCompliance[] = [
    {
      name: "Wikimedia Commons",
      homepage: "https://commons.wikimedia.org/",
      access_type: "PUBLIC_API_AND_ORIGINALS",
      license_compliance: "Creative Commons / Public Domain with full attribution",
      status: "AVAILABLE",
      details: "Full original UHD/5K photographic master files accessible with documented reuse permissions."
    },
    {
      name: "Red Bull Content Pool",
      homepage: "https://www.redbullcontentpool.com/",
      access_type: "AUTHENTICATED_EDITORIAL",
      license_compliance: "Editorial use only with accredited account",
      status: "LOGIN_RESTRICTED",
      details: "Public access restricted to web previews; original UHD master files require authenticated press credentials."
    },
    {
      name: "Formula 1 Official (formula1.com)",
      homepage: "https://www.formula1.com/",
      access_type: "WEB_EDITORIAL",
      license_compliance: "All rights reserved (FOM)",
      status: "RESTRICTED_WEB_PREVIEW_ONLY",
      details: "Public site serves web-optimized editorial banners and thumbnails; UHD raw photography is not offered as unrestricted public downloads."
    },
    {
      name: "McLaren Racing Downloads",
      homepage: "https://www.mclaren.com/racing/downloads/",
      access_type: "PUBLIC_DESKTOP_WALLPAPERS",
      license_compliance: "Personal non-commercial desktop wallpaper license",
      status: "AVAILABLE_SELECTIVE",
      details: "Offers official seasonal desktop wallpapers in HD/UHD formats for personal fan use."
    }
  ];

  const loadGalleryImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/gallery/images');
      if (res.ok) {
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          setImages(data.images);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Expected on static GitHub Pages
    }
    setImages(FALLBACK_VERIFIED_GALLERY as any);
    setLoading(false);
  };

  const loadSourceCompliance = async () => {
    try {
      const res = await fetch('/api/v1/gallery/sources');
      if (res.ok) {
        const data = await res.json();
        if (data.sources && data.sources.length > 0) {
          setSources(data.sources);
          return;
        }
      }
    } catch {}
    setSources(DEFAULT_SOURCES);
  };

  // Fetch images & sources on mount
  useEffect(() => {
    loadGalleryImages();
    loadSourceCompliance();
  }, []);

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
        <SourceCompliancePanel sources={sources} onClose={() => setShowCompliance(false)} />
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

            <div className="relative group">
              <button
                onClick={handleDownloadZip}
                disabled={!isAdmin}
                title={!isAdmin ? "Requires Administrator Authentication" : "Download verified images as ZIP"}
                className={`px-3.5 py-1.5 border rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                  isAdmin
                    ? 'bg-[#1f2937] hover:bg-[#374151] border-[#4b5563] text-white cursor-pointer'
                    : 'bg-[#12151b] border-[#232b38] text-[#64748b] cursor-not-allowed opacity-60'
                }`}
              >
                {isAdmin ? <Download className="w-4 h-4 text-[#38bdf8]" /> : <Lock className="w-4 h-4 text-[#64748b]" />}
                Download as ZIP
              </button>
              {!isAdmin && (
                <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block z-20 w-48 p-2 bg-[#0e1117] border border-[#2d3748] rounded text-[10px] text-[#ff8080] shadow-xl">
                  ZIP export requires Admin role. Use local folder save or log in.
                </div>
              )}
            </div>
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
          {filteredImages.map((img) => (
            <ImageCard
              key={img.id}
              image={img as any}
              isSelected={selectedIds.has(img.id)}
              onToggleSelect={toggleSelect}
              onPreview={setPreviewImage}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Original Resolution Preview Modal */}
      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};
