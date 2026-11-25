import React from 'react';
import { Film } from 'lucide-react';

export default function MediaPreview({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="clean-card p-3 sm:p-4 flex items-center gap-3">
      <div className="w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 flex items-center justify-center">
        {metadata.thumbnail ? (
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="w-5 h-5 text-zinc-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {metadata.title || 'Media Video'}
        </h3>
        <p className="text-xs text-zinc-400 capitalize mt-0.5">
          {metadata.platform} {metadata.duration ? `• ${metadata.duration}` : ''}
        </p>
      </div>
    </div>
  );
}
