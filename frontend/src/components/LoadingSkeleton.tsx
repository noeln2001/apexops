import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ lines = 4, className = '' }) => {
  return (
    <div className={`space-y-4 animate-pulse p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl ${className}`}>
      <div className="h-6 bg-zinc-800/80 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-zinc-800/50 rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
};
