import React from 'react';

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-6 animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
