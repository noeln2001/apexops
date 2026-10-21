import React from 'react';
import { ExternalLink, X } from 'lucide-react';

export interface VerifiedImage {
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
  megapixels: number;
  resolution_label: string;
  classification: 'EXCELLENT' | 'GOOD' | 'REVIEW' | 'REJECTED';
  sharpness_score: number;
  clarity_score: number;
  noise_score: number;
  file_size_mb: number;
  format: string;
  license: string;
  author: string;
  sha256: string;
  is_verified_uhd: boolean;
  editorial_notes: string;
}

interface ImageModalProps {
  image: any;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e14] border border-[#2d3748] rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
        {/* Modal Header */}
        <div className="p-3.5 bg-[#12161f] border-b border-[#1e2533] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {image.title}
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-bold">
                {image.resolution_label} ({image.width} &times; {image.height})
              </span>
            </h3>
            <div className="text-[11px] text-[#94a3b8]">
              {image.driver} &bull; {image.team} &bull; {image.file_size_mb} MB
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={image.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-[#1e2533] hover:bg-[#2b3548] text-white rounded text-xs flex items-center gap-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Raw URL
            </a>

            <button
              onClick={onClose}
              className="p-1 rounded text-[#94a3b8] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Image Viewer */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-auto p-2">
          <img
            src={image.original_url}
            alt={image.title}
            className="max-h-[65vh] w-auto object-contain rounded"
          />
        </div>

        {/* Modal Details Footer */}
        <div className="p-3 bg-[#12161f] border-t border-[#1e2533] text-xs flex flex-wrap items-center justify-between gap-3 text-[#94a3b8]">
          <div>
            <span className="text-[#64748b]">SHA-256: </span>
            <span className="font-mono text-white text-[11px]">{image.sha256}</span>
          </div>

          <div>
            <span className="text-[#64748b]">License: </span>
            <span className="text-white font-medium">{image.license}</span> &bull; Author:{' '}
            <span className="text-white font-medium">{image.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
