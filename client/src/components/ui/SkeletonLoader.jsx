import React from 'react';

export function SkeletonCard() {
  return (
    <div className="minimal-card p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="minimal-card p-4 sm:p-5 animate-pulse space-y-2">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
