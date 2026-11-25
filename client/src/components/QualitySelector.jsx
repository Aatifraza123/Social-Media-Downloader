import React from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function QualitySelector({ formats = [], onDownload, isDownloading, activeFormatKey }) {
  if (!formats || formats.length === 0) return null;

  return (
    <div className="clean-card p-4 space-y-3">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
        Available Formats
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
        {formats.map((fmt, idx) => {
          const isAudio = fmt.mediaType === 'audio' || fmt.format === 'mp3';
          const label = fmt.label || fmt.quality || (isAudio ? 'MP3 Audio' : 'Video');
          const ext = fmt.format ? fmt.format.toUpperCase() : (isAudio ? 'MP3' : 'MP4');
          const key = fmt.formatId || `${fmt.quality}-${fmt.format}`;
          const isThisButtonSpinning = isDownloading && activeFormatKey === key;

          return (
            <div
              key={idx}
              className="py-2.5 px-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/[0.02] rounded-lg transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {ext} {fmt.fileSize ? `• ${(fmt.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
                </div>
              </div>

              <button
                type="button"
                disabled={isDownloading}
                onClick={() => onDownload(fmt)}
                className="btn-primary py-1.5 px-3.5 text-xs font-semibold gap-1.5"
              >
                {isThisButtonSpinning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
