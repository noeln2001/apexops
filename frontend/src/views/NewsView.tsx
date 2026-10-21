import React, { useState, useEffect } from 'react';
import { fetchNews } from '../services/api';
import { Newspaper, ExternalLink, Tag } from 'lucide-react';

export const NewsView: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchNews().then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const filtered = categoryFilter === 'ALL'
    ? articles
    : articles.filter((a) => a.category.toUpperCase() === categoryFilter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-[#e10600]" />
            <span>Formula 1 Technical Intelligence & FIA Regulatory Bulletins</span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Verified syndicated motorsport journalism, stewarding decisions, and technical compliance reports with full source attribution</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 bg-[#12151b] border border-[#1f2530] rounded p-1 text-xs">
          {['ALL', 'TECHNICAL', 'REGULATIONS', 'RACE PREVIEW'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                categoryFilter === cat ? 'bg-[#e10600] text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Fetching motorsport news bulletins...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#12151b] border border-[#1f2530] hover:border-[#2a3447] rounded-lg p-5 flex flex-col justify-between space-y-3 transition"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#181d27]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#38bdf8] uppercase tracking-wider">{item.publisher}</span>
                    <span className="text-[#475569]">•</span>
                    <span className="text-[#94a3b8] font-mono">{item.published_at ? item.published_at.slice(0, 10) : 'Recent'}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-[#162a1e] text-[#4ade80] border border-[#1e462c] rounded font-semibold">
                    {item.confirmation_status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2.5 hover:text-[#38bdf8] transition leading-snug">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2">
                    <span>{item.headline}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-[#64748b]" />
                  </a>
                </h3>

                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-[#181d27] flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1.5 text-[#64748b]">
                  <Tag className="w-3 h-3 text-[#38bdf8]" />
                  <span>{item.entity_tags}</span>
                </div>
                <div className="font-mono text-[#10b981]">
                  Reliability: {(item.reliability_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
