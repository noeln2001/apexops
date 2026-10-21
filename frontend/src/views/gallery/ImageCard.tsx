import React from 'react';
import {
  Check,
  AlertTriangle,
  Sparkles,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { VerifiedImage } from './ImageModal';

export interface ImageCardProps {
  image: VerifiedImage & {
    orientation?: string;
    description?: string;
    metrics?: {
      sharpness_laplacian: number;
      blockiness_ratio?: number;
    };
    reasons?: string[];
  };
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (image: any) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  onToggleSelect,
  onPreview
}) => {
  const isExcellent = image.classification === 'EXCELLENT';
  const isGood = image.classification === 'GOOD';
  const isReview = image.classification === 'REVIEW';

  return (
    <div
      className={`bg-[#0e1118] border rounded-xl overflow-hidden flex flex-col transition hover:border-[#38bdf8]/50 shadow-md ${
        isSelected ? 'border-[#e10600] ring-1 ring-[#e10600]' : 'border-[#1e2533]'
      }`}
    >
      {/* Image Preview with Badges */}
      <div className="relative aspect-video bg-[#05070a] overflow-hidden group">
        <img
          src={image.original_url}
          alt={image.title}
          loading="lazy"
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118] via-transparent to-black/60 pointer-events-none" />

        {/* Checkbox */}
        <button
          onClick={() => onToggleSelect(image.id)}
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
            {image.classification}
          </span>
        </div>

        {/* Resolution & Dimension Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/20">
            {image.resolution_label} ({image.width} &times; {image.height})
          </span>
          {image.orientation && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/80 text-[#94a3b8] border border-white/10">
              {image.orientation}
            </span>
          )}
        </div>

        {/* Fullscreen Preview Trigger */}
        <button
          onClick={() => onPreview(image)}
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
            <span className="font-semibold text-[#e10600] truncate max-w-[150px]">{image.team}</span>
            <span className="text-white font-medium">{image.driver}</span>
          </div>

          <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1" title={image.title}>
            {image.title}
          </h4>

          {image.description && (
            <p className="text-[11px] text-[#8b949e] mt-1 line-clamp-2">{image.description}</p>
          )}
        </div>

        {/* Computer Vision Metrics Chip */}
        <div className="p-2.5 bg-[#080a0f] border border-[#1a202c] rounded text-[10px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">Laplacian Sharpness:</span>
            <span
              className={`font-mono font-bold ${
                (image.metrics?.sharpness_laplacian ?? 0) >= 100
                  ? 'text-[#10b981]'
                  : (image.metrics?.sharpness_laplacian ?? 0) >= 50
                  ? 'text-[#38bdf8]'
                  : 'text-[#f59e0b]'
              }`}
            >
              {image.metrics?.sharpness_laplacian ?? 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">File Size & Format:</span>
            <span className="text-[#cbd5e1] font-mono">
              {image.file_size_mb} MB &bull; {image.format}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">JPEG Blockiness:</span>
            <span className="text-[#cbd5e1] font-mono">
              {image.metrics?.blockiness_ratio ?? 1.0} ratio
            </span>
          </div>

          {image.reasons && image.reasons.length > 0 && (
            <div className="pt-1 text-[9px] text-[#94a3b8] border-t border-[#161d2b]">
              {image.reasons[0]}
            </div>
          )}
        </div>

        {/* Source & Attribution Footer */}
        <div className="pt-2 border-t border-[#1a202c] flex items-center justify-between text-[10px] text-[#64748b]">
          <div className="truncate max-w-[180px]">
            <span className="text-white font-medium">{image.author}</span> &bull; {image.license}
          </div>

          <a
            href={image.source_page}
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
};
